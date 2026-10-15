# AI-kollen

**Experiment ended on 15 October 2026.**
The recurring Codex monitoring is stopped.
The website remains online as a historical demonstration and does not publish new editions.
The saved news is historical, not a current news service.

[View the website](https://ai-kollen.johanlundgren.chatgpt.site/) · [Source repository](https://github.com/jlunse/ai-kollen)

## Purpose and result

AI-kollen explored whether a non-developer could create and operate an Angular website by describing the desired result to Codex Sites.
The practical example was an AI-news digest with short Swedish summaries and links to original publisher sources.
The code was shared so others could inspect and compare AI-generated Angular code.
The experiment demonstrated the website and recurring editorial workflow, and was then deliberately concluded.
It was not a formal benchmark or an independent audit of AI-generated news accuracy.

## Implementation

The application uses Angular 22 standalone components and signals, with a custom esbuild build and Angular runtime compiler.
It is an Angular application, not an Angular CLI workspace.
The final version retains the design, source links and last news snapshot.
Automatic browser polling and delayed-update warnings have been removed.
The static HTML fallback also identifies the experiment as ended.

## Historical editorial workflow

A local Codex heartbeat ran every four hours while the desktop app and computer were running.
`scripts/collect-news.py` fetched public feeds from TechCrunch, The Verge and MIT Technology Review into one replaceable candidate snapshot.
Codex reviewed the excerpts, selected stories, wrote original Swedish summaries and preserved source URLs, titles and publication dates.
Validation and an Angular build preceded publication through Sites.
The workflow used no separate OpenAI API key.
The collector itself neither summarizes nor publishes.
See [UPDATE_NEWS.md](UPDATE_NEWS.md) for the historical procedure; it is no longer active.

## Run the final demonstration locally

Use Node.js 24 and npm.
Python 3.10 or newer is needed only to inspect the optional historical collector.

```sh
npm ci
npm run build
npm run dev
```

Open http://127.0.0.1:4173.
Rebuild and reload after source edits; the server does not hot-reload.
Cloning or running this repository does not create schedules or authorize publication.
The application displays the bundled historical edition without polling for updates.

```sh
node scripts/validate-news.mjs
```

## Hosting and preservation

Serve `dist/` at the root of a static host.
Root-relative asset URLs require adjustment for a GitHub Pages project subpath.
The public repository preserves the final application and snapshot while retaining its existing history and license.
Sites account bindings, credentials, runtime candidates and dependency/build directories are excluded from the public source.
To publish your own copy through Sites, register your own project rather than reuse the original account binding.

## License and content

Application code is [MIT licensed](LICENSE).
Dependencies retain their licenses.
The code license grants no rights to publisher articles, trademarks or other third-party material.
The included summaries are AI-written paraphrases based on publisher feed excerpts, may contain errors and do not replace the originals.
The publishers are not affiliated with this project.
