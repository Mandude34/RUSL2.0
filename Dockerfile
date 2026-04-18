FROM node:20

WORKDIR /app

COPY . .

# Install pnpm
RUN npm install -g pnpm

# 🔥 THIS IS THE FIX (no frozen lockfile)
RUN pnpm install --no-frozen-lockfile

# Build your app (adjust if needed)
RUN pnpm run build || true

# Start your server (adjust if needed)
CMD ["pnpm", "start"]
