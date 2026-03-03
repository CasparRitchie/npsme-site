# ==========================================
# NPSme Makefile
# One-command dev + deploy workflow
# ==========================================

# ---- CONFIG ----
APP_NAME = npsme
PORT ?= 3000


# ==========================================
# HELP (default)
# ==========================================

.DEFAULT_GOAL := help

help:
	@echo ""
	@echo "Available commands:"
	@echo ""
	@echo "  make dev           → start frontend + backend locally"
	@echo "  make backend       → start node server only"
	@echo "  make build         → build frontend (vite)"
	@echo "  make deploy        → build + git push origin main"
	@echo "  make context-pack  → create project snapshot zip for ChatGPT"
	@echo "  make tree          → print full project tree"
	@echo "  make clean         → remove builds + context pack"
	@echo ""


# ==========================================
# DEVELOPMENT
# ==========================================

dev:
	npm run dev

backend:
	node server.js


# ==========================================
# BUILD
# ==========================================

build:
	npm run build


# ==========================================
# DEPLOY
# ==========================================

deploy: build
	git add .
	@git diff --cached --quiet || (git commit -m "$(if $(m),$(m),Deploy)" )
	git push origin main



# ==========================================
# CONTEXT PACK (ChatGPT helper)
# ==========================================

.PHONY: context-pack clean-context-pack

# Rebuild automatically if any of these change
CONTEXT_SRC := $(shell find src -type f 2>/dev/null)
CONTEXT_BACKEND := server.js intercom.routes.js
CONTEXT_CONFIG := package.json Procfile $(wildcard vite.config.*)

context-pack: context-pack.zip
	@echo "✅ context-pack.zip created"

context-pack.zip: $(CONTEXT_SRC) $(CONTEXT_BACKEND) $(CONTEXT_CONFIG)
	@echo "Creating context pack..."
	rm -rf context-pack context-pack.zip
	mkdir -p context-pack

	# tree
	tree -I 'node_modules|dist|build|.git|coverage' -a > context-pack/tree.txt

	# frontend
	cp -r src context-pack/

	# backend
	cp server.js context-pack/ 2>/dev/null || true
	cp intercom.routes.js context-pack/ 2>/dev/null || true

	# configs
	cp package.json context-pack/
	cp Procfile context-pack/ 2>/dev/null || true
	cp vite.config.* context-pack/ 2>/dev/null || true

	zip -r context-pack.zip context-pack > /dev/null

clean-context-pack:
	rm -rf context-pack context-pack.zip
	@echo "🧹 cleaned context-pack artifacts"


# ==========================================
# UTILITIES
# ==========================================

tree:
	tree -I 'node_modules|dist|build|.git|coverage'

clean:
	rm -rf dist
	rm -rf context-pack
	rm -f context-pack.zip
