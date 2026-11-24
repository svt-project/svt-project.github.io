# Agent guidance

- Use American English. Work serially; request approval before delegating.
- Check Git status before editing. Default branch: `master`.
- This repository owns the project landing page, `/ns/svt` reference page, optional branding
  assets and future cookbook content. Keep the initial site static and useful without JavaScript.
- The namespace identifier is exactly `https://svt-project.github.io/ns/svt`, without a trailing
  slash. HTTP redirects to the reference page do not change namespace identity.
- Link authoritative specification prose and canonical assets in `svt-spec`; do not copy them
  or fetch them during builds. The specification stays self-contained and does not depend on this site.
- Cookbook, playground and TypeScript implementation are separate follow-ups tracked in `.github`.
- Original icon artwork is CC0. Phosphor-derived `svt-file-ui-*` assets remain MIT; preserve their
  attribution and full license. Site code and prose are MIT. See the icon package's LICENSE.md.
- Released asset folders are snapshots. Publish a new folder/download when updating artwork;
  do not silently replace an established download. Keep the license boundaries explicit.
- Run `python3 eng/check.py` before committing; inspect responsive pages when changing layout.
  Regenerate downloads with `python3 eng/package-icons.py` after intentional asset changes.
- Keep paths, IDE metadata, credentials, private consumers and generated QA evidence out of commits.
  Local handoff and preview evidence belong in ignored `.local/`.
