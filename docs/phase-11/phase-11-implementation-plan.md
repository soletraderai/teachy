# Phase 11 Implementation Plan: Standalone App Conversion & Rebrand to QuizTube

<!--
=============================================================================
IMPLEMENTATION PLAN - PHASE 11
=============================================================================

This plan addresses all items from phase-11-feedback.md and provides a
strategic approach for converting the app to a standalone project.

=============================================================================
-->

## 1. Vision & Philosophy

**Goal:** Transform the teachy application from a nested autonomous-agent-generated project into a clean, standalone "quiztube" repository.

This phase "graduates" the application from its scaffolding. The autonomous agent framework served its purpose in building the app across multiple phases. Now that the application is mature, we remove the framework entirely, flatten the directory structure, and rebrand to QuizTube for a clean, maintainable codebase going forward.

### Guiding Principles

1. **Preserve Application Integrity:** The QuizTube app must function identically after migration. All features, data connections, and functionality remain intact.

2. **Clean Separation:** Completely remove all autonomous agent artifacts. No traces of the scaffolding framework should remain.

3. **Minimal Disruption:** Preserve git history where possible. The teachy repo becomes quiz2 - we're not starting fresh.

4. **Surgical Rebranding:** Update "teachy" references to "quiztube" systematically throughout the codebase, configuration, and documentation.

5. **Documentation Continuity:** Keep phase docs and session notes as they provide valuable project history.

---

## 2. Current State Analysis

### Repository Structure

**Parent Repo (autonomous-coding):** `/Users/marepomana/Web/Teachy/`
- Remote: `git@github.com:soletraderai/autonomous-coding.git`
- Contains: Agent framework (`agent.py`, `client.py`, `prompts.py`, etc.)
- Contains: MCP server (`mcp_server/`)
- Contains: Nested app in `generations/teachy/`

**App Repo (teachy):** `/Users/marepomana/Web/Teachy/generations/teachy/`
- Remote: `git@github.com:soletraderai/teachy.git`
- Has its own `.git` directory (separate repo)
- Contains: Full React/Vite application with Express API

### Files to REMOVE (Agent Framework)

