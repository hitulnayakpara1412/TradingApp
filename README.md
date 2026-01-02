# TradingApp

Backend server for a trading application built with Node.js and Express.

Features

- Authentication: OTP, email, OAuth and biometrics handlers
- Stock operations: fetch stocks, place orders, manage holdings
- Services: scheduled jobs, mail sender, stock utilities
- API documentation via Swagger

Repository structure (important files)

- `server/app.js` — application entry
- `server/routes/` — Express routes (`auth.js`, `stocks.js`)
- `server/controllers/` — request handlers and business logic
- `server/models/` — Mongoose models (`User`, `Stock`, `Order`, `Holding`, `Otp`)
- `server/services/` — helpers (`cronJob.js`, `mailSender.js`, `stockUtils.js`)
- `server/scripts/seedStocks.js` — seed initial stock data
- `server/docs/swagger.yaml` — API specification

Getting started

1. Install Node.js (>=14) and npm.
2. From project root, install dependencies and run the server:

```bash
cd server
npm install
node app.js
```

Seeding demo data
Run the stock seeding script to populate `data/stocks.json` into your database:

```bash
cd server
node scripts/seedStocks.js
```

API docs
Open `server/docs/swagger.yaml` with a Swagger UI viewer (or import into Postman).

Configuration
Check `server/config` for DB connection and other settings. Provide required environment variables as needed before running the app.

Notes

- No tests are included in this repository.
- If you want, I can add example `.env` and a `npm start` script.

Contact
For questions or changes, open an issue or reach out to the maintainer.

Environment variables

- **File:** Create a `.env` file at the project backend root: [server/.env](server/.env) and replace the example values below with your own secrets and connection strings.
- **Purpose:** These variables configure the database, mailer, JWTs, and socket tokens used by the backend.

Common variables (examples)

- `MONGO_URI`: example `mongodb+srv://<user>:<pass>@cluster0.mongodb.net/TradingApp?retryWrites=true&w=majority`
- `MAIL_HOST`: example `smtp.elasticemail.com`
- `MAIL_USER`: example `your@email.com`
- `MAIL_PASS`: example `your-mail-service-password`
- `MAIL_PORT`: example `2525`
- `MAIL_FROM`: example `no-reply@yourdomain.com`
- `JWT_SECRET`: example `a_strong_jwt_secret`
- `ACCESS_TOKEN_EXPIRY`: example `1d`
- `REFRESH_TOKEN_SECRET`: example `a_strong_refresh_secret`
- `REFRESH_TOKEN_EXPIRY`: example `30d`
- `SOCKET_TOKEN_SECRET`: example `a_socket_secret`
- `SOCKET_TOKEN_EXPIRY`: example `1d`
- `REFRESH_SOCKET_TOKEN_SECRET`: example `a_refresh_socket_secret`
- `REFRESH_SOCKET_TOKEN_EXPIRY`: example `3d`
- `REGISTER_SECRET`: example `register_secret`
- `REGISTER_SECRET_EXPIRY`: example `5m`
- `GOOGLE_CLIENT_ID`: example `xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`

Example `.env` (replace values)

```dotenv
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/TradingApp

MAIL_HOST=smtp.elasticemail.com
MAIL_USER=you@example.com
MAIL_PASS=your-mail-password
MAIL_PORT=2525
MAIL_FROM=no-reply@example.com

JWT_SECRET=supersecretjwtkey
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=supersecretrefreshkey
REFRESH_TOKEN_EXPIRY=30d

SOCKET_TOKEN_SECRET=socketsupersecret
SOCKET_TOKEN_EXPIRY=1d
REFRESH_SOCKET_TOKEN_SECRET=socketrefreshsecret
REFRESH_SOCKET_TOKEN_EXPIRY=3d

REGISTER_SECRET=registersecret
REGISTER_SECRET_EXPIRY=5m

GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Security note

- Keep this `.env` out of source control (add to `.gitignore`) and never share real credentials in public repositories.
