/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import PolaroidTrailHero from "./components/PolaroidTrailHero";
import PostHeroSections from "./components/PostHeroSections";
import { Route, Routes } from "react-router-dom";
import TermsAndConditions from "./pages/TermsAndCondition";

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
      <Route path="/" element={<HomePage />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
    </Routes>
  );
}
