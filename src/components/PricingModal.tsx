'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Check, Sparkles, X } from 'lucide-react';
import LaserFlow from '../../components/LaserFlow';
import './PricingModal.css';

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  priceMonthly: string;
  priceYearly?: string;
  period: string;
  popular?: boolean;
  badge?: string;
  inheritedFrom?: string;
  buttonText: string;
  buttonLink?: string;
  isCurrent?: boolean;
  disabled?: boolean;
  features: string[];
  footnote?: string;
  onClick?: () => void;
}

export interface PricingModalProps {
  open: boolean;
  onClose: () => void;
  pricingLimitReached?: boolean;
  plans?: PricingPlan[];
}

export const DEFAULT_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'For a focused first look',
    priceMonthly: '₹0',
    priceYearly: '₹0',
    period: '/ month',
    buttonText: 'Continue with Free',
    isCurrent: true,
    features: [
      '3 audits per day',
      'Single-page CRO audit',
      'Desktop & mobile review',
      'Basic conversion score',
      'Community support',
      'Watermarked PDF export',
    ],
    footnote: 'Limits reset every 24 hours.',
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'For growing teams',
    priceMonthly: '₹49',
    priceYearly: '₹39',
    period: '/ month',
    popular: true,
    badge: 'Most popular',
    inheritedFrom: 'Starter',
    buttonText: 'Get Pro',
    buttonLink: 'mailto:kahabhns@gmail.com?subject=Convert%20%26%20Co%20Pro%20plan',
    features: [
      '25 audits per day',
      'Full audit of up to 15 pages',
      'Prioritised conversion roadmap',
      'Heatmap-style attention insights',
      'Headline & CTA copy suggestions',
      'A/B test idea generator',
      'Competitor snapshot (1 competitor)',
      'Clean PDF & Notion export',
      'Email support',
    ],
    footnote: 'Billed monthly. Cancel anytime.',
  },
  {
    id: 'scale',
    name: 'Scale',
    tagline: 'For agencies and busy teams',
    priceMonthly: '₹149',
    priceYearly: '₹119',
    period: '/ month',
    inheritedFrom: 'Pro',
    buttonText: 'Get Scale',
    buttonLink: 'mailto:kahabhns@gmail.com?subject=Convert%20%26%20Co%20Scale%20plan',
    features: [
      '100 audits per day',
      'Up to 50 pages per audit',
      'Competitor benchmarking (5 competitors)',
      'Weekly re-audit & change tracking',
      'White-label PDF reports',
      'Shareable client report links',
      'Team workspace (up to 5 seats)',
      'Priority support',
    ],
    footnote: 'Billed monthly. Cancel anytime.',
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'For hands-on growth support',
    priceMonthly: 'Custom',
    priceYearly: 'Custom',
    period: '',
    inheritedFrom: 'Scale',
    buttonText: 'Contact our team',
    buttonLink: 'mailto:kahabhns@gmail.com?subject=Convert%20%26%20Co%20Business%20plan',
    features: [
      'Tailored audit scope',
      'Unlimited seats & team collaboration',
      'API access & webhooks',
      'Slack / Jira / Notion integrations',
      'SSO and role-based access',
      'Dedicated CRO expert & monthly strategy call',
      'Custom SLA and onboarding',
    ],
    footnote: 'Custom agreement & onboarding.',
  },
];

