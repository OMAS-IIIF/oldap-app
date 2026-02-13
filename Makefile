
VERSION=v$(shell node -p "require('./package.json').version")

.PHONY: help
help:
	@echo "Usage: make [target] ..."
	@echo ""
	@echo "Available targets:"
	@echo "  show version       Show the current version number"
	@echo "  init-multiarch     Enables building od multiple architecture docker images"
	@echo "  bump-patch-level   Increments the patch level of the version number"
	@echo "  bump-minor-level   Increments the minor number of the version number"
	@echo "  bump-major-level   Increments the major number of the version number"
	@echo "  docker-build       Build and push a new docker image"
	@echo "  docker-push        Push the last built docker image"
	@echo "  docker-run         Run the latest docker image locally"

.PHONY: show-version
show-version:
	echo "VERSION=$(VERSION)"

.PHONY: init-multiarch
init-multiarch:
	docker buildx create --use
	docker buildx create --name multiarch --use
	docker buildx inspect --bootstrap

.PHONY: bump-patch-level
bump-patch-level:
	npm version patch
	git push origin --tag

.PHONY: bump-minor-level
bump-minor-level:
	npm version minor
	git push  origin --tag

.PHONY: bump-major-level
bump-major-level:
	npm version major
	git push  origin --tag

.PHONY: docker-build
docker-build:
	docker buildx build \
		--platform linux/amd64,linux/arm64 \
		-t lrosenth/oldap-app:$(VERSION) \
		-t lrosenth/oldap-app:latest \
		--push .

.PHONY: docker-push
docker-push:
	docker push lrosenth/oldap-app:$(VERSION)
	docker push lrosenth/oldap-app:latest

.PHONY: docker-run
docker-run:
	#docker run --rm -it -e API_URL=https://localhost:8000 -p 3000:3000 lrosenth/oldap-app:$(VERSION)
	docker run --rm -it \
		-e PUBLIC_API_URL=http://localhost:8000 \
		-e SERVER_API_URL=http://host.docker.internal:8000 \
		-p 3000:3000 lrosenth/oldap-app:$(VERSION)

