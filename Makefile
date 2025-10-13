.PHONY: init-multiarch docker-build bump-patch-level bump-minor-level \
bump-major-level docker-build docker-push docker-run

VERSION=v$(shell node -p "require('./package.json').version")

show-version:
	echo "VERSION=$(VERSION)"

init-multiarch:
	docker buildx create --use
	docker buildx create --name multiarch --use
	docker buildx inspect --bootstrap

bump-patch-level:
	npm version patch
	git push

bump-patch-level:
	npm version patch
	git push origin --tag

bump-minor-level:
	npm version minor
	git push

bump-major-level:
	npm version major
	git push

docker-build:
	docker buildx build \
		--platform linux/amd64,linux/arm64 \
		-t lrosenth/oldap-app:$(VERSION) \
		-t lrosenth/oldap-app:latest \
		--push .


docker-push:
	docker push lrosenth/oldap-app:$(VERSION)
	docker push lrosenth/oldap-app:latest

docker-run:
	docker run --rm -it -e API_URL=https://localhost:8000 -p 3000:3000 lrosenth/oldap-app:$(VERSION)
