# AI-kollen

A small Angular application for readable AI news, with Swedish summaries and links to original sources. The responsive interface uses Angular standalone components and signals. An esbuild bundle loads Angular's runtime compiler; this is an Angular app with a custom build, not an Angular CLI workspace.

## Run locally

Requirements: Node.js 24.15 or newer in the Node 24 line, npm, and Python 3.10 or newer for the optional feed collector. Tested with Node.js 24.21.0 and Angular 22.1.7.

```sh
npm ci
npm run build
npm run dev
```

Open http://127.0.0.1:4173. Run the build again and reload after source edits; the development server does not hot-reload. The initial edition is deliberately empty. No publisher article text, credentials, personal filesystem paths, or hosted-site account bindings are included.

## News workflow

```sh
python3 scripts/collect-news.py
```

The collector fetches the public AI RSS/Atom feeds of TechCrunch, The Verge, and MIT Technology Review. It writes one bounded, replaceable candidate snapshot to `.sites-runtime/candidates.json`. It does not summarize or publish anything itself.

Read those candidates and write concise Swedish summaries into `public/news.json`, manually or with a Codex task. Preserve the publisher's exact link, original title, and publication time; attribute allegations and differing accounts. The UI identifies summaries as based on publisher feed excerpts rather than full-article reviews.

See [UPDATE_NEWS.md](UPDATE_NEWS.md) for the update procedure and [examples/article.json](examples/article.json) for the record structure. The example is a schema illustration, not a real news story; do not publish it as news.

```sh
node scripts/validate-news.mjs
npm run build
```

The page checks the published JSON on focus and every five minutes while visible. A notice appears after six hours without a source check. Collection is not triggered by visitors. Rendered source links and text are handled by Angular; a static text edition is also emitted for browsers without JavaScript.

## Scheduling

A four-hour Codex schedule is optional and must be configured separately. Cloning this repository does not create a schedule, connect a hosting account, or authorize publication. A local Codex schedule requires the computer and app to remain running and is subject to usage limits and permissions. It can write summaries itself without a separate OpenAI API key. No API key is needed for this project.

## Hosting

Serve the contents of `dist/` with any static web host at the domain root. Assets use root-relative URLs, so a GitHub Pages project subpath needs path configuration before deployment. GitHub repository hosting alone does not deploy the website.

For Sites, register your own project and create your own ignored `.openai/hosting.json` with its returned project ID and `static.directory` set to `dist`. Use the installed Sites plugin to publish. Never reuse another person's site ID or source credentials.

## License and content

The application source is [MIT licensed](LICENSE). Dependencies retain their respective licenses. This license grants no rights to third-party news articles, publisher trademarks, or other third-party content. Respect source terms and applicable rights when fetching and publishing news. The publishers are not affiliated with this project.
