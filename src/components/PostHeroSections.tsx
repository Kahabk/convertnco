import "./PostHeroSections.css";

const FEATURE_IMAGE = new URL(
  "../../new.jpg",
  import.meta.url,
).href;

const PROJECTS = [
  {
    image: new URL("../../imgeasset/d47032c62e93f8abb0f2ad4f08965fce.jpg", import.meta.url).href,
    title: "Shopify Growth Engine",
    category: "Store design · Development · CRO",
  },
  {
    image: new URL("../../imgeasset/fecb7ff6829c90de6d7872ff64acc900.jpg", import.meta.url).href,
    title: "AI Product Launch",
    category: "Creative · Paid media · Automation",
  },
];

const LOGOS = [
  "Group 129.png",
  "Group 137.png",
  "Group 138.png",
  "Group 139.png",
  "Group 141.png",
  "Group 142.png",
  "Group 143.png",
  "Group 144.png",
].map((fileName) => new URL(`../../logos/${fileName}`, import.meta.url).href);

const STORY_IMAGE = new URL(
  "../../imgeasset/2b8cce776b5f51248b9e159e2f7d3245.jpg",
  import.meta.url,
).href;

const SERVICES = [
  ["01", "Shopify websites", "Premium storefronts engineered for conversion and scale"],
  ["02", "AI automation", "Intelligent workflows for leads, support, operations and retention"],
  ["03", "Product advertising", "Scroll-stopping creative built to turn attention into demand"],
  ["04", "Digital marketing", "Paid media, CRO and lifecycle campaigns connected to revenue"],
];

const PROCESS = [
  ["01", "Discover", "We uncover the offer, audience and biggest growth opportunities."],
  ["02", "Design", "We shape a premium experience around clarity, trust and conversion."],
  ["03", "Build", "We develop the storefront and connect the automation behind it."],
  ["04", "Scale", "We launch campaigns, learn from data and improve continuously."],
];

export default function PostHeroSections() {
  return (
    <main className="postHero">
      <section className="featureSection" id="works">
        <div className="featureMedia">
          <img src={FEATURE_IMAGE} alt="Featured creative campaign" />
          <a className="featureButton" href="#selected-work" aria-label="View selected work">
            <span>View</span>
            <span className="featureArrow">↘</span>
          </a>
        </div>

        <div className="featureIntro">
          <p className="sectionKicker">Shopify · AI · Growth</p>
          <h2>Digital systems that sell.</h2>
          <p className="featureCopy">
            We build premium Shopify stores, automate the work behind them and create marketing that turns products into growth.
          </p>
        </div>
      </section>

      <section className="projectsSection" id="selected-work">
        <header className="projectsHeader">
          <p className="sectionKicker">Recent work</p>
          <p>Commerce, automation and campaigns<br />built as one connected system.</p>
        </header>

        <div className="projectGrid">
          {PROJECTS.map((project, index) => (
            <article className="projectCard" key={project.title}>
              <div className="projectImageWrap">
                <img src={project.image} alt={project.title} />
                <span className="projectNumber">0{index + 2}</span>
              </div>
              <div className="projectMeta">
                <h3>{project.title}</h3>
                <p>{project.category}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="logoSection" id="clients" aria-label="Selected clients">
        <div className="logoSectionIntro">
          <p className="sectionKicker">In good company</p>
          <h2>Built with the platforms ambitious brands rely on.</h2>
        </div>
        <div className="logoMarquee">
          <div className="logoTrack">
            {[...LOGOS, ...LOGOS].map((logo, index) => (
              <div className="logoItem" key={`${logo}-${index}`} aria-hidden={index >= LOGOS.length}>
                <img src={logo} alt={index < LOGOS.length ? "Partner logo" : ""} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="capabilitiesSection" id="services">
        <header className="capabilitiesIntro">
          <p className="sectionKicker">What we do</p>
          <h2>One agency.<br />One growth system.</h2>
          <p>Strategy, storefront, automation and acquisition—designed to work together.</p>
        </header>

        <div className="serviceList">
          {SERVICES.map(([number, title, description]) => (
            <article className="serviceRow" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
              <span className="serviceArrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="automationSection">
        <div className="automationCopy">
          <p className="sectionKicker">Connected growth</p>
          <h2>Your website should do more than look good.</h2>
          <p>We connect every customer touchpoint so your store attracts, converts and retains more people—with less manual work.</p>
        </div>
        <div className="growthFlow" aria-label="Our connected growth system">
          <div className="flowNode"><span>01</span><strong>Shopify store</strong><small>High-converting foundation</small></div>
          <span className="flowArrow">→</span>
          <div className="flowNode"><span>02</span><strong>AI automation</strong><small>Smarter operations</small></div>
          <span className="flowArrow">→</span>
          <div className="flowNode"><span>03</span><strong>Digital marketing</strong><small>Qualified demand</small></div>
          <span className="flowArrow">→</span>
          <div className="flowNode flowNodeDark"><span>04</span><strong>Scalable growth</strong><small>Measure. Learn. Improve.</small></div>
        </div>
      </section>

      <section className="processSection">
        <header className="processHeader">
          <p className="sectionKicker">How we work</p>
          <h2>Simple process.<br />Serious outcomes.</h2>
        </header>
        <div className="processGrid">
          {PROCESS.map(([number, title, copy]) => (
            <article className="processCard" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="storySection">
        <div className="storyImage">
          <img src={STORY_IMAGE} alt="Creative product study" />
        </div>
        <div className="storyContent">
          <p className="sectionKicker">Why it works</p>
          <h2>Built to convert.<br />Automated to scale.</h2>
          <p className="storyCopy">
            Most agencies stop at launch. We unite the website, the workflows and the marketing so every part keeps improving after launch day.
          </p>
          <div className="storyStats">
            <div><strong>01</strong><span>Connected partner</span></div>
            <div><strong>04</strong><span>Core capabilities</span></div>
            <div><strong>24/7</strong><span>AI workflows</span></div>
          </div>
        </div>
      </section>

      <section className="quoteSection">
        <p className="sectionKicker">Our belief</p>
        <blockquote>Great commerce is equal parts experience, intelligence and momentum.</blockquote>
        <div className="quoteCredit">
          <span>Design that earns attention</span>
          <span>Systems that create growth</span>
        </div>
      </section>

      <section className="studioSection" id="studio">
        <p className="sectionKicker">Your next move</p>
        <h2>Ready to build a brand<br />that sells while you sleep?</h2>
        <a href="mailto:hello@example.com">Tell us about your project <span>↗</span></a>
      </section>

      <footer className="siteFooter">
        <p>© 2026 Creative Studio</p>
        <div><a href="#works">Work</a><a href="#services">Services</a><a href="#studio">Contact</a></div>
        <a href="#polaroid-hero-container">Back to top ↑</a>
      </footer>
    </main>
  );
}
