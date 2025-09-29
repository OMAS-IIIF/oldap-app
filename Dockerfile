# ---- Build stage ----
FROM node:20-alpine AS build

# Install build tools
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy dependency manifests first (better layer caching)
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# Install dependencies (adjust command to your package manager)
RUN npm ci

# Copy project source
COPY . .


# Build SvelteKit app
RUN npm run build


# ---- Runtime stage ----
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV API_URL=http://localhost:8000

# Copy only needed files from build stage
COPY --from=build /app/build ./build

# Copy dependencies
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

# Run the Node adapter output
CMD ["/docker-entrypoint.sh"]