From parent directory (will be abandoned):
| File/Directory | Purpose |
|----------------|---------|
| `agent.py` | Main agent loop |
| `client.py` | Claude SDK client |
| `prompts.py` | Prompt template loading |
| `progress.py` | Progress tracking utilities |
| `security.py` | Bash command allowlist |
| `autonomous_agent_demo.py` | Entry point |
| `mcp_server/` | Feature MCP server |
| `api/` | Agent API (not the app's api/) |
| `start.sh`, `start.bat`, `start.py` | Launcher scripts |
| `features.db` | Feature tracking database |
| `requirements.txt` | Python dependencies |
| `venv/` | Python virtual environment |
| `VERSION`, `CHANGELOG.md`, `CLAUDE.md` | Agent docs |
| `.claude/` | Agent configuration |

### Files to KEEP (Quiz2 Application)

Everything in `generations/teachy/`:
| Directory/File | Purpose |
|----------------|---------|
| `src/` | React application source |
| `api/` | Express backend API |
| `public/` | Static assets |
| `docs/` | Phase documentation |
| `tests/` | E2E tests |
| `index.html` | App entry point |
| `package.json` | App dependencies |
| `vite.config.ts` | Vite configuration |
| `tailwind.config.js` | Tailwind configuration |
| `server.js` | Proxy server |
| `docker-compose*.yml` | Docker configuration |
| `Dockerfile` | Container definition |
| `.env*` | Environment files |
| `.github/` | GitHub workflows |

### Files to UPDATE (Rebranding)

68 files contain "teachy" references. Key files requiring updates:

| File | Change Needed |
|------|---------------|
| `package.json` | Change name to "quiztube" |
| `api/package.json` | Change name to "quiztube-api" |
| `.github/workflows/deploy.yml` | Update repo references |
| `docker-compose*.yml` | Update service/image names |
| `nginx/*.conf` | Update server references |
| `src/stores/authStore.ts` | Update any teachy references |
| `docs/**/*.md` | Update documentation references |
| `prompts/*.txt` | Update spec references |

---

## 3. Migration Strategy

### Approach: In-Place Transformation

Since `generations/teachy/` already has its own git repository, we will:

1. **Work within the teachy repo** - All changes happen inside `generations/teachy/`
2. **Remove agent artifacts** - Delete any agent-related files that exist within the app
3. **Update references** - Rename teachy → quiztube throughout
4. **Rename GitHub repo** - Via GitHub settings: teachy → quiztube
5. **Relocate locally** - Move the folder out of the parent structure

This preserves full git history and avoids complex repo surgery.

### What Gets Deleted from App Directory

Files in `generations/teachy/` that are agent-related:
- `.claude_settings.json` - Agent settings
- `app_spec.txt` - Original agent spec (keep for reference or delete)
- `features.db` - Agent feature tracking (can delete)
- `init.sh` - Agent initialization script
- `prompts/` - Agent prompt templates (evaluate - may contain useful specs)
- `claude-progress-*.txt` - Agent session logs (can delete or archive)
- `PHASE_ONE_INCOMPLETE_FEATURES.md` - Agent tracking doc

---

## 4. Implementation Phases

### Phase 11.1: Preparation & Backup
- [ ] Create backup of current state
- [ ] Document current git remotes and branches
- [ ] Verify app runs correctly before changes
- [ ] List all files requiring "teachy" → "quiztube" updates

### Phase 11.2: Clean Agent Artifacts from App
- [ ] Remove `.claude_settings.json`
- [ ] Remove `features.db` from app directory
- [ ] Remove `init.sh` agent initialization script
- [ ] Evaluate `prompts/` directory - archive useful specs, remove agent-specific files
- [ ] Remove or archive `claude-progress-*.txt` logs
- [ ] Remove `PHASE_ONE_INCOMPLETE_FEATURES.md`
- [ ] Clean up any other agent-specific files

### Phase 11.3: Rebrand Teachy → QuizTube
- [ ] Update `package.json` name field to "quiztube"
- [ ] Update `api/package.json` name field to "quiztube-api"
- [ ] Update Docker service names in `docker-compose*.yml`
- [ ] Update nginx configuration files
- [ ] Update GitHub workflow files
- [ ] Update documentation files (docs/*.md)
- [ ] Search and replace remaining "teachy" references in code
- [ ] Update git remote URL after GitHub repo rename

### Phase 11.4: Repository Restructure
- [ ] Rename GitHub repository: teachy → quiztube
- [ ] Update local git remote to point to quiztube
- [ ] Move local directory out of `generations/` to standalone location
- [ ] Verify app still runs from new location
- [ ] Update any absolute paths in configuration

### Phase 11.5: Final Cleanup & Verification
- [ ] Run `npm run dev` - verify frontend works
- [ ] Run API server - verify backend works
- [ ] Test core functionality (login, quiz generation, etc.)
- [ ] Verify no "teachy" references remain (grep check)
- [ ] Verify no agent framework references remain
- [ ] Update README.md for standalone project
- [ ] Commit all changes with descriptive message

---

## 5. Success Metrics

- **Clean Directory:** App runs from a standalone directory (not nested in generations/)
- **No Agent Traces:** `grep -r "autonomous\|agent\.py\|mcp_server"` returns no results in app
- **Rebranding Complete:** `grep -ri "teachy"` returns no results (except historical docs if kept)
- **Functionality Preserved:** All existing features work identically
- **Clean Git State:** Repository is named "quiztube" with updated remote URL
- **Build Success:** `npm run build` completes without errors

---

## 6. Feedback Coverage

| Feedback Item | Addressed In |
|---------------|--------------|
| Remove autonomous agent framework | Phase 11.2 |
| Remove generations/ parent directory | Phase 11.4 |
| Evaluate teachy/ subdirectory | Phase 11.4 |
| Remove autonomous agent repo | Phase 11.4 (delete local copy of autonomous-coding) |
| Rename teachy → quiztube | Phase 11.3 |
| Rename GitHub repo | Phase 11.4 |

---

## 7. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking changes during migration | Create backup branch before starting |
| Missing teachy references | Use comprehensive grep search |
| Git history loss | Work within existing repo, don't reinitialize |
| Broken dependencies after move | Test immediately after directory relocation |
| GitHub repo rename issues | Document steps, can revert if needed |

---

## 8. Clarifications Needed

Before proceeding, please confirm:

1. **Historical Docs:** Should we keep `docs/phase-*/` directories for project history, or remove them for a cleaner slate?

2. **Agent Specs:** The `app_spec.txt` and `prompts/*.txt` files contain the original feature specifications. Archive these, or delete entirely?

3. **Parent Repo:** After extracting quiztube, should we document how to delete the `autonomous-coding` parent repo locally, or leave that to you?

---

## Related Documents

| Document | Purpose | Status |
|----------|---------|--------|
| `README.md` | Workflow guide | Reference |
| `phase-11-feedback.md` | Source requirements | Complete |
| `phase-11-tasks.md` | Granular task tracking | Pending |
| `SESSION-NOTES.md` | Progress documentation | Pending |
