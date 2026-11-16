import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import type { CSSProperties } from "react";
import { caseStudies, expectedCaseStudyImages, getCaseStudy, type CaseStudy as CaseStudyData, type CaseStudyImage } from "../data/caseStudies";
import "./Work.css";

const siteUrl = "https://www.convertandco.com";
const caseStudyAssets = import.meta.glob("../../k_stady/**/*.png", { eager: true, import: "default", query: "?url" }) as Record<string, string>;
const assetUrl = (path: string) => caseStudyAssets[`../../${path}`];

function useWorkEffects() {
  useEffect(() => {
    const revealItems = document.querySelectorAll<HTMLElement>(".work-reveal");
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    }), { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));

    if (import.meta.env.DEV) {
      const bundledPaths = Object.keys(caseStudyAssets).map((path) => path.replace("../../", ""));
      const usedPaths = caseStudies.flatMap((study) => [study.hero.path, ...study.sections.map((section) => section.path)]);
      const missing = expectedCaseStudyImages.filter((path) => !bundledPaths.includes(path));
      const unused = bundledPaths.filter((path) => path.startsWith("k_stady/") && !usedPaths.includes(path));
      const duplicated = usedPaths.filter((path, index) => usedPaths.indexOf(path) !== index);
      if (missing.length || unused.length || duplicated.length || usedPaths.length !== expectedCaseStudyImages.length) {
        console.warn("[case studies] Image inventory mismatch", { missing, unused, duplicated, expected: expectedCaseStudyImages.length, used: usedPaths.length });
      }
    }
    return () => observer.disconnect();
  }, []);
}

function Seo({ study }: { study?: CaseStudyData }) {
  const path = study ? `/work/${study.slug}` : "/work";
  const title = study ? `${study.name} Case Study | Convert & Co` : "Ecommerce UI Design Work | Convert & Co";
  const description = study ? study.description : "Explore ecommerce UI design and mobile commerce UX case studies from Convert & Co, with clear, conversion-focused customer journeys.";
  const structuredData = study ? {
    "@context": "https://schema.org", "@graph": [
      { "@type": ["CreativeWork", "Article"], headline: `${study.name} ecommerce UI design case study`, description, url: `${siteUrl}${path}`, author: { "@type": "Organization", name: "Convert & Co" } },
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Work", item: `${siteUrl}/work` }, { "@type": "ListItem", position: 3, name: study.name, item: `${siteUrl}${path}` }] }
    ]
  } : { "@context": "https://schema.org", "@type": "CollectionPage", name: "Convert & Co ecommerce UI design work", description, url: `${siteUrl}/work`, mainEntity: { "@type": "ItemList", itemListElement: caseStudies.map((item, position) => ({ "@type": "ListItem", position: position + 1, name: item.name, url: `${siteUrl}/work/${item.slug}` })) } };
  return <Helmet>
    <title>{title}</title><meta name="description" content={description} /><link rel="canonical" href={`${siteUrl}${path}`} />
    <meta property="og:type" content={study ? "article" : "website"} /><meta property="og:title" content={title} /><meta property="og:description" content={description} /><meta property="og:url" content={`${siteUrl}${path}`} /><meta property="og:image" content={`${siteUrl}/og-image.png`} />
    <meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content={title} /><meta name="twitter:description" content={description} /><meta name="twitter:image" content={`${siteUrl}/og-image.png`} />
    <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
  </Helmet>;
}

function WorkHeader() {
  return <header className="workNav"><Link className="workBrand" to="/" aria-label="Convert and Co home">Convert<span>&amp;</span>Co</Link><nav aria-label="Primary navigation"><Link to="/work">All work</Link><a href="/#services">Services</a><a href="/#contact">Start a project</a></nav></header>;
}

function CatalogueArtwork({ study }: { study: CaseStudyData }) {
  return <svg className="catalogueArtwork" viewBox="0 0 900 580" role="img" aria-label={`Abstract ${study.name} project artwork`}><rect width="900" height="580" fill="#ffffff" rx="34" /><path d="M70 460C190 310 295 510 420 360S630 170 830 280" fill="none" stroke="#151515" strokeWidth="2" opacity=".28" /><text x="65" y="130" fill="#151515" fontFamily="Inter, sans-serif" fontSize="20" fontWeight="700" letterSpacing="5">{study.number} / 04</text><text x="65" y="325" fill="#151515" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="104" fontStyle="italic">{study.name}</text></svg>;
}

function CaseImage({ image, hero = false }: { image: CaseStudyImage; hero?: boolean }) {
  return <img src={assetUrl(image.path)} width={image.width} height={image.height} alt={image.alt} loading={hero ? "eager" : "lazy"} decoding="async" fetchPriority={hero ? "high" : "auto"} />;
}

function Stage({ image, hero = false }: { image: CaseStudyImage; hero?: boolean }) {
  return <div className={`caseStage ${hero ? "caseStage--hero" : ""}`}><CaseImage image={image} hero={hero} /></div>;
}

