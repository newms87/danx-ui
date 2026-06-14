# template-app workspace

Dispatched cwd for 3rd-party consumers calling `POST /api/launch` with
`workspace: "template-app"`. The launch body carries NOTHING
template-specific — the template id(s) to work on ride in the task prompt
text. For each id the agent calls `load_template_app(id)` (pulls or
scaffolds the app's source into `templates/<id>/source/` and brings its
live Vite HMR preview up), edits the three editable SFC files
(`App.vue` / `style.css` / `sample-data.json`), then calls
`save_template_app(id)` (per-id `vite build` + bundle + consumer callback).

Operational instructions: `.claude/skills/template-app-build/SKILL.md`
(auto-loaded).

## Why isolated

Zero consumer-specific coupling. Declares only the placeholders dispatch
core auto-injects (`DANXBOT_STOP_URL`, `DANXBOT_WORKER_PORT`); ships no
issue-tracker / Slack / archived investigation surface. The `load_template_app` /
`save_template_app` tools are advertised by the danxbot MCP server only when
the dispatch's repo has `template_app` configured — generic consumers
integrating against `/api/launch` reach the same surface every template
build does, without consumer-specific tooling.
