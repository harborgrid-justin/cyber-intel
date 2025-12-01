<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/181L4DzKLlGfu4pRbEHZ2N0efvsho8pri

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. (Optional) Set the `OPENAI_API_KEY` in [.env.local](.env.local) to your OpenAI API key for AI-powered features
3. Run the app:
   `npm run dev`

Note: The app will run without an API key, but AI-powered threat analysis and briefings will be disabled.

## Backend (NestJS) & Postgres

The `server/` workspace expects a relational database. A development-ready Postgres instance is provided via Docker Compose.

1. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables**  
   Update `server/.env` (created for you with sensible defaults). When running the NestJS server directly on your machine, `DB_HOST=localhost` works with the Docker container. If you run the API inside Docker (`docker compose up api`), the compose file already injects `DB_HOST=postgres` for you.

3. **Start Postgres (and optionally the API)**
   ```bash
   cd ..
   docker compose up -d postgres
   ```

   This launches a `postgres:16-alpine` container exposing port `5432` with the credentials defined in `.env`.

   To run the NestJS API inside Docker alongside the database:

   ```bash
   docker compose up -d api
   ```

   The API will be available on http://localhost:3001 and automatically waits for Postgres to become healthy.

4. **Run the NestJS server (local machine)**
   ```bash
   cd server
   npm run start:dev
   ```

5. **Shutdown (optional)**
   ```bash
   docker compose down
   ```

The Sequelize configuration now reads connection settings from environment variables, defaulting to Postgres while still allowing a SQLite fallback (`DB_DIALECT=sqlite`) for lightweight testing.
