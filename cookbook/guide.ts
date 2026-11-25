import type { RecipeGroup } from './guide-model.ts';

export const groups: readonly RecipeGroup[] = [
  {
    name: 'Text',
    exercises: [
      {
        id: 'text-anchor',
        title: 'Center a specimen label',
        alt: 'Cream archive label with a place name centered between two registration marks.',
        note: 'Replace Flores with São Tomé & Príncipe. The two guide marks stay aligned with the middle of the name as its width changes.',
        lesson:
          'Put the anchor on the text element and set x to the center of the label. Long names can still reach its edges. Font availability also changes the width, so try the longest name in your target renderer.',
        lines: ['data-svt-text'],
      },
      {
        id: 'text-leaf',
        title: 'Keep the unit beside the value',
        alt: 'Tide gauge with a reading followed by a smaller m for meters.',
        note: 'Change the gauge reading to 12.75, then clear it. The unit follows the changing number and stays on the gauge when the number is empty.',
        lesson:
          'Put the input on the leaf tspan. The next span continues from its sibling’s final position, with dx providing a small gap. Reset restores the original reading.',
        lines: ['data-svt-text'],
      },
      {
        id: 'text-length',
        title: 'Fit a harbor name to a sign',
        alt: 'Harbor name stretched between two vertical guides.',
        note: 'Compare Bay and South Anchorage. Both occupy the same sign width. Look at the shapes of the letters near the extremes.',
        lesson:
          'textLength fixes the advance. With lengthAdjust="spacingAndGlyphs" the renderer adjusts spacing and glyph widths. Use this treatment where matching an allotted width matters more than preserving natural letterforms.',
        lines: ['data-svt-text'],
      },
    ],
  },
  {
    name: 'Images',
    exercises: [
      {
        id: 'image-fit',
        title: 'Contain or crop an illustration',
        alt: 'The same coastal illustration in two frames labeled Contain and Crop.',
        note: 'Switch from the wide headland to the tall beacon. Compare the margins and the parts of the illustration visible in each frame.',
        lesson:
          'Both frames receive the same image bytes under separate input keys. meet preserves the whole illustration. slice fills the viewport and crops around the chosen alignment. Embedded artwork travels with the SVG when its document base changes.',
        lines: ['preserveAspectRatio'],
      },
    ],
  },
  {
    name: 'Color',
    exercises: [
      {
        id: 'shared-color',
        title: 'Coordinate a pin and its route',
        alt: 'Map with a dashed route from West Pier to a pin at Beacon Hill.',
        note: 'Choose a route color. The pin and dashed line pick it up together. Reset to recover their two distinct authored colors.',
        lesson:
          'Use the same paint key on fill and stroke. The two targets can start with different colors. Omitting the assignment preserves each original value.',
        lines: ['data-svt-stroke', 'data-svt-fill'],
      },
      {
        id: 'color-cascade',
        title: 'See which paint wins',
        alt: 'Two signal discs, one painted by an attribute and one by a class rule.',
        note: 'Change the signal color. Only the left disc changes appearance, even though both fill attributes receive the new paint.',
        lesson:
          'A class rule overrides the presentation attribute on the right disc. Keep editable paint on a presentation attribute and remove competing CSS when the replacement should be visible.',
        lines: ['<style>', 'data-svt-fill'],
      },
    ],
  },
  {
    name: 'Composition',
    exercises: [
      {
        id: 'exhibition-card',
        title: 'Frame an exhibition print',
        alt: 'Gallery card with a title on the left and an arched coastal print on the right.',
        note: 'Change the exhibition title, swap the print, and choose an accent. The arch keeps its silhouette through every edit.',
        lesson:
          'Keep the clip path and typography in the template. Bind only the image, title, and accent. After saving from a drawing editor, reopen the source and check that its data-svt hooks and clip-path reference survived.',
        lines: ['<defs>', 'clip-path=', 'data-svt-text', 'data-svt-fill', 'data-svt-stroke'],
      },
    ],
  },
];
