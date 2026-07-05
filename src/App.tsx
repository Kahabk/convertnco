/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import PolaroidTrailHero from "./components/PolaroidTrailHero";
import PostHeroSections from "./components/PostHeroSections";

export default function App() {
  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#ffffff] selection:text-black">
      <PolaroidTrailHero />
      <PostHeroSections />
    </div>
  );
}
