import { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useAuth } from '../lib/useAuth';
import { logout } from '../lib/firebase';
import { startAudit, getAudit, processNext } from '../lib/auditApi';
import ThoughtLine from '../components/ThoughtLine';
import AuditPromptBar from '../components/AuditPromptBar';
import GradientASCII from '../components/GradientASCII';
import PricingModal from '../components/PricingModal';
import '../components/GradientASCII.css';
import CROVisualizationSection from '../components/cro/CROVisualizationSection';
import './CroAudit.css';

type AuditHistoryItem = { id: string; url: string; createdAt: string; status?: string };
const HISTORY_KEY = 'cro-audit-history';
const PRICING_SEEN_KEY = 'cro-pricing-offer-seen';
const THINKING_STAGES = [
  'Starting your CRO audit…',
  'Reading the page structure…',
  'Checking first impressions…',
  'Reviewing desktop and mobile…',
  'Finding conversion opportunities…',
  'Writing useful recommendations…'
];

function normaliseWebsiteUrl(value: string): string {
  let candidate = value.trim().replace(/\\:/g, ':');
  const markdownUrl = candidate.match(/\]\((https?:\/\/[^\s)]+)\)/i);
  if (markdownUrl) candidate = markdownUrl[1];
  if (!/^https?:\/\//i.test(candidate)) candidate = `https://${candidate}`;

  const parsed = new URL(candidate);
  if (!parsed.hostname || /[\[\]]/.test(parsed.hostname)) throw new Error('Enter a valid website URL, for example https://example.com');
  parsed.hash = '';
  return parsed.toString();
}

function shortUrl(value: string) {
  try { return new URL(value).hostname.replace(/^www\./, ''); } catch { return value; }
}

function friendlyPageError(error: string) {
  if (/AI analysis quota/i.test(error)) return 'The configured AI provider has no remaining quota. Add available Gemini quota or an OpenRouter fallback, then start a new audit.';
  if (/Gemini|OpenRouter|AI provider|resource.?exhausted/i.test(error)) return 'Our AI analysis service is temporarily busy. Please run the audit again in a moment.';
  if (/\b429\b/i.test(error)) return 'This website is temporarily limiting automated requests. Please try again in a few minutes.';
  if (/\b503\b|high demand|unavailable/i.test(error)) return 'The AI service is busy. Please try the audit again shortly.';
  if (/timeout|aborted/i.test(error)) return 'This website took too long to respond. Please try again shortly.';
  return 'We could not analyse this page. Please check the URL and try again.';
}

function friendlyStartError(error: string) {
  if (/host not allowed|private|localhost|\.local|\.internal/i.test(error)) {
    return 'Public websites only. We never audit private or local addresses.';
  }
  return error;
}

