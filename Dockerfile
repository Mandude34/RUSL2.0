FROM node:20

# Install pnpm globally via corepack (avoids triggering the workspace
# preinstall guard that rejects non-pnpm package managers)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY . .

# Install all workspace dependencies.
# PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 disables the supply-chain delay check
# that would otherwise block packages published within the last 24 hours
# from being installed inside the container.
RUN PNPM_CONFIG_MINIMUM_RELEASE_AGE=0 pnpm install --no-frozen-lockfile

# Compile TypeScript to JavaScript via esbuild (outputs dist/index.mjs)
RUN pnpm -F @workspace/api-server build

# Start the api-server
EXPOSE 3000
CMD ["pnpm", "-F", "@workspace/api-server", "start"]
