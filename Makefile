### DOCKER COMPOSE COMMANDS

ENV ?= prod
COMPOSE_FILE=docker-compose-$(ENV).yml

.PHONY: compose-build
compose-build:
	docker compose -f $(COMPOSE_FILE) build

.PHONY: compose-up
compose-up:
	docker compose -f $(COMPOSE_FILE) up

.PHONY: compose-up-build
compose-up-build:
	docker compose -f $(COMPOSE_FILE) up --build

.PHONY: compose-down
compose-down:
	docker compose -f $(COMPOSE_FILE) down
