#!/usr/bin/env bash
set -euo pipefail

# Claude Code Skills Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/Loudbsujin/claude-loudb-skills/main/install.sh | bash

REPO="https://github.com/Loudbsujin/claude-loudb-skills.git"
BRANCH="main"
TMP_DIR=$(mktemp -d)
GLOBAL_DIR="$HOME/.claude/skills"
PROJECT_DIR=""
INSTALL_MODE="global"

cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

usage() {
  cat <<EOF
Claude Code Skills Installer

Usage:
  ./install.sh [options] [skill_names...]

Options:
  -g, --global          Install to ~/.claude/skills (default)
  -p, --project [dir]   Install to project .claude/skills/
  -l, --list            List available skills
  -h, --help            Show this help

Examples:
  ./install.sh                        # Install all skills globally
  ./install.sh polish critique audit  # Install specific skills only
  ./install.sh -p .                   # Install all to current project
  ./install.sh -l                     # List available skills
EOF
}

list_skills() {
  echo ""
  echo "Available Skills (27)"
  echo "====================="
  echo ""
  echo "-- Design (Impeccable) --"
  printf "  %-20s %s\n" "adapt"       "Responsive design across devices"
  printf "  %-20s %s\n" "animate"     "Purposeful animations & motion"
  printf "  %-20s %s\n" "arrange"     "Layout, spacing & visual rhythm"
  printf "  %-20s %s\n" "audit"       "Accessibility & performance audit"
  printf "  %-20s %s\n" "bolder"      "Amplify visual impact"
  printf "  %-20s %s\n" "clarify"     "Improve UX copy & labels"
  printf "  %-20s %s\n" "colorize"    "Strategic color application"
  printf "  %-20s %s\n" "critique"    "UX evaluation & scoring"
  printf "  %-20s %s\n" "delight"     "Micro-interactions & personality"
  printf "  %-20s %s\n" "distill"     "Simplify & declutter"
  printf "  %-20s %s\n" "extract"     "Component & token extraction"
  printf "  %-20s %s\n" "frontend-design" "Production-grade UI creation"
  printf "  %-20s %s\n" "harden"      "Error handling & edge cases"
  printf "  %-20s %s\n" "normalize"   "Design system alignment"
  printf "  %-20s %s\n" "onboard"     "Onboarding & empty states"
  printf "  %-20s %s\n" "optimize"    "UI performance tuning"
  printf "  %-20s %s\n" "overdrive"   "Ambitious visual effects"
  printf "  %-20s %s\n" "polish"      "Final quality pass"
  printf "  %-20s %s\n" "quieter"     "Tone down intensity"
  printf "  %-20s %s\n" "teach-impeccable" "Design context setup"
  printf "  %-20s %s\n" "typeset"     "Typography refinement"
  echo ""
  echo "-- Development --"
  printf "  %-20s %s\n" "senior-backend"  "Backend: Node, Go, Python, APIs"
  printf "  %-20s %s\n" "senior-frontend" "Frontend: React, Next.js, TS"
  printf "  %-20s %s\n" "code-reviewer"   "Automated code review & analysis"
  printf "  %-20s %s\n" "react-best-practices" "React/Next.js 40+ perf rules"
  printf "  %-20s %s\n" "ui-design-system" "Design tokens & components"
  printf "  %-20s %s\n" "senior-prompt-engineer" "Prompt optimization & RAG"
  echo ""
}

SELECTED_SKILLS=()
LIST_ONLY=false

while [[ $# -gt 0 ]]; do
  case $1 in
    -g|--global)  INSTALL_MODE="global"; shift ;;
    -p|--project) INSTALL_MODE="project"
                  PROJECT_DIR="${2:-.}"; shift; shift ;;
    -l|--list)    LIST_ONLY=true; shift ;;
    -h|--help)    usage; exit 0 ;;
    -*)           echo "Unknown option: $1"; usage; exit 1 ;;
    *)            SELECTED_SKILLS+=("$1"); shift ;;
  esac
done

if $LIST_ONLY; then
  list_skills
  exit 0
fi

if [ "$INSTALL_MODE" = "global" ]; then
  DEST="$GLOBAL_DIR"
else
  DEST="$(cd "$PROJECT_DIR" && pwd)/.claude/skills"
fi

mkdir -p "$DEST"

echo ""
echo "Cloning skills repository..."
git clone --depth 1 -b "$BRANCH" "$REPO" "$TMP_DIR/repo" 2>/dev/null

SRC_CLAUDE="$TMP_DIR/repo/.claude/skills"
SRC_AGENTS="$TMP_DIR/repo/.agents/skills"

installed=0
skipped=0

install_skill() {
  local name="$1"
  local src=""

  if [ -d "$SRC_CLAUDE/$name" ] && [ ! -L "$SRC_CLAUDE/$name" ]; then
    src="$SRC_CLAUDE/$name"
  elif [ -L "$SRC_CLAUDE/$name" ]; then
    src=$(readlink -f "$SRC_CLAUDE/$name")
  elif [ -d "$SRC_AGENTS/$name" ]; then
    src="$SRC_AGENTS/$name"
  fi

  if [ -z "$src" ] || [ ! -d "$src" ]; then
    echo "  [skip] $name (not found)"
    ((skipped++))
    return
  fi

  rm -rf "$DEST/$name"
  cp -r "$src" "$DEST/$name"
  echo "  [ok]   $name"
  ((installed++))
}

echo "Installing to: $DEST"
echo ""

if [ ${#SELECTED_SKILLS[@]} -gt 0 ]; then
  for skill in "${SELECTED_SKILLS[@]}"; do
    install_skill "$skill"
  done
else
  ALL_SKILLS=(
    adapt animate arrange audit bolder clarify colorize critique
    delight distill extract frontend-design harden normalize onboard
    optimize overdrive polish quieter teach-impeccable typeset
    senior-backend senior-frontend code-reviewer react-best-practices
    ui-design-system senior-prompt-engineer
  )
  for skill in "${ALL_SKILLS[@]}"; do
    install_skill "$skill"
  done
fi

echo ""
echo "Done! $installed skills installed, $skipped skipped."
echo ""
if [ "$INSTALL_MODE" = "global" ]; then
  echo "Skills are available globally in all Claude Code sessions."
else
  echo "Skills are available in this project: $DEST"
fi
echo ""