export default function CroAudit() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [url, setUrl] = useState('');
  const [data, setData] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<AuditHistoryItem[]>([]);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [pricingLimitReached, setPricingLimitReached] = useState(false);
  const showIntro = !running && !data;
  const [introMounted, setIntroMounted] = useState(showIntro);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const prevShowIntro = useRef(showIntro);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      if (Array.isArray(saved)) setHistory(saved.filter((item) => item?.id && item?.url).slice(0, 12));
    } catch { /* Ignore malformed browser storage. */ }
  }, []);

  useEffect(() => {
    const sharedUrl = new URLSearchParams(location.search).get('url');
    if (sharedUrl && !url) setUrl(sharedUrl);
  }, [location.search, url]);

  useEffect(() => {
    if (showIntro) {
      setIntroMounted(true);
      setIsTransitioning(false);
    } else if (prevShowIntro.current && !showIntro) {
      setIsTransitioning(true);
      const duration = prefersReducedMotion ? 150 : 700;
      const timer = window.setTimeout(() => {
        setIsTransitioning(false);
        setIntroMounted(false);
      }, duration);
      return () => window.clearTimeout(timer);
    }
    prevShowIntro.current = showIntro;
  }, [showIntro, prefersReducedMotion]);

  useEffect(() => {
    if (!running) {
      setThinkingStep(0);
      setThinkingSeconds(0);
      return undefined;
    }
    let seconds = 0;
    const timer = window.setInterval(() => {
      seconds += 1;
      setThinkingSeconds(seconds);
      if (seconds % 5 === 0) setThinkingStep((step) => Math.min(step + 1, THINKING_STAGES.length - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMedia = () => {
      setIsMobile(mobileQuery.matches);
      setPrefersReducedMotion(reducedMotionQuery.matches);
    };

    syncMedia();
    mobileQuery.addEventListener('change', syncMedia);
    reducedMotionQuery.addEventListener('change', syncMedia);
    return () => {
      mobileQuery.removeEventListener('change', syncMedia);
      reducedMotionQuery.removeEventListener('change', syncMedia);
    };
  }, []);

  function saveToHistory(item: AuditHistoryItem) {
    setHistory((current) => {
      const next = [item, ...current.filter((entry) => entry.id !== item.id)].slice(0, 12);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function run(id: string, websiteUrl: string) {
    setRunning(true);
    try {
      let done = false;
      while (!done) {
        const r = await processNext(id);
        done = Boolean(r?.done);
        if (typeof r?.retryAfterMs === 'number' && r.retryAfterMs > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, r.retryAfterMs));
        }
        const auditData = await getAudit(id);
        setData(auditData);
        if (done) break;
      }
      const finalData = await getAudit(id);
      setData(finalData);
      saveToHistory({ id, url: websiteUrl, createdAt: new Date().toISOString(), status: finalData?.audit?.status });
      return finalData?.audit?.status === 'complete';
    } catch (e: any) {
      setError(e?.message || 'Error processing audit');
      return false;
    } finally {
      setRunning(false);
    }
  }

  async function beginAudit(websiteUrl: string, offerPricingAfter = false) {
    setPricingOpen(false);
    setError('');
    setData(null);
    setRunning(true);
    try {
      setUrl(websiteUrl);
      const res = await startAudit(websiteUrl);
      if (!res?.id) throw new Error(res?.error || 'Failed to start audit');
      const initialData = await getAudit(res.id);
      setData(initialData);
      saveToHistory({ id: res.id, url: websiteUrl, createdAt: new Date().toISOString(), status: initialData?.audit?.status || 'processing' });
      const completed = await run(res.id, websiteUrl);
      if (offerPricingAfter && completed) {
        sessionStorage.setItem(PRICING_SEEN_KEY, 'true');
        setPricingLimitReached(false);
        setPricingOpen(true);
      }
    } catch (e: any) {
      const message = e?.message || 'Failed to start audit';
      if (/\blimit reached\b/i.test(message)) {
        setError('');
        setPricingLimitReached(true);
        setPricingOpen(true);
      } else {
        setError(friendlyStartError(message));
      }
      setRunning(false);
    }
  }

  async function onStart() {
    if (running || isTransitioning) return;
    setError('');
    setData(null);
    let websiteUrl: string;
    try {
      websiteUrl = normaliseWebsiteUrl(url);
    } catch (e: any) {
      setError(e?.message || 'Failed to start audit');
      return;
    }

    if (!user) {
      navigate(`/auth?returnTo=${encodeURIComponent('/cro-audit')}&url=${encodeURIComponent(websiteUrl)}`);
      return;
    }

    const shouldOfferPricing = !sessionStorage.getItem(PRICING_SEEN_KEY);
    await beginAudit(websiteUrl, shouldOfferPricing);
  }

  async function openHistory(item: AuditHistoryItem) {
    if (running || isTransitioning) return;
    setError('');
    setUrl(item.url);
    try {
      setData(await getAudit(item.id));
    } catch (e: any) {
      setError(e?.message || 'We could not reopen this audit.');
    }
  }

  function newAudit() {
    if (running || isTransitioning) return;
    setData(null);
    setError('');
    setUrl('');
  }

  if (loading) {
    return (
      <div className="croContainer">
        <div className="cro">
          <div className="croLoading">
            <div className="croSpinner" />
            <p>Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  const pages: any[] = Array.isArray(data?.pages) ? data.pages : [];
  const audit = data?.audit;
  const topPriorities: any[] = Array.isArray(audit?.summary?.top_priorities) ? audit.summary.top_priorities : [];
  const transitionConfig = prefersReducedMotion
    ? { duration: 0.15, ease: 'linear' as const }
    : { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

  return (
    <div className={`croContainer${showIntro ? ' isIntro' : ''}${isTransitioning ? ' isTransitioning' : ''}`}>
      {introMounted && (
        <div
          className="croIntroCanvasWrap"
          style={{
            opacity: showIntro ? 1 : 0,
            transition: prefersReducedMotion ? 'opacity 150ms linear' : 'opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          aria-hidden={!showIntro}
        >
          <GradientASCII
            colors={["#1e3fd8", "#f6f8ff", "#a5d8ff", "#38bdf8"]}
            shape="horizon"
            characters=" =+xX0S8#@"
            cellSize={isMobile ? 14 : 18}
            density={0.8}
            glyphOpacity={0.85}
            glow={0.2}
            depthOfField={0}
            flicker={prefersReducedMotion ? 0 : 0.2}
            softness={0.5}
            scale={1}
            flow={0.5}
            speed={prefersReducedMotion ? 0 : 1}
            gradientOpacity={0.9}
            grain={0.08}
            variation={0}
            mouseInteraction
            scrambleRadius={0.1}
            clickEffect="wave"
            intro
            lightMode={false}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}

      <div className="cro">
        {/* Header */}
        <header className="croTopBar">
          <Link to="/" className="croBackLink">← Home</Link>
          {user ? (
            <button className="ghost" onClick={logout}>Sign out ({user.displayName || user.email})</button>
          ) : (
            <Link to="/auth?returnTo=%2Fcro-audit" className="croSignInLink">Sign in</Link>
          )}
        </header>

        <div className="croWorkspace">
          <aside className="croHistory" aria-label="Previous audits">
            <button className="croNewAudit" type="button" onClick={newAudit} disabled={running || isTransitioning}>
              + New audit
            </button>
            <span className="croHistoryLabel">Previous audits</span>
            {history.length ? (
              <div className="croHistoryList">
                {history.map((item) => (
                  <button
                    className="croHistoryItem"
                    type="button"
                    key={item.id}
                    onClick={() => openHistory(item)}
                    disabled={running || isTransitioning}
                  >
                    <span>{shortUrl(item.url)}</span>
                    <small>{new Date(item.createdAt).toLocaleDateString()}</small>
                  </button>
                ))}
              </div>
            ) : (
              <p className="croHistoryEmpty">Your completed audits will appear here.</p>
            )}
          </aside>

          <main className="croChat">
            <motion.section layout className="croHero" transition={transitionConfig}>
              <motion.h1 layout="position" className="croHeroTitle" transition={transitionConfig}>
                Website CRO Audit
              </motion.h1>
              <motion.p layout="position" className="croHeroSubtitle" transition={transitionConfig}>
                Get a clear desktop and mobile review, with practical fixes your team can act on straight away.
              </motion.p>
            </motion.section>

            {running && (
              <div className="croInlineThinking" aria-label="Audit progress">
                <ThoughtLine
                  working={running}
                  steps={['Checking the page experience', 'Reviewing desktop and mobile', 'Preparing conversion recommendations']}
                  label={`Thinking — ${THINKING_STAGES[thinkingStep]}`}
                  doneLabel="Thought for"
                  glyph="sparkle"
                  fontSize={14}
                  breathPeriod={1.6}
                  breathDepth={0.45}
                  settleDuration={350}
                  settleBlur={2}
                  collapsible
                  collapseOnSettle
                  showTimer
                />
                {thinkingSeconds >= 10 && (
                  <div className="croDelayedProgress" role="status">
                    <span>CRO audit is still running — this can take a minute for detailed pages.</span>
                    <i aria-hidden="true" />
                  </div>
                )}
              </div>
            )}

            <motion.div layout className="croPromptWrap" transition={transitionConfig}>
              <AuditPromptBar value={url} busy={running || isTransitioning} onChange={setUrl} onSend={onStart} />
              <p className="croInputHint">Public websites only. We never audit private or local addresses.</p>
            </motion.div>
            {audit?.status === 'failed' && <p className="err">We could not complete this audit. Please try again shortly.</p>}

            {/* Overall result */}
            {audit?.status === 'complete' && (
              <div className="card croSummaryCard">
                <div className="croSummaryTop">
                  <div>
                    <div className="scoreLabel">Overall CRO Score</div>
                    <div className="score">
                      {audit.overall_score ?? 0}
                      <span className="muted" style={{ fontSize: 18 }}>/100</span>
                    </div>
                  </div>
                  <span className="croStatus complete">Complete</span>
                </div>
                <p>{audit.summary?.executive_summary}</p>
                {topPriorities.map((p: any, i: number) => (
                  <div className="finding" key={i}>
                    <b>{i + 1}. {p?.title || 'Finding'}</b>{' '}
                    <span className="muted">
                      (impact: {p?.impact ?? '-'}, effort: {p?.effort ?? '-'})
                    </span>
                    <div>{p?.why}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Per-page results */}
            {pages.map((p) => {
              if (!p) return null;
              const findings: any[] = Array.isArray(p.analysis?.findings) ? p.analysis.findings : [];
              return (
                <article className="card croPageCard" key={p.id || p.url}>
                  <div className="croPageHeader">
                    <div>
                      <b>{p.title || shortUrl(p.url)}</b>
                      <a className="croUrl" href={p.url} target="_blank" rel="noreferrer">{p.url}</a>
                    </div>
                    <span className={`croStatus ${p.status}`}>{p.status}</span>
                  </div>
                  {p.error && <div className="err"><b>Page could not be analysed.</b><br />{friendlyPageError(p.error)}</div>}
                  {p.analysis && (
                    <>
                      <div className="score" style={{ fontSize: 28 }}>
                        {p.analysis.score ?? 0}/100
                      </div>
                      {(p.desktopUrl || p.mobileUrl) && (
                        <div className="shots">
                          {p.desktopUrl && (
                            <img
                              src={p.desktopUrl}
                              alt="desktop"
                              width={420}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                          {p.mobileUrl && (
                            <img
                              src={p.mobileUrl}
                              alt="mobile"
                              width={140}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          )}
                        </div>
                      )}
                      {findings.map((f: any, i: number) => (
                        <div className="finding" key={i}>
                          <span className={`sev ${f?.severity || 'low'}`}>{f?.severity || 'info'}</span>{' '}
                          <b>{f?.issue}</b>
                          {f?.evidence && <div className="muted">Seen: {f.evidence}</div>}
                          {f?.recommendation && <div>Fix: {f.recommendation}</div>}
                        </div>
                      ))}
                      <CROVisualizationSection
                        visualizations={p.analysis.croVisualizations}
                        desktopUrl={p.desktopUrl}
                        mobileUrl={p.mobileUrl}
                      />
                    </>
                  )}
                </article>
              );
            })}
          </main>
        </div>
      </div>
      <PricingModal
        open={pricingOpen}
        onClose={() => setPricingOpen(false)}
        pricingLimitReached={pricingLimitReached}
      />
      {error && (
        <div className="auditErrorOverlay" role="alertdialog" aria-modal="true" aria-labelledby="audit-error-title" aria-describedby="audit-error-message">
          <div className="auditErrorPopup">
            <button className="auditErrorClose" type="button" onClick={() => setError('')} aria-label="Close message"><X size={17} /></button>
            <span className="auditErrorMark" aria-hidden="true">!</span>
            <h2 id="audit-error-title">Unable to start audit</h2>
            <p id="audit-error-message">{error}</p>
            <button className="auditErrorAction" type="button" onClick={() => setError('')}>Try another website</button>
          </div>
        </div>
      )}
    </div>
  );
}