export default function PricingModal({
  open,
  onClose,
  pricingLimitReached = false,
  plans = DEFAULT_PLANS,
}: PricingModalProps) {
  const [isYearly, setIsYearly] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [beamPosition, setBeamPosition] = useState(0.375);

  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const proCardRef = useRef<HTMLDivElement>(null);

  // Compute dynamic beam position so the LaserFlow beam centers directly onto the Pro card
  const updateBeamPosition = useCallback(() => {
    if (!proCardRef.current || !contentWrapperRef.current) return;
    const proRect = proCardRef.current.getBoundingClientRect();
    const contRect = contentWrapperRef.current.getBoundingClientRect();
    if (contRect.width > 0) {
      const center = (proRect.left + proRect.width / 2 - contRect.left) / contRect.width;
      setBeamPosition(Math.max(0.05, Math.min(0.95, center)));
    }
  }, []);

  // Lock body scroll while modal is open, and handle Escape key to close
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  // Track mobile breakpoint for LaserFlow performance adjustments
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const updateMedia = () => setIsMobile(mq.matches);
    updateMedia();
    mq.addEventListener('change', updateMedia);
    return () => mq.removeEventListener('change', updateMedia);
  }, []);

  // Recompute beam position on resize, after fonts load, and after initial layout render
  useEffect(() => {
    if (!open) return;

    updateBeamPosition();
    const handleResize = () => updateBeamPosition();
    window.addEventListener('resize', handleResize);

    const timer = setTimeout(updateBeamPosition, 60);

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(() => updateBeamPosition());
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [open, updateBeamPosition]);

  if (!open) return null;

  return (
    <div
      className="pricingOverlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pricing-modal-title"
    >
      {/* Fixed Close Button */}
      <button
        type="button"
        className="pricingCloseBtn"
        onClick={onClose}
        aria-label="Close pricing modal"
      >
        <X size={20} />
      </button>

      {/* Modal Content */}
      <div ref={contentWrapperRef} className="pricingContentWrapper">
        {/* LaserFlow Background Beam Effect: inside content wrapper so it grows with the cards */}
        <div className="pricingLaserFlowLayer">
          <LaserFlow
            surfaceRef={proCardRef}
            beamPosition={beamPosition}
            color="#3847ff"
            intensity={1.8}
            beamWidth={1.5}
            flare={1.5}
            spread={1.5}
            spill={1}
            fog={0.2}
            dust={1.6}
            streaks={1.5}
            dots={1}
            pulse={1.5}
            speed={1.5}
            seed={3}
            mouseInteraction
            intro
          />
        </div>

        {/* Top Header Area */}
        <div className="pricingTopArea">
          <div className="pricingHeadingWrapper">
            <h2 id="pricing-modal-title" className="pricingTitle">
              Upgrade your plan
            </h2>
            <p className="pricingSubtitle">
              Run deeper CRO audits and ship conversion fixes faster.
            </p>
          </div>

          {/* Monthly / Yearly Billing Toggle */}
          <div className="pricingBillingToggleWrap">
            <div className="pricingBillingToggle" role="radiogroup" aria-label="Billing frequency">
              <button
                type="button"
                role="radio"
                aria-checked={!isYearly}
                className={`pricingToggleBtn ${!isYearly ? 'active' : ''}`}
                onClick={() => setIsYearly(false)}
              >
                Monthly
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={isYearly}
                className={`pricingToggleBtn ${isYearly ? 'active' : ''}`}
                onClick={() => setIsYearly(true)}
              >
                <span>Yearly</span>
                <span className="pricingDiscountBadge">Save 20%</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4-Column Pricing Grid */}
        <div className="pricingGrid">
          {plans.map((plan) => {
            const isPro = plan.popular || plan.id === 'pro';
            const price = isYearly && plan.priceYearly ? plan.priceYearly : plan.priceMonthly;
            const isStarter = plan.id === 'starter';
            const isStarterDisabled = isStarter && pricingLimitReached;
            const buttonLabel = isStarter
              ? isStarterDisabled
                ? 'Daily limit reached'
                : 'Continue with Free'
              : plan.buttonText;

            return (
              <div
                key={plan.id}
                ref={isPro ? proCardRef : undefined}
                className={`pricingCard ${isPro ? 'pricingCardPro' : ''}`}
              >
                {/* 1. Header: Plan Name, Tagline, Price, Button */}
                <div className="pricingCardHead">
                  <div className="pricingCardTopRow">
                    <h3 className="pricingPlanName">{plan.name}</h3>
                    {isPro && (
                      <span className="pricingPopularBadge">
                        {plan.badge || 'Most popular'}
                      </span>
                    )}
                  </div>

                  <p className="pricingPlanTagline">{plan.tagline}</p>

                  <div className="pricingPriceRow">
                    <span className="pricingPriceAmount">{price}</span>
                    {plan.period && (
                      <span className="pricingPricePeriod">{plan.period}</span>
                    )}
                  </div>

                  {/* 3. Full-width Pill Button */}
                  <div className="pricingButtonRow">
                    {isStarter ? (
                      <button
                        type="button"
                        disabled={isStarterDisabled}
                        onClick={isStarterDisabled ? undefined : onClose}
                        className={`pricingBtn ${
                          isStarterDisabled ? 'pricingBtnDisabled' : 'pricingBtnWhite'
                        }`}
                      >
                        {buttonLabel}
                      </button>
                    ) : plan.buttonLink ? (
                      <a
                        href={plan.buttonLink}
                        className={`pricingBtn ${isPro ? 'pricingBtnPro' : 'pricingBtnWhite'}`}
                      >
                        {plan.buttonText}
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={plan.onClick}
                        className={`pricingBtn ${isPro ? 'pricingBtnPro' : 'pricingBtnWhite'}`}
                      >
                        {plan.buttonText}
                      </button>
                    )}
                  </div>
                </div>

                {/* 4. Divider Line */}
                <hr className="pricingDivider" />

                {/* 5 & 6. Feature List with Inheritance header */}
                <div className="pricingFeaturesBody">
                  <div className="pricingInheritanceRow">
                    {plan.inheritedFrom ? (
                      <>
                        <Sparkles size={14} className="pricingInheritSparkle" />
                        <span>Everything in {plan.inheritedFrom} and:</span>
                      </>
                    ) : (
                      <span className="pricingInheritSpacer" aria-hidden="true" />
                    )}
                  </div>

                  <ul className="pricingFeatureList">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="pricingFeatureItem">
                        <Check size={16} strokeWidth={2} className="pricingCheckIcon" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 7. Footnote Pinned to Bottom */}
                {plan.footnote && (
                  <div className="pricingFootnote">{plan.footnote}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
