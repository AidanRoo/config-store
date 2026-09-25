# config-store

A small key-value configuration store REST API, used as a demo application in multiple courses. This copy is part of my work following a Udemy course by Lauro Müller.

The app is built with **Node.js**, **Express** and **Sequelize**, and stores its data in **PostgreSQL**.

## Project structure

```
config-store/
├── src/
│   ├── index.js      # Express app setup, DB connection and server startup
│   ├── db.js         # Sequelize instance (reads DB_URL)
│   ├── models.js     # KV model (key/value pairs)
│   └── routes.js     # /api/kv CRUD routes
├── Dockerfile        # Multi-stage build: development, prod-dependencies, production
├── compose.yaml      # Local stack: app + PostgreSQL
├── .dockerignore
├── package.json
└── LICENSE
```

## Data model

A single `KV` table:

| Field   | Type   | Constraints                |
| ------- | ------ | -------------------------- |
| `key`   | string | required, unique           |
| `value` | string | required                   |

Sequelize also adds `id`, `createdAt` and `updatedAt`. The table is created automatically on startup via `db.sync()`.

## API

All endpoints are under `/api`. Request and response bodies are JSON.

| Method   | Endpoint        | Body                  | Description                  | Success |
| -------- | --------------- | --------------------- | ---------------------------- | ------- |
| `GET`    | `/`             | –                     | Health check ("Hello world!") | 200     |
| `GET`    | `/api/kv`       | –                     | List all key-value pairs     | 200     |
| `GET`    | `/api/kv/:key`  | –                     | Get a single key             | 200     |
| `POST`   | `/api/kv`       | `{ "key", "value" }`  | Create a new key             | 201     |
| `PUT`    | `/api/kv/:key`  | `{ "value" }`         | Update an existing key       | 200     |
| `DELETE` | `/api/kv/:key`  | –                     | Delete a key                 | 204     |

Successful responses are wrapped as `{ "data": ... }`, errors as `{ "error": "..." }` (400 for missing fields or duplicate keys, 404 for unknown keys, 500 for server errors).

## Configuration

| Variable | Description                                   | Default |
| -------- | --------------------------------------------- | ------- |
| `PORT`   | Port the server listens on                    | `3000`  |
| `DB_URL` | PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/dbname` | – (required) |

`compose.yaml` builds `DB_URL` from these variables, which you can put in a `.env` file next to it:

```env
DB_USER=postgres
DB_PASSWORD=changeme
DB_NAME=config_store
```

## Running locally

### With Docker Compose (recommended)

```bash
docker compose up --watch
```

- The API is available at http://localhost:3000 (mapped to port 80 in the container).
- PostgreSQL 17.1 runs in the `db` service, with data persisted in the `postgres-data` volume.
- `--watch` syncs changes in `./src` into the container, where `nodemon` restarts the server.

### Without Docker

Requires Node.js 22 and a running PostgreSQL instance.

```bash
npm install
DB_URL=postgresql://user:pass@localhost:5432/config_store npm run dev
```

## Docker image

The `Dockerfile` has three stages:

- **`development`**: `node:22-alpine` with all dependencies, runs `npm run dev` (nodemon). Used by `compose.yaml`.
- **`prod-dependencies`**: installs production-only dependencies.
- **`production`**: minimal `gcr.io/distroless/nodejs22` image that runs `src/index.js`.

Build the production image:

```bash
docker build --target production -t config-store:latest .
```

## Example requests

```bash
# Create
curl -X POST localhost:3000/api/kv -H 'Content-Type: application/json' \
  -d '{"key":"theme","value":"dark"}'

# Read
curl localhost:3000/api/kv
curl localhost:3000/api/kv/theme

# Update
curl -X PUT localhost:3000/api/kv/theme -H 'Content-Type: application/json' \
  -d '{"value":"light"}'

# Delete
curl -X DELETE localhost:3000/api/kv/theme
```

## License

MIT. See [LICENSE](LICENSE).
