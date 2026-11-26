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
        lines: ['data-svt-text'],
      },
      {
        id: 'text-anchor',
        title: 'Keep changing text centered',
        alt: 'Cream archive label with a place name centered between two registration marks.',
        note: '`text-anchor="middle"` keeps a name centered as its length changes.',
        lesson:
          'SVT replaces the place name. SVG centers the new text on the `x` coordinate marked by the two ticks. The rendered width depends on the name and font, so a long name can still extend beyond the label.',
        lines: ['data-svt-text'],
      },
      {
        id: 'text-leaf',
        title: 'Keep a unit beside an editable number',
        alt: 'Tide gauge with a reading followed by a smaller m for meters.',
        note: 'A separate `<tspan>` lets the number change while its unit stays beside it.',
        lesson:
          'Only the first `<tspan>` carries `data-svt-text`. SVG positions the second `<tspan>` after the replacement number, with `dx` adding a small gap before the unit. An empty text value clears the number and leaves the unit visible.',
        lines: ['data-svt-text'],
      },
      {
        id: 'text-length',
        title: 'Fit text to a fixed width',
        alt: 'Harbor name stretched between two vertical guides.',
        note: '`textLength` gives short and long names the same width on the sign.',
        lesson:
          'After SVT replaces the name, SVG fits the text to `textLength="512"`. With `lengthAdjust="spacingAndGlyphs"`, both letter spacing and glyph widths can change to reach that length.',
        lines: ['data-svt-text'],
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
          'The `<image>` element gets its starting artwork from `href`. SVT embeds the selected artwork in that attribute, and SVG uses the element’s `width` and `height` to size the replacement.',
        lines: ['data-svt-image'],
      },
      {
        id: 'image-fit',
        linkedImages: ['contained', 'cropped'],
        title: 'Fit or crop an image to a frame',
        alt: 'The same coastal illustration in two frames labeled Contain and Crop.',
        note: '`preserveAspectRatio` lets a frame show the whole image or crop it to fill the space.',
        lesson:
          'The form binds the same artwork to two `<image>` elements. With `meet`, SVG scales the image until it fits inside the frame. With `slice`, it scales the image until it covers the frame. Both use `xMidYMid` to center the result.',
        lines: ['preserveAspectRatio'],
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
          'The pennant’s `<path>` supplies its original color through `fill`. SVT writes the chosen color to that attribute when it binds the `pennant` input.',
        lines: ['data-svt-fill'],
      },
      {
        id: 'shared-color',
        title: 'Share one color across fills and strokes',
        alt: 'Map with a dashed route from West Pier to a pin at Beacon Hill.',
        note: 'A shared input key lets one color control both `fill` and `stroke`.',
        lesson:
          'The pin’s `data-svt-fill` and the route’s `data-svt-stroke` both name the `route` input. An assignment to `route` updates both attributes. Omitting it preserves each path’s original color.',
        lines: ['data-svt-stroke', 'data-svt-fill'],
      },
      {
        id: 'color-cascade',
        title: 'Find out why a fill color won’t change',
        alt: 'Two signal discs, one painted by an attribute and one by a class rule.',
        note: 'A CSS rule can keep a shape the same color even when its `fill` attribute changes.',
        lesson:
          'SVT writes the selected color to `fill` on both circles. The left circle takes its color from that attribute. On the right circle, the `.signal` rule takes precedence, so SVG continues to render the color from the stylesheet.',
        lines: ['<style>', 'data-svt-fill'],
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
        lines: ['data-svt-fill', 'data-svt-text'],
      },
      {
        id: 'exhibition-card',
        title: 'Clip a replaceable image to a shape',
        alt: 'Gallery card with a title on the left and an arched coastal print on the right.',
        note: 'A `<clipPath>` gives each replacement image the same arched outline.',
        lesson:
          'SVT replaces the artwork in the `<image>` element. SVG scales it to cover the image area, then applies `clip-path="url(#arch)"` so only the portion inside the arch is visible.',
        lines: ['<defs>', 'clip-path=', 'data-svt-text', 'data-svt-fill', 'data-svt-stroke'],
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
        lines: ['data-svt-label'],
      },
      {
        id: 'add-field-help',
        title: 'Add help text to a field',
        alt: 'A harbor arrival board displaying a time in large numerals.',
        note: '`<svt:description>` adds a short explanation beneath a form field.',
        lesson:
          'The `<svt:input>` declaration refers to the `eta` text input by key. Its `label` supplies the field name, and its `<svt:description>` provides the 24-hour time hint. SVT binds the entered time as ordinary text.',
        lines: ['metadata', 'svt:', 'rdf:', 'data-svt-text'],
      },
      {
        id: 'organize-form-fields',
        title: 'Group fields and set their order',
        alt: 'A harbor pass with a passenger name and destination on a colored panel.',
        note: '`<svt:group>` puts related fields together, and `order` sets their sequence in the form.',
        lesson:
          'Each `<svt:input>` names its group with the `group` attribute. SVT uses ascending `order` values to arrange the groups and the fields within each group. Here, “Trip details” comes before “Appearance,” even though SVG draws the colored panel first.',
        lines: ['svt:inputs', 'svt:group', 'svt:input ', 'svt:description'],
      },
    ],
  },
];
