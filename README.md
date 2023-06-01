# create-t3-turbo

<img width="1758" alt="turbo2" src="https://user-images.githubusercontent.com/51714798/213819392-33e50db9-3e38-4c51-9a22-03abe5e48f3d.png">

## Quick Start

To get it running, follow the steps below:

### Setup dependencies

```diff
# Install dependencies
pnpm i

# Configure environment variables.
# There is an `.env.example` in the root directory you can use for reference
cp .env.example .env

# Generate zenstack plugins and push the Prisma schema to your database
pnpm zen:up
```

## Development

```diff
# Start the development server
pnpm dev --filter express-api --filter swagger
```

## Production

```diff
# Build and start the separated api and swagger apps
pnpm start --filter express-api --filter swagger
```
