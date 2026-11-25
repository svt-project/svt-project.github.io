import { PageIntro } from '../PageIntro.tsx';
export function NamespacePage() {
  return (
    <main id="main" className="wrap">
      <article className="article">
        <PageIntro eyebrow="Namespace reference" title="SVT metadata vocabulary">
          The XML namespace for optional input presentation metadata in Scalable Vector Templates.
        </PageIntro>
        <p className="uri">
          <code>https://svt-project.github.io/ns/svt</code>
        </p>
        <p>
          This identifier distinguishes SVT metadata elements from SVG and RDF elements. The
          vocabulary describes input labels, descriptions, ordering and groups. Its definition
          belongs to the specification.
        </p>
        <h2>Defining documents</h2>
        <ul>
          <li>
            <a href="https://github.com/svt-project/svt-spec/tree/v1.0.0-rc.1/spec/metadata.md">
              Input presentation metadata — specification 1.0.0-rc.1
            </a>
          </li>
          <li>
            <a href="https://github.com/svt-project/svt-spec/tree/v1.0.0-rc.1/spec/versions.md">
              Format identity and versioning — specification 1.0.0-rc.1
            </a>
          </li>
          <li>
            <a href="https://github.com/svt-project/svt-spec/releases">
              Published specification editions
            </a>
          </li>
          <li>
            <a href="https://github.com/svt-project/svt-spec">
              Specification repository and working text
            </a>
          </li>
        </ul>
        <h2>Namespace and format identity</h2>
        <p>
          A typical declaration is <code>xmlns:svt="https://svt-project.github.io/ns/svt"</code>.
          The prefix <code>svt</code> is a convention; the namespace name is the identity. Use the
          exact identifier without a trailing slash.
        </p>
        <p>
          The SVG root marker <code>data-svt-version="1.0"</code> selects the template format. It is
          separate from this metadata namespace and from implementation package versions. The{' '}
          <code>data-svt-*</code> binding attributes are unnamespaced.
        </p>
        <h2>Stable identity, offline processing</h2>
        <p>
          Specification editions evolve independently of this URI. A metadata vocabulary identity
          change requires an explicit namespace decision; a website redesign or specification
          revision does not silently change it.
        </p>
        <p className="note">
          This page is informative reference material, not a schema endpoint or parser dependency.
          Processors do not fetch it during inspection or binding. The specification and its
          canonical reference assets remain self-contained in their repository.
        </p>
        <p>
          Following the URL may redirect to the HTML page at <code>/ns/svt/</code>. That HTTP
          behavior does not change the XML namespace name.
        </p>
      </article>
    </main>
  );
}
