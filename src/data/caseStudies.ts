export type CaseStudyImage = {
  path: string;
  width: number;
  height: number;
  alt: string;
  label: string;
  title: string;
  paragraphs: [string, string];
  blend?: "multiply" | "normal";
};

export type CaseStudy = {
  slug: string;
  number: string;
  name: string;
  category: string;
  summary: string;
  description: string;
  meta: { client: string; role: string; platform: string; year: string };
  hero: CaseStudyImage;
  heroContext?: string[];
  sections: CaseStudyImage[];
  delivery: string;
  palette?: { name: string; hex: string }[];
};

export const expectedCaseStudyImages = [
  "k_stady/store_1/Firefly (12).png", "k_stady/store_1/Firefly (1).png", "k_stady/store_1/Firefly (2).png", "k_stady/store_1/image.png",
  "k_stady/store_2/ColorPalette.png", "k_stady/store_2/Firefly (7).png", "k_stady/store_2/Firefly (8).png", "k_stady/store_2/Firefly (9).png", "k_stady/store_2/Firefly (10).png", "k_stady/store_2/Firefly (11).png", "k_stady/store_2/Firefly (13).png", "k_stady/store_2/image 4 (1).png",
  "k_stady/store_3/Home Page 1.png", "k_stady/store_3/Category Page 1.png", "k_stady/store_3/Products Page 1.png", "k_stady/store_3/Product Detailed Page 1.png", "k_stady/store_3/Basket Page 1.png",
  "k_stady/store_4/Firefly (3).png", "k_stady/store_4/Firefly (4).png", "k_stady/store_4/Firefly (5).png", "k_stady/store_4/Firefly (6).png", "k_stady/store_4/Firefly_RemoveBackground.png", "k_stady/store_4/Frame 427320760 (1).png", "k_stady/store_4/image copy 2.png",
];

