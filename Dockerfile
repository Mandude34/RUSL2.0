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

# Start the flowstock Vite dev server on port 8080
EXPOSE 8080
CMD ["pnpm", "-F", "@workspace/flowstock", "dev"]
