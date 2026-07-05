export default function PromoTicket() {
  return (
    <div className="promoTicket" aria-label="Demo promotion: 50 percent off with code DEMO50">
      <div className="promoNotes">✦ ✦ ✦</div>
      <div className="promoNotes">✦ ✦</div>
      <div className="promoNotes">✦ ✦ ✦</div>
      <div className="promoHeader"><span>50%</span><small>OFF</small><div className="promoSymbol">✁</div></div>
      <div className="promoBody">
        <span className="promoEdition">Limited drop · 01/50</span>
        <em>Website build pass</em>
        <p>For ambitious brands ready to launch, automate and grow.</p>
        <small>Demo visual — not a real offer</small>
      </div>
      <div className="promoFooter">
        <div className="promoCode">Code <strong>DEMO50</strong></div>
        <div className="promoBarcode" />
      </div>
      <div className="promoBackground" />
      <svg className="promoFilter" aria-hidden="true">
        <filter id="promo-ticket-bump">
          <feTurbulence result="noise" numOctaves={3} baseFrequency="0.7" type="fractalNoise" />
          <feSpecularLighting in="noise" result="specular" lightingColor="#fffffc" specularExponent={25} specularConstant="0.8" surfaceScale="0.15">
            <fePointLight z={210} y={100} x={100} />
          </feSpecularLighting>
          <feComposite result="noise2" operator="in" in="specular" in2="SourceGraphic" />
          <feBlend mode="screen" in2="noise2" in="SourceGraphic" />
        </filter>
      </svg>
    </div>
  );
}
