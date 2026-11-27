import { LinkedHeading } from './GuideNavigation.tsx';

export function RendererNotes({ interactive }: { interactive: boolean }) {
  return (
    <section className="renderer-notes" aria-labelledby="renderer-notes">
      <LinkedHeading as="h2" id="renderer-notes" title="Checking a template" interactive={interactive} />
      <p>
        These recipes use <a href="https://github.com/svt-project/svt-spec/releases/tag/v1.0.0">SVT 1.0.0</a>.
        The observations below come from Chromium 159.0.8154.6, Firefox 159.0, and WebKit 27.2 on macOS.
        Print, PDF export, and other font installations need their own visual check.
      </p>
      <h3>Leave room for font fallback</h3>
      <p>
        In the <a href="#text-anchor">centered label</a>, the name uses <code>Georgia,serif</code> at
        52 units. The label is 620 units wide. Here are the measured text advances, rounded to the
        nearest SVG unit. To try the fallback in the template editor, replace <code>Georgia</code>
        with a missing family name and keep <code>serif</code>.
      </p>
      <table>
        <caption>Width of the same binding with two font choices</caption>
        <thead><tr><th scope="col">Place</th><th scope="col">Georgia</th><th scope="col">Fallback serif</th></tr></thead>
        <tbody>
          <tr><th scope="row">Flores</th><td>143</td><td>130</td></tr>
          <tr><th scope="row">Northumberland Passenger Terminal</th><td>859</td><td>764–768</td></tr>
          <tr><th scope="row">Empty string</th><td>0</td><td>0</td></tr>
          <tr><th scope="row">São Tomé 港</th><td>292</td><td>273–277</td></tr>
        </tbody>
      </table>
      <p>
        The long name overflowed in every run. Clearing the field removed the lettering and left
        the registration marks in place. A renderer can select another font for an individual glyph,
        so check names that use the scripts your readers will enter.
      </p>
      <h3>Check the crop with a second image</h3>
      <p>
        In the <a href="#align-image">corner comparison</a>, all three renderers cropped the
        960 × 540 headland horizontally and the 480 × 660 beacon vertically. The headland sun
        disappeared in the top-left crop and stayed round in the bottom-right crop. Stretching
        the whole headland made the sun tall and narrow. The same stretch made the beacon sun
        wide and short.
      </p>
      <h3>Check an editor save and export</h3>
      <ol>
        <li>
          Download the <a href="recipes/organize-form-fields.svg" download>grouped form template</a>.
          Save a copy in your SVG editor. If you distribute an optimized export, check that file too.
        </li>
        <li>
          Paste each saved file into the <a href="#organize-form-fields">grouped form’s template editor</a>.
          Compare the fields, their labels, defaults, help text, and order with the original.
          The passenger and destination fields belong under “Trip details” and the panel color under “Appearance.”
        </li>
        <li>
          Bind each field and reset it. If a field is missing, inspect its <code>data-svt-*</code> attribute
          and the root’s <code>data-svt-version</code>. If a label or group changed, compare the
          <code>svt:inputs</code> metadata and its namespace. A visually identical export can lose a
          hook or convert editable text to paths.
        </li>
      </ol>
      <p>
        To inspect the input inventory and bind a downloaded template from the command line,
        see the <a href="https://github.com/svt-project/svt-dotnet/blob/master/docs/authoring.md#try-a-template-first">.NET authoring walkthrough</a>.
      </p>
    </section>
  );
}
