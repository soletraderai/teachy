# Phase 11 Tasks: Standalone App Conversion & Rebrand to QuizTube

<!--
=============================================================================
TASK LIST - PHASE 11
=============================================================================

Granular tasks for converting the teachy app to a standalone QuizTube repository.
Based on the approved implementation plan.

=============================================================================
-->

## User Preferences

- **Repo Name:** quiztube (lowercase for GitHub/npm)
- **Product Name:** QuizTube (UI branding - already correct)
- **Historical Docs:** TBD - confirm with user
- **Agent Specs:** TBD - confirm with user

---

## Phase 11.1: Preparation & Backup - PENDING

### Backup & Documentation
- [ ] Create backup branch: `git checkout -b backup/pre-phase-11`
- [ ] Push backup branch to remote: `git push -u origin backup/pre-phase-11`
- [ ] Document current git remote: `git remote -v` (currently `soletraderai/teachy.git`)
- [ ] Verify app runs correctly: `npm run dev` starts without errors
- [ ] Verify API runs correctly: `cd api && npm run dev`

### Inventory Agent Artifacts in App Directory
- [ ] List all files to be removed:
  - `.claude_settings.json`
  - `features.db`
  - `init.sh`
  - `app_spec.txt`
  - `claude-progress-1.txt`
  - `claude-progress-2.txt`
  - `claude-progress-3.txt`
  - `PHASE_ONE_INCOMPLETE_FEATURES.md`
  - `prompts/` directory (contains agent prompts)

### Inventory Teachy References
- [ ] Run grep to list all files with "teachy" references:
  ```
  grep -ri "teachy" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.md" --include="*.yml" --include="*.yaml" --include="*.conf" --include="*.sh" -l
  ```

---

## Phase 11.2: Clean Agent Artifacts from App - PENDING

### Remove Agent Configuration Files
- [ ] Delete `.claude_settings.json`
- [ ] Delete `features.db` (agent feature tracking database)
- [ ] Delete `init.sh` (agent initialization script)

### Remove Agent Session Logs
- [ ] Delete `claude-progress-1.txt`
- [ ] Delete `claude-progress-2.txt`
- [ ] Delete `claude-progress-3.txt`

### Remove Agent Documentation
- [ ] Delete `PHASE_ONE_INCOMPLETE_FEATURES.md`
- [ ] Delete `app_spec.txt` (or move to `docs/archive/` if keeping for reference)

### Handle Prompts Directory
- [ ] Review `prompts/` directory contents:
  - `prompts/app_spec.txt`
  - `prompts/initializer_prompt.md`
  - `prompts/phase2_spec.txt`
  - `prompts/phase3_spec.txt`
  - `prompts/coding_prompt.md` (if exists)
- [ ] Delete `prompts/` directory entirely (agent-only files)

### Remove Playwright MCP Directory
- [ ] Delete `.playwright-mcp/` directory (agent browser automation logs)

### Update .gitignore
- [ ] Remove agent-specific entries if any
- [ ] Ensure `features.db` is not listed (file deleted)

---

## Phase 11.3: Rebrand Teachy → QuizTube - PENDING

### Package Configuration
- [ ] Update `package.json`:
  - Change `"name": "youtube-learning-tool"` to `"name": "quiztube"`
- [ ] Update `api/package.json`:
  - Change `"name": "teachy-api"` to `"name": "quiztube-api"` (verify current name first)

### Docker Configuration
- [ ] Update `docker-compose.yml`:
  - Rename service `teachy` → `quiztube` (if applicable)
  - Update image names
- [ ] Update `docker-compose.prod.yml`:
  - Rename service `teachy` → `quiztube`
  - Update image names: `teachy-frontend` → `quiztube-frontend`
  - Update image names: `teachy-api` → `quiztube-api`
  - Update container names
- [ ] Update `Dockerfile`:
  - Update any teachy references in comments or labels
- [ ] Update `api/Dockerfile.prod`:
  - Update any teachy references

### Nginx Configuration
- [ ] Update `nginx/nginx.conf`:
  - Replace `teachy` references with `quiztube`
