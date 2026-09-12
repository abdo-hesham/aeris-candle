> Current campaign: the fireplace landing page. See [FIREPLACE.md](FIREPLACE.md) for active files, setup, assets and motion controls. The forest documentation below is retained for reference.

# AERIS — one product, six chapters

A responsive Next.js 15 App Router website with React, TypeScript, Tailwind CSS, Cormorant Garamond, Manrope, GSAP, ScrollTrigger and Lenis.

## Run

Use Node.js 22 LTS or 24:

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Production: `npm run build`, then `npm start`.

TypeScript is pinned to 5.9.3 because Next.js 15 requires the JavaScript compiler API absent from the previously installed TypeScript 7 package. PostCSS is overridden to the patched 8.5.28 release.

## Website structure

- Hero: separate forest, candle, leaves, mist, particles and HTML heading.
- Discovery: the candle's forest inspiration.
- Atmosphere: keyboard-accessible scent-note tabs.
- Craft: product hotspots, natural wax, Large size and 120-hour burn time.
- Ritual: dusk atmosphere and quiet editorial copy.
- Purchase: Aeris at $45, quantity, local checkout, FAQ and footer.

```text
src/app/
  page.tsx              # Experience entry point
  layout.tsx            # Metadata and self-hosted fonts
  globals.css           # Original hero styles
  story.css             # Shared design tokens, chapters and checkout
src/components/Hero/    # Independent hero scene layers and ambient motion
src/components/Story/
  Experience.tsx        # Motion preferences, Lenis, chapter navigation
  storyAnimations.ts    # Hero departure and forest journey timelines
  StoryStage.tsx        # Sticky shared environment, branches and mist
  MotionContext.tsx     # Global pause/reduced-motion state
  ChapterLabel.tsx
  Discovery.tsx
  Scents.tsx
  Craft.tsx
  Ritual.tsx
  Purchase.tsx
  Checkout.tsx
src/data/product.ts     # Confirmed product facts and future checkout URL
public/assets/          # Reference and six separated scene assets
scripts/optimize-assets.mjs
 tests/hero.spec.ts     # Browser interaction and local checkout tests
```

See DESIGN.md for font hierarchy, palette, spacing, reusable controls and motion rules. ASSETS.md records the generated-asset prompts and reference analysis.

## Local checkout

The complete local flow is: quantity → bag → validated delivery form → editable order review → local order confirmation. Aeris costs USD 45 per candle. Demo shipping is USD 0; the review labels the total as a demo total. No payment is collected and no order is submitted, emailed or shipped.

`aeris-cart` in localStorage stores quantity. On confirmation, `aeris-last-order` stores only reference, quantity, total and date; the cart is cleared. Name, email and address stay in React state for the current checkout and are discarded when the drawer closes. The flow still completes in memory if browser storage is unavailable. Duplicate submission is guarded.

Before launch, replace the local `placeOrder` function with an authenticated server order endpoint, compute trusted prices and shipping on the server, and connect the payment gateway. Do not treat localStorage as authoritative order data. A simple external checkout can instead be enabled through `checkoutUrl` in src/data/product.ts. The current external-link path is single-product and does not serialize the local quantity; integrate your provider's cart API for that.

## Modify the design

Shared tokens are at the top of src/app/story.css. Font families and loaded weights are in layout.tsx. Product information is in src/data/product.ts. Section content is organized by chapter under src/components/Story. Scent-note copy remains concept content pending confirmation; no wick or exact dimension claim is invented.

## Replace scene assets

Replace candle-product.png with a transparent square PNG, preserving roughly the current padding and upper-left lighting. Keep shadows out of the image. Tune .product-position for the hero; Craft and Purchase use responsive image sizing. Replace forest-background.png with a landscape plate that has no product or lettering. Adjust object-position for scene crops. The original hero-reference.png is for reference only and is never used as the page background.

