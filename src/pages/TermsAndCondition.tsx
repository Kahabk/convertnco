
import React, { useEffect, useState } from "react";
import "./TermsAndConditions.css";
const sections = [
  { id: "services", title: "Our Services" },
  { id: "scope", title: "Scope of Work" },
  { id: "fees", title: "Fees and Payment" },
  { id: "responsibilities", title: "Client Responsibilities" },
  { id: "timelines", title: "Timelines and Revisions" },
  { id: "audit", title: "Free Store Audit" },
  { id: "third-party", title: "Third-Party Platforms" },
  { id: "advertising", title: "Advertising Services" },
  { id: "refund", title: "Refund Guarantee" },
  { id: "results", title: "No Guarantee of Results" },
  { id: "intellectual", title: "Intellectual Property" },
  { id: "confidentiality", title: "Confidentiality" },
  { id: "cancellation", title: "Cancellation and Termination" },
  { id: "support", title: "Post-Launch Support" },
  { id: "liability", title: "Limitation of Liability" },
  { id: "privacy", title: "Data Protection" },
  { id: "website", title: "Using Our Website" },
  { id: "law", title: "Governing Law and Disputes" },
  { id: "changes", title: "Changes to These Terms" },
  { id: "contact", title: "Contact" },
];

const TermsAndConditions: React.FC = () => {
  const [activeSection, setActiveSection] = useState("services");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-25% 0px -85% 0px" }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <main className="terms-page">
      <div className="terms-container">

        {/* Header */}
        <header className="terms-header">
          <span className="terms-eyebrow"></span>
          <h1>Terms & Conditions</h1>
          <p>
            Please read these terms carefully before using our
            services or entering into a project with us.
          </p>
          <div className="terms-meta">
            <span>ConvertAndCo</span>
            <span>•</span>
            <span>Last updated: November 2026</span>
          </div>
        </header>

        <div className="terms-layout">

          {/* Sidebar */}
          <aside className="terms-sidebar">
            <h3>ON THIS PAGE</h3>
            <nav>
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={
                    activeSection === section.id
                      ? "terms-nav-link active"
                      : "terms-nav-link"
                  }
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {section.title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <article className="terms-content">

            <div className="terms-notice">
              <strong>Important Notice</strong>
              <p>
                These Terms & Conditions govern the services
                provided by ConvertAndCo. By engaging our services,
                you agree to these terms and the applicable
                project Scope of Work.
              </p>
            </div>

            <section id="services">
              <h2>01. Our Services</h2>
              <p>
                We provide Shopify store design and development,
                conversion rate optimisation (CRO), customer
                research, automation, and digital marketing services.
              </p>
              <p>
                The exact services for each project are listed
                in a written <strong>Scope of Work (SOW)</strong>
                agreed upon by both parties.
              </p>
            </section>

            <section id="scope">
              <h2>02. Scope of Work and Requirements</h2>
              <ul>
                <li>
                  Every project starts with an SOW listing
                  deliverables, pages, features, integrations,
                  timelines and fees.
                </li>
                <li>
                  The SOW is the agreed list of project
                  requirements, including requirements relevant
                  to the refund guarantee in Section 09.
                </li>
                <li>
                  Work not listed in the SOW is outside the
                  agreed scope and will be quoted separately
                  before starting.
                </li>
              </ul>
            </section>

            <section id="fees">
              <h2>03. Fees and Payment</h2>
              <ul>
                <li>
                  Fees are in Indian Rupees (INR), unless the
                  SOW states otherwise. GST is charged at the
                  applicable rate.
                </li>
                <li>
                  Unless otherwise agreed in the SOW, payment
                  is 50% advance before work starts and 50%
                  before the store goes live.
                </li>
                <li>
                  Invoices are due within 7 days. We may
                  pause work on overdue invoices.
                </li>
                <li>
                  Monthly services, including marketing, CRO
                  and support, are billed in advance.
                </li>
              </ul>
            </section>

            <section id="responsibilities">
              <h2>04. Client Responsibilities</h2>
              <ul>
                <li>
                  Provide content, product data, images, brand
                  assets and account access on time.
                </li>
                <li>
                  Provide feedback within 3 working days
                  of each delivery.
                </li>
                <li>
                  Delays in content, access or feedback
                  extend project timelines accordingly.
                </li>
                <li>
                  You confirm that you have the necessary
                  rights to all content provided to us.
                </li>
              </ul>
            </section>

            <section id="timelines">
              <h2>05. Timelines and Revisions</h2>
              <ul>
                <li>
                  Project timelines start after receipt of
                  the advance payment and all required materials.
                </li>
                <li>
                  Each design stage includes 2 rounds of revisions.
                </li>
                <li>
                  Additional revisions are billed separately
                  at the rate agreed in the SOW.
                </li>
              </ul>
            </section>

            <section id="audit">
              <h2>06. Free Store Audit</h2>
              <ul>
                <li>
                  The free audit is a no-obligation review
                  of your store with written or video recommendations.
                </li>
                <li>
                  Recommendations are based on our experience
                  and do not guarantee specific results.
                </li>
                <li>
                  We reserve the right to decline audit requests.
                </li>
                <li>
                  We use submitted store URLs and details
                  to prepare the audit and contact you about it.
                </li>
              </ul>
            </section>

            <section id="third-party">
              <h2>07. Third-Party Platforms and Costs</h2>
              <ul>
                <li>
                  Shopify plans, themes, apps, domains,
                  payment gateways and advertising spend
                  are paid directly by you unless the SOW
                  states otherwise.
                </li>
                <li>
                  We are not responsible for changes, outages,
                  policy decisions or account suspensions
                  caused by Shopify, Meta, Google or other
                  third-party providers.
                </li>
              </ul>
            </section>

            <section id="advertising">
              <h2>08. Advertising Services</h2>
              <ul>
                <li>
                  Advertising spend is separate from our
                  service fees and is paid directly to
                  the advertising platform.
                </li>
                <li>
                  Ad approvals, account status and advertising
                  performance are controlled by the platforms,
                  not by us.
                </li>
              </ul>
            </section>

            <section id="refund" className="refund-section">
              <h2>09. Refund Guarantee</h2>
              <p>
                We offer a <strong>full refund of our project
                fees</strong> if we fail to deliver the
                requirements specified in your signed SOW,
                subject to the conditions below.
              </p>

              <h3>How to Claim</h3>
              <ol>
                <li>
                  Email <strong>[email]</strong> within
                  <strong> 14 days</strong> of final delivery,
                  identifying the SOW requirements that
                  were not met.
                </li>
                <li>
                  We will have 14 days to review and fix
                  the identified items.
                </li>
                <li>
                  If the requirements remain unmet after
                  the correction period, we will refund
                  the project fees paid to us within
                  14 business days.
                </li>
              </ol>

              <h3>What the Guarantee Does Not Cover</h3>
              <ul>
                <li>Sales, revenue, conversion rates, traffic or business results.</li>
                <li>Third-party costs, including themes, apps, domains, Shopify fees and ad spend.</li>
                <li>Work or changes outside the signed SOW.</li>
                <li>Delays caused by missing content, access or feedback from you.</li>
                <li>Projects cancelled part-way through.</li>
                <li>Monthly services for months already delivered.</li>
                <li>Stores modified by you or another developer after delivery.</li>
              </ul>

              <p>
                After a refund, all rights to the refunded
                deliverables return to us, and you agree
                to stop using those deliverables.
              </p>
            </section>

            <section id="results">
              <h2>10. No Guarantee of Results</h2>
              <p>
                We use research and established methods to
                improve conversions. However, results depend
                on factors outside our control, including
                product quality, pricing, traffic, competition
                and market conditions.
              </p>
              <p>
                Except for the refund guarantee in Section 09,
                we do not guarantee specific business outcomes.
              </p>
            </section>

            <section id="intellectual">
              <h2>11. Intellectual Property</h2>
              <ul>
                <li>
                  Once paid in full, you own the final design
                  and custom code created specifically for
                  your store.
                </li>
                <li>
                  We retain ownership of our tools, frameworks
                  and reusable code, and grant you a licence
                  to use them in your store.
                </li>
                <li>
                  Third-party themes, fonts, images and apps
                  remain subject to their respective licences.
                </li>
                <li>
                  We may showcase your project in our portfolio
                  and case studies unless you object in writing.
                  We will obtain your approval before publishing
                  any figures or quotes.
                </li>
              </ul>
            </section>

            <section id="confidentiality">
              <h2>12. Confidentiality</h2>
              <p>
                Both parties agree to keep each other's
                non-public business information confidential
                during the project and after its completion.
              </p>
            </section>

            <section id="cancellation">
              <h2>13. Cancellation and Termination</h2>
              <ul>
                <li>
                  Either party may terminate a project by
                  providing 14 days' written notice.
                </li>
                <li>
                  If you cancel, you must pay for all work
                  completed up to the cancellation date.
                  Advance payments will first be applied
                  to work already completed.
                </li>
                <li>
                  Monthly services may be cancelled with
                  30 days' written notice.
                </li>
              </ul>
            </section>

            <section id="support">
              <h2>14. Post-Launch Support</h2>
              <p>
                We will fix bugs in work delivered by us
                for 30 days after launch at no additional
                charge. New features and changes after
                that period will be quoted separately
                or covered under an agreed support plan.
              </p>
            </section>

            <section id="liability">
              <h2>15. Limitation of Liability</h2>
              <p>
                Our total liability for any claim is limited
                to the fees paid to us for the relevant
                project, or, for monthly services, the
                fees paid during the preceding 3 months.
              </p>
              <p>
                To the extent permitted by applicable law,
                we are not liable for indirect losses,
                including lost profits, lost data or
                lost business opportunities.
              </p>
            </section>

            <section id="privacy">
              <h2>16. Data Protection</h2>
              <p>
                We handle personal data in accordance
                with applicable Indian data protection
                laws, including the Digital Personal
                Data Protection Act, 2023, and our
                <a href="/privacy-policy"> Privacy Policy</a>.
              </p>
              <p>
                When accessing your customer data to
                perform our services, we use it only
                for the agreed project purposes.
              </p>
            </section>

            <section id="website">
              <h2>17. Using Our Website</h2>
              <p>
                Content available on convertandco.com
                is provided for general information.
                You may not copy, reproduce or distribute
                our content, designs or case studies
                without prior permission.
              </p>
            </section>

            <section id="law">
              <h2>18. Governing Law and Disputes</h2>
              <p>
                These terms are governed by the laws
                of India. Both parties will first
                attempt to resolve disputes through
                good-faith discussions.
              </p>
              <p>
                If a dispute cannot be resolved,
                the courts at Ernakulam, Kerala,
                India shall have exclusive jurisdiction,
                subject to applicable law.
              </p>
            </section>

            <section id="changes">
              <h2>19. Changes to These Terms</h2>
              <p>
                We may update these terms from time
                to time. Updated terms apply to new
                projects from their publication date.
                Signed SOWs remain subject to the
                terms agreed when they were signed,
                unless both parties agree otherwise.
              </p>
            </section>

            <section id="contact">
              <h2>20. Contact</h2>
              <p>
                For questions about these Terms &
                Conditions, contact us using the
                details below.
              </p>

              <div className="terms-contact">
                <p><strong>Business:</strong> [Registered business name]</p>
                <p><strong>Address:</strong> [Business address]</p>
                <p><strong>Email:</strong> [Business email]</p>
                <p><strong>Phone / WhatsApp:</strong> [Phone number]</p>
                <p><strong>GSTIN:</strong> [GSTIN, if applicable]</p>
              </div>
            </section>

            <footer className="terms-footer">
              <p>© {new Date().getFullYear()} ConvertAndCo. All rights reserved.</p>
              <a href="/">Back to Home</a>
            </footer>

          </article>
        </div>
      </div>
    </main>
  );
};

export default TermsAndConditions;
