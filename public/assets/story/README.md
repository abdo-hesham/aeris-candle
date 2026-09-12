# AERIS story artwork provenance

These are original deterministic procedural illustrations and a supplied-product composite, not photographs or output from an image-generation model. No stock imagery or remote resources were used.

Rebuild from the repository with `python scripts/generate-story-assets.py`. Requires Python, Pillow and NumPy. Seed: 81023.

- `sandalwood.webp` — 1440 × 1080. Pillow/NumPy split-heartwood illustration with warped longitudinal fibers, broken edges, cross-grain end details, scattered splinters and offset soft shadows.
- `amber.webp` — 1440 × 1080. Original amber-resin illustration with irregular fracture planes, layered gold/brown depth, inclusions, surface traces and soft ground shadows.
- `cedar.webp` — 1440 × 1080. Recursive original botanical illustration of cedar-like scale foliage with darker split wood, individually varied leaf scales and offset shadows. An artistic scent-note illustration, not a botanical identification reference.
- `purchase.webp` — 1200 × 1500. Existing `public/assets/candle-without-flame.png` composited without redrawing the vessel, wax, wick or branding. Robust alpha bounds remove empty padding, preserving the source's product pixels; original sand studio ground and soft offset/contact shadows are added. Source asset provenance remains that of the supplied repository file.
- `contact-sheet.jpg` — review-only montage of the four final assets, no captions.
- `manifest.json` — dimensions and byte counts read from actual decoded final WebP files.

Art direction: warm ivory/sand ground, upper-left studio lighting, asymmetric ingredient arrangements, quiet negative space. No text added to artwork; existing candle emblem retained. WebP export: quality 94, method 6. The generator only writes inside this directory.
