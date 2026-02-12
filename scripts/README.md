# Scripts

## Create Linear issues (no Composer / no MCP needed)

You can create all tasks in Linear using a **Personal API key** and the script below. No Composer or MCP required.

---

### Quick start

1. **Get an API key:** Linear → **Settings** (avatar top left) → **API** → **Personal API keys** → Create → copy the key (starts with `lin_api_`).

2. **Add to `.env`** in the project root (create the file if it doesn’t exist):
   ```bash
   LINEAR_API_KEY=lin_api_xxxxxxxxxxxx
   ```

3. **Run from the project root:**
   ```bash
   node scripts/create-linear-issues.mjs
   ```

That creates all issues from `scripts/linear-tasks.json` in your default Linear team. You can then move them into a project or cycle in Linear.

---

### Optional: team or project

To create issues in a specific **team** or **project**, add to `.env`:

```bash
LINEAR_TEAM_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx   # optional; default = first team
LINEAR_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx # optional; add issues to a project
```

To find IDs: open your team or project in Linear → settings / URL, or use [Linear’s GraphQL explorer](https://linear.app/developers/graphql).

---

### What the script does

- Reads `scripts/linear-tasks.json`
- Creates one Linear issue per task (title + description including track and phase)
- Uses your first team if `LINEAR_TEAM_ID` is not set
- Attaches issues to a project if `LINEAR_PROJECT_ID` is set

No Composer or MCP needed.
