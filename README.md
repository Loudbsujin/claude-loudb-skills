# Claude Code Skills Collection

27 curated skills for Claude Code — design, development, and prompt engineering.

## Quick Install

**All skills (global):**

```bash
curl -fsSL https://raw.githubusercontent.com/Loudbsujin/claude-loudb-skills/main/install.sh | bash
```

**Specific skills only:**

```bash
curl -fsSL https://raw.githubusercontent.com/Loudbsujin/claude-loudb-skills/main/install.sh | bash -s -- polish critique senior-backend
```

**Install to current project:**

```bash
curl -fsSL https://raw.githubusercontent.com/Loudbsujin/claude-loudb-skills/main/install.sh | bash -s -- -p .
```

**List available skills:**

```bash
curl -fsSL https://raw.githubusercontent.com/Loudbsujin/claude-loudb-skills/main/install.sh | bash -s -- -l
```

## Skills

### Design (21) — from [pbakaus/impeccable](https://github.com/pbakaus/impeccable)

| Skill | Description |
|-------|-------------|
| `/adapt` | Responsive design across devices |
| `/animate` | Purposeful animations & motion |
| `/arrange` | Layout, spacing & visual rhythm |
| `/audit` | Accessibility & performance audit |
| `/bolder` | Amplify visual impact |
| `/clarify` | Improve UX copy & labels |
| `/colorize` | Strategic color application |
| `/critique` | UX evaluation & scoring |
| `/delight` | Micro-interactions & personality |
| `/distill` | Simplify & declutter |
| `/extract` | Component & token extraction |
| `/frontend-design` | Production-grade UI creation |
| `/harden` | Error handling & edge cases |
| `/normalize` | Design system alignment |
| `/onboard` | Onboarding & empty states |
| `/optimize` | UI performance tuning |
| `/overdrive` | Ambitious visual effects |
| `/polish` | Final quality pass |
| `/quieter` | Tone down intensity |
| `/teach-impeccable` | Design context setup |
| `/typeset` | Typography refinement |

### Development (6) — from [claude-code-templates](https://www.npmjs.com/package/claude-code-templates)

| Skill | Description |
|-------|-------------|
| `/senior-backend` | Node.js, Go, Python, Postgres, REST/GraphQL |
| `/senior-frontend` | React, Next.js, TypeScript, Tailwind CSS |
| `/code-reviewer` | Automated code review & security scanning |
| `/react-best-practices` | 40+ React/Next.js performance rules |
| `/ui-design-system` | Design tokens & component documentation |
| `/senior-prompt-engineer` | Prompt optimization, RAG, agent systems |

## Manual Install

```bash
git clone https://github.com/Loudbsujin/claude-loudb-skills.git
cd claude-loudb-skills
chmod +x install.sh
./install.sh
```

## Install Locations

| Flag | Location | Scope |
|------|----------|-------|
| `-g` (default) | `~/.claude/skills/` | All projects |
| `-p .` | `./.claude/skills/` | Current project only |

## License

Design skills: Apache 2.0 (pbakaus/impeccable).
Development skills: MIT (claude-code-templates).
