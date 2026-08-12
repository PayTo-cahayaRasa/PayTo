# PayTo Makefile
# Common development tasks

.PHONY: help install setup dev build test clean deploy

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies
	@echo "Installing Composer dependencies..."
	composer install
	@echo "Installing NPM dependencies..."
	npm install

setup: install ## Full setup (install + env + key + migrate + seed)
	@echo "Setting up environment..."
	cp -n .env.example .env || true
	php artisan key:generate
	@echo "Running migrations and seeders..."
	php artisan migrate --seed
	@echo "Building assets..."
	npm run build
	@echo "Setup complete! Run 'make dev' to start development server"

dev: ## Start development server
	composer run dev

build: ## Build production assets
	npm run build

test: ## Run tests
	php artisan test

test-coverage: ## Run tests with coverage
	php artisan test --coverage

pint: ## Run code style fixer
	vendor/bin/pint

pint-test: ## Check code style without fixing
	vendor/bin/pint --test

clean: ## Clean cache and generated files
	php artisan cache:clear
	php artisan config:clear
	php artisan route:clear
	php artisan view:clear
	rm -rf bootstrap/cache/*.php

optimize: ## Optimize for production
	php artisan config:cache
	php artisan route:cache
	php artisan view:cache
	php artisan optimize

deploy-staging: ## Deploy to staging
	@echo "Deploying to staging..."
	git push staging main

deploy-prod: ## Deploy to production
	@echo "Deploying to production..."
	@echo "Are you sure? This will deploy to production!"
	@read -p "Press Enter to continue or Ctrl+C to cancel..."
	git push production main

fresh: ## Fresh database with seeders
	php artisan migrate:fresh --seed

seed: ## Run database seeders
	php artisan db:seed

ide-helper: ## Generate IDE helper files
	php artisan ide-helper:generate
	php artisan ide-helper:models --nowrite
	php artisan ide-helper:meta

security-check: ## Run security checks
	composer audit
	npm audit

update: ## Update dependencies
	composer update
	npm update

lint: pint-test ## Alias for pint-test

fix: pint ## Alias for pint

ci: pint-test test ## Run CI checks locally

watch: ## Watch and rebuild assets
	npm run dev
