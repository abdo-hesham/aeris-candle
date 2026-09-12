# AERIS design system

## Direction
Warm, botanical, unhurried. A single product story moves from golden forest light to a quiet ivory purchase section. The supplied forest composition and candle remain the visual source. Photography supplies atmosphere; HTML supplies hierarchy and interaction.

## Type hierarchy
- Display: Cormorant Garamond 300. Hero preserves its established 70–184px fluid size.
- Section heading: Cormorant Garamond 300, 53–112px desktop; 48–76px mobile. Line-height 0.98, tracking -0.035em.
- Emphasis: true Cormorant Garamond italic, used within section headings and short signatures.
- Detail heading: Cormorant Garamond 400, 32–51px.
- Body: Manrope 400, 16–18px, line-height 1.85, usually 36–47 characters wide.
- Controls: Manrope 500, 10–13px; form inputs 16px to avoid mobile zoom.
- Labels: Manrope 500, 10px with 0.16em tracking. Labels never replace readable body copy.

Both font families use next/font and are self-hosted after the build.

## Colour tokens
Defined in src/app/story.css using OKLCH:
- Forest: dark botanical surface and primary buttons.
- Moss: secondary text on ivory surfaces.
- Paper: warm light surface and text on forest.
- Sand: product photography surface.
- Amber: restrained atmospheric accent.
- Existing ivory/ink tokens preserve the hero's identity.

## Spacing and layout
8px base scale: 8, 16, 24, 32, 48, 64, 96px. Fluid page gutters: 24–112px. Chapter padding: 88–160px. Reading text stays narrow; product imagery receives more space. Discovery, Scent and Craft have asymmetric two-column layouts; mobile collapses to a deliberate single-column sequence. Purchase stops the environmental movement.

## Components
ChapterLabel, text links, primary buttons, quantity controls, scent tabs, numbered product hotspots, expandable FAQ, chapter navigation, global motion control, checkout drawer and delivery fields share these tokens.

Controls have keyboard focus states. Tabs support arrows, Home and End. Native dialogs contain keyboard focus, close with Escape and restore focus. FAQ buttons expose expanded state. Buttons have at least a 44px interaction target where practical; form fields are 48px tall.

## Motion rules
- UI transitions: 180–360ms, cubic-bezier(.22,1,.36,1).
- Ambient motion: 4–20 seconds; subtle product float, leaf breeze and mist.
- Scroll: GSAP with linear progress and scrub smoothing. Near branches move farther than distant trees.
- Reading copy stays in normal document flow. Reveal motion is brief; no persistent text parallax.
- No forced scroll snap or wheel interception that prevents normal navigation.
- Mobile has smaller movement distances and fewer particles.
- Reduced motion or the pause control restores static, fully readable sections. No content depends on an animation finishing.

## Chapter map
01 Arrival: original forest hero.
02 Discovery: inspiration text and a close moss study.
03 Atmosphere: interactive scent notes and changing forest detail.
04 Craft: ivory close-up, product hotspots and confirmed specifications.
05 Ritual: dusk, warm candle and quiet reading.
06 Purchase: stationary product portrait, $45 price, quantity, cart, FAQ and footer.

## Product truth
Confirmed by the owner: Aeris, USD 45, Large, natural wax, stated 120-hour burn time. Wick type and exact dimensions are not specified and are not invented. Scent notes remain the existing concept copy, to be confirmed before public launch. No unverified environmental certification is claimed.