- [ ] Update `nginx/conf.d/default.conf`:
  - Replace `teachy` references with `quiztube`

### GitHub Workflows
- [ ] Update `.github/workflows/deploy.yml`:
  - Update repository references from `teachy` to `quiztube`
  - Update any image/service names

### Scripts
- [ ] Update `scripts/setup-server.sh`:
  - Replace `teachy` → `quiztube`
- [ ] Update `scripts/rollback.sh`:
  - Replace `teachy` → `quiztube`
- [ ] Update `scripts/smoke-test.sh`:
  - Replace `teachy` → `quiztube`
- [ ] Update `scripts/setup-ssl.sh`:
  - Replace `teachy` → `quiztube`
- [ ] Update `start-dev.sh`:
  - Replace `teachy` → `quiztube`

### API Files
- [ ] Update `api/src/index.ts`:
  - Replace `teachy` references with `quiztube`
- [ ] Update `api/src/routes/webhooks.ts`:
  - Replace `teachy` references
- [ ] Update `api/src/routes/emailPrompts.ts`:
  - Replace `teachy` references
- [ ] Update `api/src/routes/progress.ts`:
  - Replace `teachy` references
- [ ] Update `api/src/routes/learningModel.ts`:
  - Replace `teachy` references
- [ ] Update `api/src/services/email.ts`:
  - Replace `teachy` references
- [ ] Update `api/scripts/setup-stripe-products.ts`:
  - Replace `teachy` references
- [ ] Update `api/prisma/schema.prisma`:
  - Replace `teachy` references
- [ ] Update `api/.env.example`:
  - Replace `teachy` references

### Frontend Files
- [ ] Update `src/stores/authStore.ts`:
  - Replace `teachy` references with `quiztube`
- [ ] Update `src/lib/supabase.ts`:
  - Replace `teachy` references
- [ ] Update `src/pages/Onboarding.tsx`:
  - Replace `teachy` references
- [ ] Update `src/utils/greeting.ts`:
  - Replace `teachy` references
- [ ] Update `playwright.config.ts`:
  - Replace `teachy` references
- [ ] Update `tests/auth.setup.ts`:
  - Replace `teachy` references

### Environment Files
- [ ] Update `.env.production.example`:
  - Replace `teachy` references with `quiztube`

### Documentation Files
- [ ] Update `docs/domain.md`:
  - Replace `teachy` references
- [ ] Update `docs/quiztube-overview.md`:
  - Replace `teachy` references
- [ ] Update `docs/production-roadmap.md`:
  - Replace `teachy` references
- [ ] Update `CHANGELOG.md`:
  - Add entry for Phase 11 rebrand
  - Keep historical references for context
- [ ] Update `README.md`:
  - Replace `teachy` references with `quiztube`
  - Update project description for standalone app
- [ ] Update `SESSION-NOTES.md`:
  - Keep historical references (documentation)

### Phase Documentation (Historical - Selective Update)
- [ ] Update `docs/phase-11/*.md` files (current phase - already correct)
- [ ] Note: Keep historical phase docs as-is for project history

---

## Phase 11.4: Repository Restructure - PENDING

### Rename GitHub Repository
- [ ] Go to GitHub → `soletraderai/teachy` → Settings → General
- [ ] Change repository name from `teachy` to `quiztube`
- [ ] Confirm the rename

### Update Local Git Remote
- [ ] Update remote URL:
  ```bash
  git remote set-url origin git@github.com:soletraderai/quiztube.git
  ```
- [ ] Verify remote updated: `git remote -v`
- [ ] Test connection: `git fetch origin`

### Relocate Local Directory
- [ ] Move directory out of generations/:
  ```bash
  # From parent of Teachy directory
  mv /Users/marepomana/Web/Teachy/generations/teachy /Users/marepomana/Web/quiztube
  ```
- [ ] Update any IDE workspace settings if needed
- [ ] Update any local environment variables pointing to old path

