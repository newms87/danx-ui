# slack-worker workspace

Dispatched cwd for the Slack deep-agent. Operational rules + tool-call
sequence + intermediate-update discipline + thread-scope invariant live in
the `danxbot:slack-agent` plugin skill — invoke via Skill tool.

danxbot MCP Slack tools (`danxbot_slack_reply`, `danxbot_slack_post_update`)
are wired from overlay placeholders at dispatch time, not declared here.