export const caseStudies: CaseStudy[] = [
  {
    slug: "mpr-sportswear", number: "01", name: "MPR Sportswear", category: "Sportswear · Ecommerce UI design",
    summary: "A football-led mobile storefront that keeps brand discovery, shirt selection and buying actions in one clear visual rhythm.",
    description: "MPR Sportswear ecommerce UI design case study exploring mobile product discovery, football-shirt selection and a clearer Shopify purchase journey today.",
    // TODO: Confirm MPR Sportswear's delivered scope, ecommerce platform, and launch year.
    meta: { client: "MPR Sportswear", role: "TODO: confirm", platform: "TODO: confirm", year: "TODO: confirm" },
    hero: { path: "k_stady/store_1/Firefly (1).png", width: 455, height: 843, blend: "multiply", alt: "MPR Sportswear mobile home screen with football campaign image and jersey tiles", label: "Hero · home", title: "A football-first entry point", paragraphs: [
      "The opening screen uses a blurred football image, the MPR mark and the line “Built for the game” to establish the subject immediately. Below it, two jersey tiles give the campaign a practical outlet: customers can see product imagery before they have to make a navigation decision.",
      "That hierarchy keeps the first mobile moment focused. The campaign image creates an atmosphere, while the compact tiles make the next step tangible. It is a useful balance for a sportswear storefront: brand energy leads the eye, then the range gives the visit somewhere clear to go."
    ] },
    heroContext: [
      "Across the supplied MPR screens, the visual language stays close to football product culture: blue accents, player imagery, familiar sports-brand marks and jersey photography. The common structure is useful because it gives the customer a continuous retail frame even as the content moves from a player-led campaign into brand choice, product tiles and an individual shirt. The interface does not ask the user to decode a new layout at each stage; it keeps the commercial elements in a recognisable visual order.",
      "The customer journey visible in the artwork is therefore deliberately compact. A player image makes the opening relevant, the brand strip gives a quick way to narrow the range, and the jersey cards take the customer toward a specific product. From there, the product page exposes price, sizing and Buy Now in the same screen. This is the kind of mobile commerce UX sequence that reduces unnecessary back-and-forth while allowing the apparel imagery to keep the store expressive."
      ,
      "The supplied layouts also show that promotional content is not being treated as a separate destination. The “Turn every move into momentum” block sits alongside product imagery rather than replacing it, and the same blue accent appears in brand filters, offer labels and product details. That repetition gives the campaign a visible commercial role. It can draw attention to the collection, then pass the customer into a purchase path that keeps the shirt and its options at the centre. In a smaller mobile viewport, this kind of repeatable order is a practical way to make a visually active store feel controlled."
      ,
      "The result is a storefront direction grounded in what is actually shown on screen: football imagery, sports-brand recognition, product tiles and explicit purchase controls. It does not depend on invented performance claims; its value is the clarity of the customer route visible in the supplied interface work."
    ],
    sections: [
      { path: "k_stady/store_1/Firefly (12).png", width: 480, height: 843, blend: "multiply", alt: "MPR Sportswear mobile screen with Puma Nike and Adidas filters and football jersey tiles", label: "01 · discovery", title: "Brands and shirts, in the same view", paragraphs: [
        "This screen places Puma, Nike and Adidas shortcuts directly below a campaign strip, then follows with two football-shirt tiles and a larger training image. It visibly supports the two common ways into this kind of range: shop by brand or begin with the product that has caught the eye.",
        "The merchandising is intentionally direct. Brand chips reduce a broad catalogue into recognisable choices, while the product tiles keep price and offer treatment close to the image. That makes early comparison easier without asking customers to leave the visual flow."
      ] },
      { path: "k_stady/store_1/Firefly (2).png", width: 455, height: 857, blend: "multiply", alt: "MPR Sportswear mobile product detail page for a France home jersey with size choices and buy now button", label: "02 · product detail", title: "The jersey page makes choice explicit", paragraphs: [
        "The product screen centres a France home jersey and brings the core buying information directly underneath: the 2026 title, price, colour context and a compact set of size choices. A high-contrast Buy Now bar appears before the customer has to scroll through supporting products.",
        "For product consideration, the visible structure matters more than decoration. The size options are separated into distinct tap targets and the purchase action is visually decisive. The related shirt tiles below provide a continuation path without competing with the primary decision."
      ] },
      { path: "k_stady/store_1/image.png", width: 480, height: 843, blend: "multiply", alt: "MPR Sportswear mobile merchandising screen with brand tabs football jerseys and training campaign", label: "03 · merchandising", title: "A repeatable campaign composition", paragraphs: [
        "This second supplied composition repeats the brand tabs, jersey pair and “Turn every move into momentum” campaign block. Its value is in showing the system as a repeatable retail module rather than a single hero: brand filters, product cards and story imagery share one mobile frame.",
        "That consistency is useful when new clubs, kits or promotional messages arrive. The customer learns where the commercial information lives, while the merchandising team has a clear structure for changing the product and campaign content without changing the interaction pattern."
      ] }
    ],
    delivery: "The delivery approach concentrated on the screens visible here: setting a clear home hierarchy, making brand and jersey routes easy to recognise, and keeping the product choice and purchase action unambiguous on mobile. TODO: confirm the final build, QA and handoff scope.",
  },
  {
    slug: "wink-home", number: "02", name: "Wink Home", category: "Gift & stationery · Mobile commerce UX",
    summary: "A pink, product-led mobile shop for gift and stationery browsing, from category discovery through cart review and sign-in.",
    description: "Wink Home mobile commerce UX case study covering gift discovery, product selection, cart review and visual system decisions for ecommerce on mobile now.",
    // TODO: Confirm Wink Home's delivered scope, ecommerce platform, and launch year.
    meta: { client: "Wink Home", role: "TODO: confirm", platform: "TODO: confirm", year: "TODO: confirm" },
    hero: { path: "k_stady/store_2/Firefly (13).png", width: 920, height: 730, blend: "normal", alt: "Wink Home cart shown on overlapping mobile phone mockups against a light grey background", label: "Hero · cart overview", title: "A close view of the buying surface", paragraphs: [
      "The supplied hero frame zooms into the Wink cart interface: a white device against a pale background, a pink circular header, a compact item row and the recognizable Wink mark. It puts the transaction surface forward rather than treating it as an afterthought.",
      "That is appropriate for a shop with small, visually distinct products. A cart needs to preserve recognition of the chosen item while keeping quantities and the next action legible. The screen’s white cards and generous pink field do exactly that in the visible composition."
    ] },
    sections: [
      { path: "k_stady/store_2/Firefly (9).png", width: 308, height: 602, blend: "multiply", alt: "Wink Home mobile home screen with gift search, promotional banner, new items and category navigation", label: "01 · home", title: "A browseable gifts homepage", paragraphs: [
        "The home screen opens with a search field, a pink promotional banner and a New Items row with illustrated gift products. It then moves into a second content strip and a dark bottom navigation, giving the screen more than one visible route into the shop.",
        "This is a practical discovery pattern for gift shopping. Search supports a customer who knows what they need, while the banner and product row give a more open-ended visitor something immediate to browse. The sections are clearly separated, so the page stays readable despite carrying several entry points."
      ] },
      { path: "k_stady/store_2/Firefly (8).png", width: 308, height: 602, blend: "multiply", alt: "Wink Home mobile category screen with gift search, category chips and illustrated product cards", label: "02 · category", title: "Categories keep a playful range organised", paragraphs: [
        "This category view holds a search input, tabs for Gift, Goods, Bottle and Lamps, then large cards for individual products such as a teddy and a cute carry bag. The items retain their illustration-led personality while the interface supplies a straightforward browse structure.",
        "The category chips make the range easier to narrow without forcing an immediate filter interaction. Product name and price remain visible beneath each card, which helps the playful illustration still function as commerce. A customer can scan the page quickly, then add an item using the clearly marked controls."
      ] },
      { path: "k_stady/store_2/Firefly (10).png", width: 308, height: 602, blend: "multiply", alt: "Wink Home mobile product page for a Cute Bag with colour options and buy now button", label: "03 · product", title: "Product choice stays near the image", paragraphs: [
        "The product screen gives the illustrated Cute Bag most of the upper area, then moves into a short description, colour circles, quantity controls and a black Buy Now button. Related visual options appear as small product thumbnails immediately above the purchase row.",
        "This arrangement makes the decision sequence visible: see the product, understand it, choose a colour, set a quantity and buy. The controls are separated from the descriptive copy, so their purpose remains clear. It supports consideration without turning a small-screen product page into a dense specification sheet."
      ] },
      { path: "k_stady/store_2/Firefly (7).png", width: 308, height: 602, blend: "multiply", alt: "Wink Home mobile cart with gift item rows quantity controls recently viewed products and buy now button", label: "04 · cart", title: "The cart doubles as a final check", paragraphs: [
        "The cart shows three product rows with their illustrations, prices, selection states and quantity controls, followed by a Recently View block and a full-width Buy Now action. The pink field at the top makes the location unmistakable without obscuring the content below.",
        "For conversion rate optimization, this is a useful review point. The selected state is visible, change controls sit on each row, and the purchase action remains at the bottom of the screen. Recently viewed products are kept secondary, so they offer a return path without distracting from the chosen items."
      ] },
      { path: "k_stady/store_2/Firefly (11).png", width: 308, height: 602, blend: "multiply", alt: "Wink Home pink sign-in screen with Google and Apple login buttons", label: "05 · sign in", title: "Account access without a detour", paragraphs: [
        "This full pink screen presents the Wink logo, “Gift and Stationery” descriptor, and two clearly separated routes to continue with Google or Apple. A smaller line below provides a sign-up alternative, keeping the message focused on one immediate decision.",
        "The login surface keeps the visual system intact while using familiar provider patterns. That is important at a moment with little tolerance for uncertainty: customers can recognise the action they are taking, choose a trusted sign-in method, and return to the shopping flow without a dense form."
      ] },
      { path: "k_stady/store_2/ColorPalette.png", width: 1260, height: 1324, blend: "multiply", alt: "Wink Home colour palette board showing pink green charcoal and black swatches with hex values", label: "06 · colour palette", title: "A palette with a defined job", paragraphs: [
        "The palette board visibly documents three pinks (#FFD5E5, #FF99C5 and #FF48A9), two greens (#98BB97 and #416954), charcoal (#292526) and black (#000000). The same pinks are evident across the supplied mobile headers, banners and sign-in screen.",
        "Using a documented range gives the interface a controlled way to move between soft product presentation and high-contrast actions. The pale pink can carry broad surfaces, the saturated pink can direct attention, and the dark values keep the bottom navigation and Buy Now controls readable."
      ] },
      { path: "k_stady/store_2/image 4 (1).png", width: 1300, height: 778, blend: "normal", alt: "Wink Home mobile commerce screens arranged across a pink background", label: "07 · system view", title: "A system shown across key moments", paragraphs: [
        "This wide composition brings several Wink screens together on a pink ground: the category page, product detail and cart can be recognised in the repeated device views. It is not another user step; it shows how the same navigation, typography and pink surfaces carry across the journey.",
        "The visual continuity is commercially useful. A customer moving from discovery to cart should not need to learn a new interface language at every stage. Here, the consistent headers, card shapes and action treatment make the store feel like one connected mobile commerce experience."
      ] }
    ],
    palette: [{ name: "Blush", hex: "#FFD5E5" }, { name: "Pink", hex: "#FF99C5" }, { name: "Hot pink", hex: "#FF48A9" }, { name: "Soft green", hex: "#98BB97" }, { name: "Forest", hex: "#416954" }, { name: "Charcoal", hex: "#292526" }, { name: "Black", hex: "#000000" }],
    delivery: "The delivery approach connects the visible discovery, product, cart and sign-in patterns into one mobile system, with the palette board acting as a practical visual reference. TODO: confirm the final build, QA and handoff scope.",
  },
  {
    slug: "street-vault", number: "03", name: "Street Vault", category: "Sneaker retail · Conversion rate optimization case study",
    summary: "A mobile sneaker shop that gives search, brand selection, product listing, product detail and basket review distinct, legible roles.",
    description: "Street Vault conversion rate optimization case study covering mobile sneaker discovery, category navigation, product detail and basket clarity on mobile.",
    // TODO: Confirm Street Vault's delivered scope, ecommerce platform, and launch year.
    meta: { client: "Street Vault", role: "TODO: confirm", platform: "TODO: confirm", year: "TODO: confirm" },
    hero: { path: "k_stady/store_3/Home Page 1.png", width: 393, height: 852, blend: "multiply", alt: "Street Vault mobile home screen with sneaker search brand shortcuts and new arrivals", label: "Hero · home", title: "Search and brands lead the sneaker browse", paragraphs: [
      "The Street Vault home screen opens with a search field, a basket icon, five brand shortcuts and a New Arrival row. Product cards show shoes, prices, heart icons and small Best Selling or Trending labels, while the bottom navigation keeps Home in view.",
      "This gives a sneaker customer more than one sensible starting route. A known brand can be selected immediately, a specific style can be searched, or the arrival row can be scanned for inspiration. Each route is visible before the screen becomes a long product feed."
    ] },
    heroContext: [
      "The full set of Street Vault screens shows a deliberately connected route through sneaker shopping. Search and brand controls appear at the beginning, product families provide a second level of orientation, and the listing turns those choices into a visual comparison task. The UI does not rely on a single browsing method: customers can arrive with a brand in mind, use categories such as basketball or running, or simply scan the new arrivals. Each route ultimately leads into the same product and basket patterns.",
      "The visual system helps this sequence remain commercially clear. White surfaces keep the shoe imagery prominent, black navigation anchors the interface, and lime highlights mark price or savings without covering the product. Labels such as Best Selling and Trending are used as small signals rather than large marketing blocks. Together, those visible decisions create a credible conversion rate optimization case study: the customer is given meaningful information at each step, then a direct way to keep moving."
      ,
      "The basket completes the sequence by moving the emphasis from browsing to order review. Selection boxes, quantity steppers, discount entry and a visible calculation are all shown before Continue. That is a different job from the discovery screens, but the visual system remains recognisable. The effect is a coherent mobile commerce UX path rather than a collection of disconnected product views."
    ],
    sections: [
      { path: "k_stady/store_3/Category Page 1.png", width: 393, height: 852, blend: "multiply", alt: "Street Vault mobile category screen with Air Jordan basketball running and casual shoe categories", label: "01 · category", title: "Product families make the range easier to enter", paragraphs: [
        "The category screen uses four large image cards for Air Jordan, Basketball Shoes, Running Shoes and Casual Shoes. Each route pairs a category name with a recognisable shoe image, and a persistent bottom navigation identifies the category location.",
        "The layout reduces the work of deciding where to begin. Rather than requiring an unfamiliar filter vocabulary, it gives customers product families they can recognise at a glance. This is especially helpful for a broad sneaker range, where a clear first category can shorten the path to a relevant listing."
      ] },
      { path: "k_stady/store_3/Products Page 1.png", width: 393, height: 852, blend: "multiply", alt: "Street Vault Air Jordan listing page with six sneaker cards and best selling and trending labels", label: "02 · listing", title: "A listing built for visual comparison", paragraphs: [
        "The Air Jordan listing arranges six shoes in a two-column grid. Each card carries a product image, short model name, price and occasional Best Selling or Trending labels; search and filter icons remain in the header while the category navigation stays at the bottom.",
        "That layout keeps the comparison variables close together. The customer can scan silhouette, colour, price and product status in the same repeated pattern instead of opening several pages first. The status labels are visually small enough to add context without overtaking the shoe imagery."
      ] },
      { path: "k_stady/store_3/Product Detailed Page 1.png", width: 393, height: 852, blend: "multiply", alt: "Street Vault Air Jordan product detail screen with shoe image thumbnails size choices and add to bag button", label: "03 · product detail", title: "The decision screen brings controls together", paragraphs: [
        "The detail screen makes one black-and-red Air Jordan the central image, then offers a thumbnail row, name, price, prior price, size choices and Add to Bag action. Favourite and share controls sit separately from the purchase controls, so their roles do not collide.",
        "The interaction order follows the visible decision. A customer can inspect the shoe, move through available images, choose a size, and add it to the bag without losing sight of the product name or price. This keeps the high-intent moment concise and easy to interpret."
      ] },
      { path: "k_stady/store_3/Basket Page 1.png", width: 393, height: 852, blend: "multiply", alt: "Street Vault mobile basket with selected sneakers discount field order totals and continue button", label: "04 · basket", title: "A basket that shows the full order state", paragraphs: [
        "The basket presents two Nike Jordan 1 rows with selection boxes, product images, size, price, discount treatment and quantity steppers. Below, a discount-code field, order subtotal, platform fee, shipping fee and total amount are all visible before the Continue button.",
        "This makes the final review concrete. Customers can see what is included, adjust quantities and understand the order calculation before progressing. The green savings and free-shipping cues are visually separate from the dark Continue control, which keeps the call to action clear without hiding the price context."
      ] }
    ],
    delivery: "The delivery approach focused on giving each visible Street Vault screen one job: orient, narrow, compare, decide and review. TODO: confirm the final build, QA and handoff scope.",
  },
  {
    slug: "rider-parts", number: "04", name: "Rider Parts", category: "Motorcycle parts · Ecommerce UI design",
    summary: "A red-and-black performance parts experience that pairs exhaust imagery with direct product routes, product cards and checkout-ready controls.",
    description: "Rider Parts ecommerce UI design case study covering motorcycle parts discovery, branded product presentation and mobile purchase clarity on mobile now.",
    // TODO: Confirm Rider Parts' delivered scope, ecommerce platform, and launch year.
    meta: { client: "Rider Parts", role: "TODO: confirm", platform: "TODO: confirm", year: "TODO: confirm" },
    hero: { path: "k_stady/store_4/Frame 427320760 (1).png", width: 2857, height: 1469, blend: "normal", alt: "Rider Parts presentation image with motorcycle exhaust mobile commerce screens on a red background", label: "Hero · system overview", title: "A performance-led product surface", paragraphs: [
      "The wide Rider Parts hero places several mobile screens on a red ground, with exhaust product imagery and high-contrast interface panels visible across the composition. It establishes the visual source material for the rest of the case study: dark machine photography, red accents and pale product cards.",
      "The composition makes a useful distinction between atmosphere and shopping. The motorcycle and exhaust imagery creates the performance context, while the screens retain obvious product rows and interaction controls. That balance is important when a specialist category needs both brand confidence and practical product access."
    ] },
    heroContext: [
      "The supplied Rider Parts screens consistently use close component photography, red accents and dark header imagery to put the product category in context. Pale cards and clear controls then give the product information a practical surface. That contrast is the central ecommerce UI design decision visible throughout the system."
    ],
    sections: [
      { path: "k_stady/store_4/Firefly (3).png", width: 327, height: 596, blend: "multiply", alt: "Rider Parts home screen with red motorcycle exhaust hero Shop Now button and exhaust product card", label: "01 · home", title: "A hero image with a clear way into products", paragraphs: [
        "This home screen leads with a close crop of a red motorcycle and exhaust, then places Shop Now and Explore controls over the image. Brand marks appear below, followed by a Deal’s Time row and a large exhaust product card with a heart action.",
        "The layout lets the campaign image create interest without making the storefront ambiguous. The Shop Now action is visible against the dark hero, while the product content begins immediately below. Customers can move from performance imagery to a specific component without a separate navigation step."
      ] },
      { path: "k_stady/store_4/Firefly (4).png", width: 327, height: 596, blend: "multiply", alt: "Rider Parts mobile home screen with exhaust campaign image Shop Now button and premium brand content", label: "02 · brand story", title: "Brand detail supports the product surface", paragraphs: [
        "The second screen retains the motorcycle-and-exhaust hero and the Shop Now control, then introduces a “Trusted Premium Brand” panel with component photography. A smaller product image remains visible at the lower edge, connecting the brand story back to an item that can be purchased.",
        "This gives the interface room for a credibility message without displacing commerce. The story panel is visually contained between the campaign and the product area, so it can add context for a specialist purchase while preserving a clear route back to parts and price."
      ] },
      { path: "k_stady/store_4/Firefly (5).png", width: 327, height: 596, blend: "multiply", alt: "Rider Parts mobile product detail page for a black exhaust with brand logos price and buy now button", label: "03 · product detail", title: "A focused exhaust detail page", paragraphs: [
        "The product detail screen isolates a black exhaust against a white and red composition, with brand marks in the header, a short description, product name, performance label, price and outlined Buy Now button. The page foregrounds one item rather than mixing it with a wider listing.",
        "That focus is valuable once a customer has reached a product. The visual keeps the component large, then sequences the supporting information beneath it. The Buy Now control is separated from the description and price, making the next action easy to locate after the product has been considered."
      ] },
      { path: "k_stady/store_4/Firefly (6).png", width: 327, height: 596, blend: "multiply", alt: "Rider Parts mobile screen with exhaust brand tabs deal card and three large component product cards", label: "04 · collection", title: "Component cards create a quick compare surface", paragraphs: [
        "This screen keeps the dark motorcycle header and brand marks, then moves into a Deal’s Time strip and three large component cards. The exhaust, footrest and another exhaust component each receive a single spacious card, allowing their shape to carry most of the product recognition.",
        "The cards give a specialised range a calm comparison structure. Instead of compressing parts into a dense grid, each item has enough space to read as a distinct component. The red heart actions add a lightweight save behaviour without competing with the product images."
      ] },
      { path: "k_stady/store_4/Firefly_RemoveBackground.png", width: 327, height: 596, blend: "normal", alt: "Transparent Rider Parts mobile home screen with motorcycle exhaust hero and product cards", label: "05 · transparent mockup", title: "The same commerce screen without a background box", paragraphs: [
        "This supplied transparent PNG shows the Rider Parts home interface without a surrounding image background. The red motorcycle hero, Shop Now treatment, partner marks, deal row and large exhaust card remain intact while the outer area can sit directly on a coloured stage.",
        "That transparency makes the product interface useful in a branded presentation without introducing a pasted white rectangle. It also demonstrates why the screen’s internal contrast matters: the device keeps its own dark campaign image and pale cards, while the page behind it can remain part of the Rider Parts colour world."
      ] },
      { path: "k_stady/store_4/image copy 2.png", width: 620, height: 539, blend: "multiply", alt: "Rider Parts colour system board with red and charcoal swatches and component collage", label: "06 · colour system", title: "Red, charcoal and pale surfaces set the tone", paragraphs: [
        "The supplied board labels a Colour System and displays a run of pale pink-to-red swatches above a second run of grey-to-charcoal swatches. To the left, a small collage of the mobile product screens sits alongside an exhaust image and a short component-focused message.",
        "The visible palette explains the interface choices across the supplied screens. Red is used to direct attention and frame performance imagery, while whites and greys provide clean surfaces for components. The darker tones give the campaign areas enough weight without reducing the readability of product information."
      ] }
    ],
    delivery: "The delivery approach uses the supplied performance imagery, product screens and colour board as one coherent mobile commerce direction, keeping the route into parts clear throughout. TODO: confirm the final build, QA and handoff scope.",
  },
];

export const getCaseStudy = (slug?: string) => caseStudies.find((study) => study.slug === slug);
