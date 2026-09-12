# AERIS fireplace campaign

This is the active landing page at `/`. The supplied fireplace reference supersedes the previous forest campaign. The old forest components and assets remain available but are not imported by the page.

## Run

```sh
npm install
npm run dev
```

Open http://localhost:3000. For production, run `npm run build` then `npm start`. Next/font downloads Cormorant Garamond and the existing Manrope UI font during the build, then serves them locally.

The existing dependencies include Next.js 15, React, TypeScript, Tailwind CSS 4, GSAP, @gsap/react and Lenis. No new package installation is needed in this checkout.

## Active structure

```text
src/app/page.tsx                       Route
src/app/layout.tsx                     Fonts and metadata
src/app/warm.css                       Responsive fireplace design and ambient motion
src/components/Warm/Experience.tsx     Story, scent tabs, product, motion lifecycle
src/components/Warm/Hero.tsx           Live navigation, headline and layered scene
src/components/Warm/motion.ts          Configurable parallax timeline
src/components/Story/Checkout.tsx      Existing local checkout preview
src/data/product.ts                    Price and product specifications
public/assets/fireplace-bg.png         Generated clean room plate
public/assets/warm-candle.png          Generated transparent ceramic vessel
tests/warm.spec.ts                     Desktop, mobile, motion and keyboard checks
tests/hero.spec.ts                     Delivery and local order flow
```

## Assets and composition

The reference is not used as a flattened page. The room plate has all typography and the original candle removed. The candle is an independent transparent PNG. Navigation and copy are live HTML; the flame, fireplace glow and haze are separate CSS layers. A feathered crop of the room supplies a subtle foreground layer.

Replace `public/assets/fireplace-bg.png` with a 16:9 clean interior image. Replace `public/assets/warm-candle.png` with an alpha PNG using the same transparent margins (vessel occupies approximately 70% of width and 80% of height). Adjust `.warm-product-layer` and `.warm-flame` in `warm.css` if the replacement has different framing. Existing forest assets are not required for this route.

## Motion and content

`motion.ts` exports scroll duration, background zoom, candle scale, heading travel, foreground travel and Lenis duration. A GSAP ScrollTrigger pins the hero and scrubs the layer transforms at independent rates. Lenis updates ScrollTrigger on scroll and runs from the same GSAP ticker. GSAP context and matchMedia revert animations and remove ticker callbacks on cleanup. Mobile uses a shorter pinned sequence. Reduced-motion preference and the pause button disable smooth scrolling, pinning and ambient animation while preserving all content.

Edit hero copy in `Hero.tsx`; story copy and scent definitions in `Experience.tsx`; confirmed price and specifications in `src/data/product.ts`. Sandalwood, amber and cedar are campaign concept notes from the brief. The existing local checkout takes no payment and sends no order. Connecting a real checkout remains separate work.

## Verify

```sh
npm run typecheck
npm run build
npm test
```

Tests use installed Microsoft Edge and a production server on port 3100. To test an existing dev server in PowerShell:

```powershell
$env:AERIS_TEST_URL='http://127.0.0.1:3000'
npm test
```

## Centered product reveal

The hero now transitions into a warm product portrait during its pinned scroll. The same candle moves to the horizontal center, surrounded by a circular outline and four product callouts. `ProductDetails.tsx` owns these labels; `motion.ts` owns the centering and reveal timing. Reduced-motion and paused views show the details as a separate static section. Desktop vessel and flame positions use the exact user-supplied September 7 values; mobile retains responsive overrides.


The product portrait now scales the desktop candle to 0.78 and mobile candle to 0.82. The circle traces clockwise across four scroll intervals. Each interval reveals one label and retains the previous labels. Tune `pointInterval`, `pointRevealDuration`, `candleScale` and `scrollLength` in `motion.ts`.