### Clean Up Parent Repository (Optional)
- [ ] Delete the `autonomous-coding` parent directory:
  ```bash
  rm -rf /Users/marepomana/Web/Teachy
  ```
  (Only after confirming quiztube works standalone)

---

## Phase 11.5: Final Cleanup & Verification - PENDING

### Functional Testing
- [ ] Navigate to new directory: `cd /Users/marepomana/Web/quiztube`
- [ ] Install dependencies: `npm install`
- [ ] Start dev server: `npm run dev`
- [ ] Verify frontend loads at http://localhost:5173
- [ ] Start API server: `cd api && npm run dev`
- [ ] Verify API responds
- [ ] Test login functionality
- [ ] Test video loading
- [ ] Test quiz generation
- [ ] Test at least one quiz session

### Verification Checks
- [ ] Grep check - no teachy references in code:
  ```bash
  grep -ri "teachy" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.yml" --include="*.conf" --include="*.sh" . | grep -v node_modules | grep -v "docs/phase-"
  ```
- [ ] Grep check - no agent framework references:
  ```bash
  grep -ri "autonomous_agent\|agent\.py\|mcp_server\|features\.db\|claude_settings" . | grep -v node_modules
  ```
- [ ] Build check: `npm run build` completes without errors
- [ ] Lint check: `npm run lint` passes

### Git Cleanup
- [ ] Stage all changes: `git add -A`
- [ ] Review staged changes: `git status`
- [ ] Commit with descriptive message:
  ```bash
  git commit -m "Phase 11: Convert to standalone QuizTube app

  - Remove autonomous agent framework artifacts
  - Rebrand from teachy to quiztube
  - Update all configuration and documentation
  - Flatten directory structure for standalone deployment

  Co-Authored-By: Claude <noreply@anthropic.com>"
  ```
- [ ] Push to remote: `git push origin main`

### Final Documentation
- [ ] Update `README.md` with standalone setup instructions
- [ ] Remove any references to the autonomous agent workflow
- [ ] Update `SESSION-NOTES.md` with Phase 11 completion summary

---

## Reference Tables

### Files to Delete

| File/Directory | Reason |
|----------------|--------|
| `.claude_settings.json` | Agent configuration |
| `features.db` | Agent feature tracking |
| `init.sh` | Agent initialization |
| `app_spec.txt` | Agent spec |
| `claude-progress-*.txt` | Agent session logs |
| `PHASE_ONE_INCOMPLETE_FEATURES.md` | Agent tracking |
| `prompts/` | Agent prompt templates |
| `.playwright-mcp/` | Agent browser logs |

### Key Rename Mappings

| Old Value | New Value |
|-----------|-----------|
| `teachy` | `quiztube` |
| `teachy-api` | `quiztube-api` |
| `teachy-frontend` | `quiztube-frontend` |
| `soletraderai/teachy` | `soletraderai/quiztube` |

---

## Key Files

| File | Purpose |
|------|---------|
| `package.json` | App package name |
| `api/package.json` | API package name |
| `docker-compose.prod.yml` | Production Docker config |
| `.github/workflows/deploy.yml` | CI/CD pipeline |
| `nginx/conf.d/default.conf` | Nginx routing |
| `README.md` | Project documentation |

---

## Verification Checklist

- [ ] All Phase 11.x sections marked COMPLETE
- [ ] App runs from standalone directory (`/Users/marepomana/Web/quiztube`)
- [ ] `npm run dev` starts successfully
- [ ] `npm run build` completes without errors
- [ ] No "teachy" references in code (except historical docs)
- [ ] No agent framework files remain
- [ ] GitHub repo renamed to `quiztube`
- [ ] Git remote updated to `soletraderai/quiztube.git`
- [ ] All changes committed and pushed
- [ ] SESSION-NOTES.md updated with final summary

---

## Related Documents

| Document | Purpose | Status |
|----------|---------|--------|
| `README.md` | Workflow guide | Reference |
| `phase-11-feedback.md` | Source requirements | Complete |
| `phase-11-implementation-plan.md` | Implementation strategy | Complete |
| `SESSION-NOTES.md` | Progress documentation | Pending |
