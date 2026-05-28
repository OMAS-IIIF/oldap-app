# syntax=docker/dockerfile:1
# ---- Build stage ----
FROM --platform=$BUILDPLATFORM node:20-bookworm AS build

# Install build tools
#RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy dependency manifests first (better layer caching)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Copy project source
COPY . .

# Install dependencies inside the target platform image.
# This also removes any node_modules accidentally copied from the host build context.
RUN npm ci

# Build SvelteKit app
# Limit Go runtime parallelism for esbuild when building linux/amd64 under emulation.
RUN GOMAXPROCS=1 npm run build


# ---- Runtime stage ----
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies for the target platform
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy only needed build artifacts from build stage
COPY --from=build /app/build ./build
COPY --from=build /app/static ./static

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

# Run the Node adapter output
CMD ["/docker-entrypoint.sh"]