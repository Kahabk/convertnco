/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import PolaroidTrailHero from './components/PolaroidTrailHero';

const PostHeroSections = lazy(() => import('./components/PostHeroSections'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndCondition'));
const CroAudit = lazy(() => import('./pages/CroAudit'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const WorkExperience = lazy(() =>
  import('./pages/Work').then((module) => ({ default: module.WorkExperience })),
);
const WorkCatalogue = lazy(() =>
  import('./pages/Work').then((module) => ({ default: module.WorkCatalogue })),
);

function DeferredSection({
  children,
  id,
  minHeight = '100vh',
}: {
  children: ReactNode;
  id?: string;
  minHeight?: string;
}) {
  const boundaryRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const boundary = boundaryRef.current;
    if (!boundary || typeof IntersectionObserver === 'undefined') {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(boundary);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={boundaryRef} id={id} style={{ minHeight }}>
      {shouldRender ? <Suspense fallback={null}>{children}</Suspense> : null}
    </div>
  );
}

function PageFallback() {
  return <div aria-hidden="true" style={{ minHeight: '100vh', background: '#000000' }} />;
}

function HomePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#ffffff] selection:text-black">
      <PolaroidTrailHero />
      <main>
        <DeferredSection id="works" minHeight="100vh">
          <WorkExperience embedded sections="gallery" />
        </DeferredSection>
        <Suspense fallback={null}>
          <PostHeroSections
            showPortfolio={false}
            afterLogo={<WorkExperience embedded sections="hero" />}
          />
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/"                   element={<HomePage />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/cro-audit"          element={<CroAudit />} />
          <Route path="/auth"               element={<AuthPage />} />
          <Route path="/admin"              element={<AdminPage />} />
          <Route path="/work"               element={<WorkCatalogue />} />
          {/* Legacy / alias routes */}
          <Route path="/sign-in"            element={<AuthPage />} />
          <Route path="/sign-up"            element={<AuthPage />} />
        </Routes>
      </Suspense>
    </HelmetProvider>
  );
}
