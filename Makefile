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

CONTEXT_SRC := $(shell find src -type f \
	-not -path '*/node_modules/*' \
	-not -path '*/dist/*' \
	-not -path '*/build/*')

CONTEXT_BACKEND := \
	envola.routes.js \
	server.js \
	intercom.routes.js \
	csvNps.routes.js \
	npsData.routes.js \
	workspace.routes.js \
	workspaceIntercom.routes.js \
	supabaseClient.js \
	utils/workspaceAuth.js \
	utils/workspaceApi.js \
	utils/workspaceRoles.js \
	utils/workspaceEvents.js

CONTEXT_CONFIG := \
	package.json \
	package-lock.json \
	Procfile \
	vite.config.js

context-pack: context-pack.zip
	@echo "✅ context-pack.zip created"

context-pack.zip: $(CONTEXT_SRC) $(CONTEXT_BACKEND) $(CONTEXT_CONFIG)
	@echo "Creating context pack..."
	rm -rf context-pack context-pack.zip
	mkdir -p context-pack

	tree -I 'node_modules|dist|build|.git|coverage|context-pack|context-pack.zip|.env|.env.*' -a > context-pack/tree.txt

	# Frontend source
	cp -r src context-pack/

	# Backend entry point
	cp server.js context-pack/ 2>/dev/null || true

	# Backend route files
	cp intercom.routes.js context-pack/ 2>/dev/null || true
	cp envola.routes.js context-pack/ 2>/dev/null || true
	cp csvNps.routes.js context-pack/ 2>/dev/null || true
	cp npsData.routes.js context-pack/ 2>/dev/null || true
	cp workspace.routes.js context-pack/ 2>/dev/null || true
	cp workspaceIntercom.routes.js context-pack/ 2>/dev/null || true

	# Backend utilities / shared server modules
	mkdir -p context-pack/utils
	cp utils/workspaceAuth.js context-pack/utils/ 2>/dev/null || true
	cp utils/workspaceApi.js context-pack/utils/ 2>/dev/null || true
	cp utils/workspaceRoles.js context-pack/utils/ 2>/dev/null || true
	cp utils/workspaceEvents.js context-pack/utils/ 2>/dev/null || true

	# Supabase / database client
	cp supabaseClient.js context-pack/ 2>/dev/null || true

	# Scripts that explain database/user setup
	mkdir -p context-pack/src/scripts
	cp src/scripts/create-workspace-user.mjs context-pack/src/scripts/ 2>/dev/null || true

	# Config / deployment
	cp package.json context-pack/
	cp package-lock.json context-pack/ 2>/dev/null || true
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