Background/product use Next Image optimization and priority in the hero; other images lazy-load. The generated assets are recreations from the supplied image, not pixel-exact extractions. `node scripts/optimize-assets.mjs` recompresses files in place and verifies alpha; keep original replacement masters first.

## Scroll architecture

The previous unused scaffold is superseded by src/components/Story/storyAnimations.ts. The hero departure timeline moves the environment slowly and nearby branches more strongly as the hero leaves. A second normalized forest timeline follows the shared sticky environment through Discovery, Scent, Craft and Ritual. Labels reserve discovery (0), scent (0.22), craft (0.45), dusk (0.7) and home (1). Native document scrolling provides pacing; no section traps the scroll position.

The environment camera, near branches and mist own independent transforms. Ambient hero loops own inner wrappers, while scroll uses outer wrappers. Purchase has no parallax so forms remain stable. Lenis runs once from Experience on the GSAP ticker and synchronizes ScrollTrigger. Scoped useGSAP cleanup removes timelines, triggers, listeners and ticker callbacks. Reduced motion and pause revert scroll transforms and reveal styles without hiding content.

Ambient distances/durations live in Hero/heroAnimations.ts. Scroll distances and timings live in Story/storyAnimations.ts. Mobile distances are lower. Frame rate depends on the device; test target hardware before release.

## Validate

```bash
npm run typecheck
npm run build
npm test
```

Playwright uses installed Microsoft Edge and starts a production server when no server is running. For bundled Chromium, run `npx playwright install chromium` and remove `channel: "msedge"` from playwright.config.ts. Tests cover all six sections, font rendering, navigation, scent tabs, hotspots, pause, reduced motion, mobile overflow, form validation and a USD 90 two-candle local order. Screenshots go to test-results/.

## 3D hero enhancement

HeroWebGL.tsx lazy-loads Three.js after the HTML scene. The hero now contains a fully modeled woodland: displaced terrain, tapered trunks, branching limbs, individual canopy leaves, a curved fallen branch, fern plants, moss, rocks, atmospheric light volumes and spatial pollen. The supplied video informs the large moss-covered foreground branch. Local CC0 models and physical material maps add surface detail. The forest photograph and DOM foliage/fog are hidden once WebGL renders; no environment photograph is mapped onto a background plane.

The candle has a rounded lathed vessel, recessed wax and separate wick/flame geometry. Its original product photograph is projected onto the curved surface, preserving the actual mineral speckles, warm ceramic shading and logo used in the other sections. Small pointer rotations change the geometry and light response. This is a single-view texture reconstruction, not a 360-degree product scan; large rotations would require additional product photography. Text remains HTML.

Both renderers cap pixel ratio, skip drawing when the hero is offscreen or the document hidden, and stop animation on pause/reduced motion. Reduced motion displays the same 3D composition as a still frame. Geometry, materials, textures and observers are disposed on unmount. Context loss restores the photographic fallback. Instanced plants share geometry and draw calls, mobile uses fewer instances, and static shadow maps are reused between frames. Actual frame rate depends on the device.

Edit forestScene.ts for terrain, tree placement, lighting, the branch curve, fog and wind. woodlandModels.ts places the local fern, moss and rock assets. candleScene.ts controls vessel proportions, the reference projection and flame. HeroWebGL.tsx controls camera movement and rendering quality. Forward scroll travel moves the actual forest camera by up to 3.6 scene units. The remaining story sections retain their existing imagery and GSAP transitions.

Replacing candle-product.png also changes the projected hero texture. Keep the square framing and vessel proportions, or recalibrate the orthographic camera and lathe profile in candleScene.ts. Environment photos now affect only the hero fallback and subsequent story sections; edit forestScene.ts to change the live hero environment. Assets are served locally without a CDN dependency at runtime. Source links and licenses are in ASSETS.md.

For isolated validation alongside a running dev server, set AERIS_DIST_DIR=.next-check for both `npm run build` and `npm test`. Browser tests use port 3100; normal development stays on 3000.

