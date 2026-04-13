# ==========================================
# NPS Me Makefile
# Simple workflow helpers
# ==========================================

APP_NAME = npsme
PORT ?= 3000

.DEFAULT_GOAL := help

# Capture extra words after the target as the commit message
MESSAGE := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))

help:
	@echo ""
	@echo "Available commands:"
	@echo ""
	@echo "  make dev                      → start local dev server"
	@echo "  make backend                  → start node server only"
	@echo "  make build                    → build frontend (vite)"
	@echo "  make deploy [\"message\"]     → build + add + commit + push to GitHub"
	@echo "  make status                   → git status + remotes + ahead/behind summary"
	@echo "  make context-pack             → create project snapshot zip for ChatGPT"
	@echo "  make clean-context-pack       → remove context pack artifacts"
	@echo "  make tree                     → print full project tree"
	@echo "  make clean                    → remove builds + context pack"
	@echo ""

dev:
	npm run dev

backend:
	node server.js

build:
	npm run build

deploy: build
	git add -A
	@git diff --cached --quiet || git commit -m "$(if $(MESSAGE),$(MESSAGE),Deploy)"
	git push origin main
	@echo "🚀 Pushed to GitHub. Heroku auto-deploy should now pick up the new commit."

status:
	@echo ""
	@echo "---- git status ----"
	@git status -sb
	@echo ""
	@echo "---- remotes ----"
	@git remote -v
	@echo ""
	@echo "---- commits ahead of origin/main ----"
	@git log --oneline origin/main..main || true
	@echo ""

.PHONY: context-pack clean-context-pack

CONTEXT_SRC := $(shell find src -type f 2>/dev/null)
CONTEXT_BACKEND := server.js intercom.routes.js
CONTEXT_CONFIG := package.json Procfile $(wildcard vite.config.*)

context-pack: context-pack.zip
	@echo "✅ context-pack.zip created"

context-pack.zip: $(CONTEXT_SRC) $(CONTEXT_BACKEND) $(CONTEXT_CONFIG)
	@echo "Creating context pack..."
	rm -rf context-pack context-pack.zip
	mkdir -p context-pack

	tree -I 'node_modules|dist|build|.git|coverage' -a > context-pack/tree.txt

	cp -r src context-pack/
	cp server.js context-pack/ 2>/dev/null || true
	cp intercom.routes.js context-pack/ 2>/dev/null || true

	cp package.json context-pack/
	cp Procfile context-pack/ 2>/dev/null || true
	cp vite.config.* context-pack/ 2>/dev/null || true

	zip -r context-pack.zip context-pack > /dev/null

clean-context-pack:
	rm -rf context-pack context-pack.zip
	@echo "🧹 cleaned context-pack artifacts"

tree:
	tree -I 'node_modules|dist|build|.git|coverage'

clean:
	rm -rf dist
	rm -rf context-pack
	rm -f context-pack.zip

# Prevent make from treating extra words as targets
%:
	@:
