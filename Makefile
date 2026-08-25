.PHONY: help install seed dev-api dev-web dev test test-api test-web lint clean

help:
	@echo "JobPilot Commands (Standalone Zero-Docker):"
	@echo "  make install     - Install all backend and frontend dependencies"
	@echo "  make seed        - Populate standalone SQLite database with demo dataset"
	@echo "  make dev-api     - Run FastAPI backend locally on port 8000"
	@echo "  make dev-web     - Run Next.js frontend locally on port 3000"
	@echo "  make dev         - Run both Web and API concurrently"
	@echo "  make test        - Run backend pytest and web build check"
	@echo "  make clean       - Remove cached files and build artifacts"

install:
	cd apps/api && pip install -r requirements.txt
	cd apps/web && npm install

seed:
	python scripts/seed.py

dev-api:
	cd apps/api && uvicorn app.main:app --reload --port 8000

dev-web:
	cd apps/web && npm run dev

dev:
	npm run dev

test-api:
	pytest apps/api/tests -v

test-web:
	npm run build --prefix apps/web

test: test-api test-web

lint:
	npm run lint --prefix apps/web

clean:
	python -c "import shutil, os, glob; [shutil.rmtree(p, ignore_errors=True) for p in glob.glob('**/__pycache__', recursive=True) + glob.glob('**/.pytest_cache', recursive=True)]"
