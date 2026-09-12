# Asset preparation

All generated assets were made with the built-in image generation tool, using the supplied clipboard image as the primary visual reference. Output copies are in `public/assets/`; untouched generator masters remain in the tool's generated-images directory. PNG optimization uses Sharp and preserves alpha. No external stock images are used.

## Final prompt set

### forest-background.png
Edit target reference into a clean photographic environment plate for a layered website. Preserve this exact forest composition, golden upper-left sunbeams, moss mound lower center-right, green ferns, depth of field and natural cinematic light. Remove ALL typography, ALL logos, navbar and bag icon, and REMOVE THE CANDLE completely, reconstructing uninterrupted moss where the candle stood. Also remove the closest blurred foreground leaves in bottom left and upper/right edges (will be separate layers), replace with consistent forest. No products, no letters anywhere. Landscape 16:9 high resolution.

### candle-product.png
Extract/recreate only the exact cream cylindrical ceramic candle from this reference as a standalone photorealistic product cutout on genuinely transparent alpha background. Same almost square short cylinder proportions, oval open rim seen slightly from above, cream wax with tiny lit wick, fine ceramic surface and small thin dark botanical loop emblem centered on front. Preserve warm upper-left sunlight and right shaded olive side. No forest, no moss, no ground, no backdrop, no cast ground shadow, no typography. Tight centered crop with 5% transparent padding. High quality 700x700 approximately.

### foreground-left-leaves.png
Create a photorealistic isolated foreground leafy branch for compositing over attached forest. A graceful dark olive green beech branch entering from bottom-left, leaves angled toward upper-right, warm sunlight catching edges, slightly out of focus shallow depth of field, organic and sparse. Genuinely transparent alpha background. No forest, no text, no ground. Branch fills bottom-left and left side of square canvas; rest transparent.

### foreground-right-leaves.png
Create a photorealistic isolated foreground leafy branch matching attached forest. Dark olive beech leaves suspended from an arching branch entering from upper-right, reaching inward and down toward center-left. Warm sunlight catching translucent veins and dew edges, shallow depth of field. Genuinely transparent alpha background. No forest, no text, no ground. Branch occupies top and right of square canvas, center-left empty.

### fog-overlay.png
Create a compositing asset: extremely delicate wisps of warm ivory forest mist on genuinely transparent alpha background. Wide horizontal 16:9 texture. Low density translucent pale drifting fog, soft feathered edges, no opaque background, no scene, no objects, no text.

### particles.png
Create a compositing sprite: one tiny softly glowing warm ivory pollen speck at center on genuinely transparent alpha background. Soft round speck with very faint halo, no scene or text. Minimal texture sprite for a forest website particle system.
# Modeled hero update

The live hero environment now uses modeled terrain, branches and leaves, plus local CC0 woodland assets from Poly Haven. The supplied 3.8-second video was inspected at several timestamps. Its large curved branch, growing moss and close fern framing informed the new foreground composition. The video itself is not shipped with the website.

Sources: [Bark Brown 02](https://polyhaven.com/a/bark_brown_02), [Forest Ground 04](https://polyhaven.com/a/forest_ground_04), [Fern 02](https://polyhaven.com/a/fern_02), [Moss 01](https://polyhaven.com/a/moss_01), [Rock Moss Set 01](https://polyhaven.com/a/rock_moss_set_01). All are CC0; see public/assets/models/LICENSE.md. Texture maps are applied to 3D surfaces; they are not full environment image planes. Foliage uses opacity maps for natural leaf edges.

The candle's shared product photograph supplies the projected surface texture on the 3D vessel, including the original speckles and logo. It is a front-view reconstruction; no unseen rear surface is claimed to be exact. Existing generated environment assets below remain for fallback and the subsequent story sections.
