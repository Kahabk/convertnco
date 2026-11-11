/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Route, Routes } from 'react-router-dom';
import PolaroidTrailHero from './components/PolaroidTrailHero';
import PostHeroSections from './components/PostHeroSections';
import TermsAndConditions from './pages/TermsAndCondition';
import CroAudit from './pages/CroAudit';
import AuthPage from './pages/AuthPage';

function HomePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#ffffff] selection:text-black">
      <PolaroidTrailHero />
      <PostHeroSections />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/"                   element={<HomePage />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/cro-audit"          element={<CroAudit />} />
      <Route path="/auth"               element={<AuthPage />} />
      {/* Legacy / alias routes */}
      <Route path="/sign-in"            element={<AuthPage />} />
      <Route path="/sign-up"            element={<AuthPage />} />
    </Routes>
  );
}
