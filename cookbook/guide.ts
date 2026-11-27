import type { RecipeGroup } from './guide-model.ts';

export const groups: readonly RecipeGroup[] = [
  {
    name: 'Text',
    exercises: [
      {
        id: 'replace-text',
        title: 'Replace a line of text',
        alt: 'Ferry departure board with a destination beneath the words Next sailing.',
        note: '`data-svt-text` makes a line of text editable.',
        lesson:
          'The `<text>` element supplies the default destination, “North Pier.” When SVT binds a value to `destination`, it replaces that element’s text content. SVG keeps the position, font, and color defined on the element.',
        excerpt: [{ attribute: 'data-svt-text' }],
      },
      {
        id: 'text-anchor',
        title: 'Keep changing text centered',
        alt: 'Cream archive label with a place name centered between two registration marks.',
        note: '`text-anchor="middle"` keeps a name centered as its length changes.',
        lesson:
          'SVT replaces the place name. SVG centers the new text on the `x` coordinate marked by the two ticks. The rendered width depends on the name and font, so a long name can still extend beyond the label.',
        excerpt: [{ attribute: 'data-svt-text' }],
      },
      {
        id: 'text-leaf',
        title: 'Keep a unit beside an editable number',
        alt: 'Tide gauge with a reading followed by a smaller m for meters.',
        note: 'A separate `<tspan>` lets the number change while its unit stays beside it.',
        lesson:
          'Only the first `<tspan>` carries `data-svt-text`. SVG positions the second `<tspan>` after the replacement number, with `dx` adding a small gap before the unit. An empty text value clears the number and leaves the unit visible.',
        excerpt: [{ element: 'text', child: 'tspan' }],
      },
      {
        id: 'text-length',
        title: 'Fit text to a fixed width',
        alt: 'Harbor name stretched between two vertical guides.',
        note: '`textLength` gives short and long names the same width on the sign.',
        lesson:
          'After SVT replaces the name, SVG fits the text to `textLength="512"`. With `lengthAdjust="spacingAndGlyphs"`, both letter spacing and glyph widths can change to reach that length.',
        excerpt: [{ attribute: 'data-svt-text' }],
      },
      {
        id: 'text-on-a-curve',
        title: 'Set editable text along a curve',
        alt: 'A port name arcs over a sailboat seal.',
        note: 'A `<textPath>` carries an editable name around the top of a seal.',
        lesson: 'SVT binds the port name inside the leaf `<tspan>`. SVG lays the letters along the path referenced by `href`. With `startOffset="50%"` and `text-anchor="middle"`, the midpoint of the lettering stays at the midpoint of the curve.',
        excerpt: ['defs', { element: 'text', child: 'textPath' }],
      },
    ],
  },
  {
    name: 'Images',
    exercises: [
      {
        id: 'replace-image',
        title: 'Replace an image',
        alt: 'A single coastal illustration mounted on a postcard.',
        note: '`data-svt-image` makes the artwork in a postcard replaceable.',
        lesson:
          'The `<image>` element gets its starting artwork from `href`. SVT embeds the selected artwork in that attribute, and SVG uses the element’s `width` and `height` to size the replacement. A relative `href` such as `artwork/postcard.png` resolves against the SVG document’s base URL. Moving the SVG changes where a viewer looks for that file. Preserve the directory layout, update the reference, or embed the image as the cookbook downloads do.',
        excerpt: ['image'],
      },
      {
        id: 'image-fit',
        title: 'Fit or crop an image to a frame',
        alt: 'The same coastal illustration in two frames labeled Contain and Crop.',
        note: '`preserveAspectRatio` lets a frame show the whole image or crop it to fill the space.',
        lesson:
          'Both `<image>` elements use `data-svt-image="artwork"`, so one image choice updates both frames. With `meet`, SVG scales the whole image to fit inside the frame. With `slice`, it fills the frame and crops the excess. Both use `xMidYMid` to center the result.',
        excerpt: ['image'],
      },
      {
        id: 'align-image',
        title: 'Keep one corner visible when cropping an image',
        alt: 'Three square frames show the top-left crop, bottom-right crop, and stretched whole illustration.',
        note: 'Corner alignment chooses which edge survives a crop. `none` stretches the whole image into the frame.',
        lesson: 'All three frames share the `artwork` input. The wide headland loses its right edge with `xMinYMin slice` and its left edge with `xMaxYMax slice`. Switching to the tall beacon moves the crop to the bottom or top instead. In the third frame, `preserveAspectRatio="none"` scales each axis independently, turning the round sun into an oval.',
        excerpt: ['image'],
      },
      {
        id: 'border-an-image',
        title: 'Add a border to a replaceable image',
        alt: 'A coastal print with a colored border that follows its rounded corners.',
        note: 'One rounded rectangle shapes the image and supplies its editable border.',
        lesson: 'A `<clipPath>` uses the rectangle to trim the image corners. A second `<use>` draws the same outline over the image with `fill="none"`. SVT binds the border color through `data-svt-stroke`. The `stroke-width` sets the thickness, with half the stroke on each side of the edge.',
        excerpt: ['defs', 'image', { attribute: 'data-svt-stroke' }],
      },
      {
        id: 'zoom-image-detail',
        title: 'Zoom in on part of an image',
        alt: 'A dashed square marks a detail on the full illustration. The neighboring frame shows that region at twice the size.',
        note: 'A smaller `viewBox` enlarges the outlined part of the image while keeping its proportions.',
        lesson: 'The whole image fits inside a 200 × 200 drawing area using `xMidYMid meet`. The detail’s `viewBox="65 48 100 100"` starts 65 units from the left and 48 from the top. Its 100 × 100 area fills a 200 × 200 frame at 2× scale. The first two numbers position the crop. Reducing the last two in the same proportion zooms in further. Zoom and clipping change what is visible. The complete image remains in the SVG. To discard pixels or reduce the embedded payload, crop and re-encode the source before binding it.',
        excerpt: ['defs', { element: 'svg', attribute: 'x' }],
      },
      {
        id: 'fade-an-image',
        title: 'Fade an image into its background',
        alt: 'A coastal view gradually emerges from the cream background beside a field-note title.',
        note: 'A gradient in a `<mask>` blends the edge of a replaceable image into the page.',
        lesson: 'The white mask fades from transparent to opaque as `stop-opacity` increases. SVG reveals progressively more of the image across that transition. SVT updates `href` on the `<image>`, so each replacement uses the same fade.',
        excerpt: ['defs', 'image'],
      },
    ],
  },
  {
    name: 'Color',
    exercises: [
      {
        id: 'change-fill',
        title: 'Change a shape’s fill color',
        alt: 'A triangular harbor pennant flying from a dark mast.',
        note: '`data-svt-fill` makes the pennant’s color editable.',
        lesson:
          'The picker reads the authored `rgb(206 99 71)` color. The template keeps that spelling until a replacement is bound to `pennant`, which updates the path’s `fill` attribute.',
        excerpt: [{ attribute: 'data-svt-fill' }],
      },
      {
        id: 'shared-color',
        title: 'Share one color across fills and strokes',
        alt: 'Map with a dashed route from West Pier to a pin at Beacon Hill.',
        note: 'A shared input key lets one color control both `fill` and `stroke`.',
        lesson:
          'The pin’s `data-svt-fill` and the route’s `data-svt-stroke` both name the `route` input. An assignment to `route` updates both attributes. Omitting it preserves each path’s original color.',
        excerpt: [{ attribute: 'data-svt-stroke' }, { attribute: 'data-svt-fill' }],
      },
      {
        id: 'color-cascade',
        title: 'Find out why a fill color won’t change',
        alt: 'Two signal discs, one painted by an attribute and one by a class rule.',
        note: 'A CSS rule can keep a shape the same color even when its `fill` attribute changes.',
        lesson:
          'SVT writes the selected color to `fill` on both circles. The left circle takes its color from that attribute. On the right circle, the `.signal` rule takes precedence, so SVG continues to render the color from the stylesheet.',
        excerpt: ['style', { element: 'g', attribute: 'stroke' }],
      },
      {
        id: 'keep-color-shading',
        title: 'Keep highlights and shadows when recoloring a shape',
        alt: 'A spherical fishing float has a pale highlight near its top and a shaded lower rim.',
        note: 'A translucent gradient adds depth to a shape with an editable base color.',
        lesson: 'SVT updates `fill` on the lower circle. SVG paints a second circle over it using `<radialGradient>`. The transparent middle reveals the base color, while the pale and dark stops tint the highlight and shadow.',
        excerpt: ['defs', 'circle'],
      },
    ],
  },
  {
    name: 'Composition',
    exercises: [
      {
        id: 'layer-text',
        title: 'Layer editable text over a background',
        alt: 'A colored panel with a boat name printed across it.',
        note: 'Separate inputs make the boat name and its background color independently editable.',
        lesson:
          'SVG draws the `<rect>` before the `<text>`, placing the name on top of the panel. SVT binds `panel` to the rectangle’s `fill` and `name` to the lettering. Binding either input preserves the drawing order.',
        excerpt: [{ attribute: 'data-svt-fill' }, { attribute: 'data-svt-text' }],
      },
      {
        id: 'exhibition-card',
        title: 'Clip a replaceable image to a shape',
        alt: 'Gallery card with a title on the left and an arched coastal print on the right.',
        note: 'A `<clipPath>` gives each replacement image the same arched outline.',
        lesson:
          'SVT replaces the artwork in the `<image>` element. SVG scales it to cover the image area, then applies `clip-path="url(#arch)"` so only the portion inside the arch is visible.',
        excerpt: ['defs', 'image', { attribute: 'data-svt-text' }, { attribute: 'data-svt-fill' }, { attribute: 'data-svt-stroke' }],
      },
      {
        id: 'repeat-a-label',
        title: 'Show one editable value in two places',
        alt: 'A passenger ticket and its detachable claim stub carry the same serial number in two sizes.',
        note: 'One `data-svt-text` key gives the ticket and its stub the same editable number.',
        lesson: 'Both `<text>` elements declare `data-svt-text="ticket"`. SVT lists one field and writes its value to both elements. SVG draws the number at each element’s own position, size, and color.',
        excerpt: [{ attribute: 'data-svt-text' }],
      },
    ],
  },
  {
    name: 'Metadata',
    exercises: [
      {
        id: 'label-a-field',
        title: 'Give a form field a readable label',
        alt: 'A coastal print in a cream mount with the caption From the lookout.',
        note: '`data-svt-label` gives an editable field a readable name.',
        lesson:
          'The form displays “View from the lookout” from the inline label. SVT still identifies the image input by `print`, the key declared in `data-svt-image`.',
        excerpt: [{ attribute: 'data-svt-label' }],
      },
      {
        id: 'add-field-help',
        title: 'Add help text to a field',
        alt: 'A harbor arrival board displaying a time in large numerals.',
        note: '`<svt:description>` adds a short explanation beneath a form field.',
        lesson:
          'The `<svt:input>` declaration refers to the `eta` text input by key. Its `label` supplies the field name, and its `<svt:description>` provides the 24-hour time hint. SVT binds the entered time as ordinary text.',
        excerpt: ['metadata', { attribute: 'data-svt-text' }],
      },
      {
        id: 'organize-form-fields',
        title: 'Group fields and set their order',
        alt: 'A harbor pass with a passenger name and destination on a colored panel.',
        note: '`<svt:group>` puts related fields together, and `order` sets their sequence in the form.',
        lesson:
          'Each `<svt:input>` names its group with the `group` attribute. SVT uses ascending `order` values to arrange the groups and the fields within each group. Here, “Trip details” comes before “Appearance,” even though SVG draws the colored panel first.',
        excerpt: ['svt:inputs'],
      },
    ],
  },
];
