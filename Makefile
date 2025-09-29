.PHONY: docker-build bump-patch-level

VERSION=$(shell node -p "require('./package.json').version")

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
	docker build -t lrosenth/oldap-app .

docker-push: