.PHONY: docker-build

VERSION=$(node -p "require('./package.json').version")

patch-level:
	npm version patch
	git push origin tag ${VERSION}


docker-build:
	docker build -t lrosenth/oldap-app .

docker-push: