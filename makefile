BUILD := docker-compose build
UP := docker-compose up -d

all: build up

build:
	$(BUILD)

up: build
	$(UP)

stop:	
	docker-compose stop

down: stop
	docker-compose down

clear: down
	docker-compose stop $(docker-compose ps -q)
	docker-compose down --volumes --remove-orphans
	docker-compose rm -f

.PHONY: build all stop down clear