export function WorkCatalogue() {
  useWorkEffects();
  return <div className="workPage"><Seo /><WorkHeader /><main>
    <section className="catalogueHero" aria-labelledby="work-title"><p className="workEyebrow">Selected work · 2026</p><h1 id="work-title">Stores designed to <em>move</em> people.</h1><p>We shape ecommerce UI design around the moments that make a customer pause, compare and act. These mobile commerce UX case studies show how a clear visual system can carry a distinct brand while making product discovery and purchase feel straightforward.</p></section>
    <section className="catalogueGrid" aria-labelledby="selected-work"><h2 id="selected-work" className="srOnly">Selected portfolio work</h2>{caseStudies.map((study) => <article className="catalogueCard work-reveal" key={study.slug}><Link to={`/work/${study.slug}`} aria-label={`Read the ${study.name} case study`}><CatalogueArtwork study={study} /><div className="catalogueCard__copy"><p>{study.number} · {study.category}</p><h3>{study.name}</h3><span>{study.summary}</span><b>Read case study <i>↗</i></b></div></Link></article>)}</section>
    <footer className="workCta" aria-labelledby="work-cta"><p className="workEyebrow">Start a project</p><h2 id="work-cta">Have a store that needs to convert <em>better?</em></h2><a href="/#contact">Start a project <span>↗</span></a></footer>
  </main></div>;
}

function Breadcrumbs({ study }: { study: CaseStudyData }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/work">Work</Link><span>/</span><span aria-current="page">{study.name}</span></nav>;
}

function ScreenSection({ study, image, number }: { study: CaseStudyData; image: CaseStudyImage; number: number }) {
  const sectionId = `${study.slug}-screen-${number}`;
  const isPalette = image.path.endsWith("ColorPalette.png");
  const isWideSystemImage = image.path.endsWith("image 4 (1).png");
  return <section className={`screenSection work-reveal ${isWideSystemImage ? "screenSection--wide-image" : ""}`} aria-labelledby={sectionId}><div className="screenSection__copy"><p className="workEyebrow">{image.label}</p><h2 id={sectionId}>{image.title}</h2><p>{image.paragraphs[0]}</p><p>{image.paragraphs[1]}</p>{isPalette && study.palette && <ul className="paletteSwatches" aria-label="Wink Home colour swatches">{study.palette.map((colour) => <li key={colour.hex}><i style={{ backgroundColor: colour.hex }} /><span>{colour.name}<small>{colour.hex}</small></span></li>)}</ul>}</div><Stage image={image} /></section>;
}

export function CaseStudy() {
  useWorkEffects();
  const study = getCaseStudy(useParams().slug);
  if (!study) return <div className="workPage"><WorkHeader /><main className="workMissing"><p className="workEyebrow">404</p><h1>This case study is still in the studio.</h1><Link to="/work">Return to all work</Link></main></div>;
  const next = caseStudies[(caseStudies.indexOf(study) + 1) % caseStudies.length];
  const isCinematicHero = study.hero.path.endsWith("Frame 427320760 (1).png");
  return <div className="workPage caseStudy"><Seo study={study} /><WorkHeader /><main>
    <header className="caseHero" aria-labelledby="case-title"><Breadcrumbs study={study} /><div className="caseHero__copy"><p className="workEyebrow">{study.category}</p><h1 id="case-title">{study.name}</h1><p>{study.summary}</p></div><dl className="caseMeta">{Object.entries(study.meta).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></header>
    <section className={`heroImageSection ${isCinematicHero ? "heroImageSection--cinematic" : ""}`} aria-labelledby="hero-image-title"><div className="heroImageSection__copy"><p className="workEyebrow">{study.hero.label}</p><h2 id="hero-image-title">{study.hero.title}</h2><p>{study.hero.paragraphs[0]}</p><p>{study.hero.paragraphs[1]}</p>{study.heroContext?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><Stage image={study.hero} hero /></section>
    {study.sections.map((image, index) => <ScreenSection key={image.path} study={study} image={image} number={index + 1} />)}
    <section className="deliverySection work-reveal" aria-labelledby="delivery-title"><div><p className="workEyebrow">Delivery approach</p><h2 id="delivery-title">A clear route from screen to <em>storefront.</em></h2><p>{study.delivery}</p></div></section>
    <section className="nextProject" aria-labelledby="next-title"><p className="workEyebrow">Next case study</p><Link to={`/work/${next.slug}`}><span>{next.number} / 04</span><h2 id="next-title">{next.name}</h2><b>Explore the {next.name} case study ↗</b></Link></section>
    <footer className="workCta" aria-labelledby="case-cta"><p className="workEyebrow">Start a project</p><h2 id="case-cta">Have a store that needs to convert <em>better?</em></h2><a href="/#contact">Start a project <span>↗</span></a></footer>
  </main></div>;
}
