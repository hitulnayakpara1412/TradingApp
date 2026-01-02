# TradingApp

Backend server for a trading application built with Node.js and Express.

Features
- Authentication: OTP, email, OAuth and biometrics handlers
- Stock operations: fetch stocks, place orders, manage holdings
- Services: scheduled jobs, mail sender, stock utilities
- API documentation via Swagger

Repository structure (important files)
- `TradingServer/app.js` — application entry
- `TradingServer/routes/` — Express routes (`auth.js`, `stocks.js`)
- `TradingServer/controllers/` — request handlers and business logic
- `TradingServer/models/` — Mongoose models (`User`, `Stock`, `Order`, `Holding`, `Otp`)
- `TradingServer/services/` — helpers (`cronJob.js`, `mailSender.js`, `stockUtils.js`)
- `TradingServer/scripts/seedStocks.js` — seed initial stock data
- `TradingServer/docs/swagger.yaml` — API specification

Getting started
1. Install Node.js (>=14) and npm.
2. From project root, install dependencies and run the server:

```bash
cd TradingServer
npm install
node app.js
```

Seeding demo data
Run the stock seeding script to populate `data/stocks.json` into your database:

```bash
cd TradingServer
node scripts/seedStocks.js
```

API docs
Open `TradingServer/docs/swagger.yaml` with a Swagger UI viewer (or import into Postman).

Configuration
Check `TradingServer/config` for DB connection and other settings. Provide required environment variables as needed before running the app.

Notes
- No tests are included in this repository.
- If you want, I can add example `.env` and a `npm start` script.

Contact
For questions or changes, open an issue or reach out to the maintainer.

Frontend (React Native)
This backend is ready to support a React Native mobile app. Below are recommended setup and integration notes for a frontend mobile project.

- Recommended stack: React Native CLI.
- Environment: frontend should store the API base URL in an env config (e.g. `API_BASE_URL`).

Development connection tips
- iOS simulator: `API_BASE_URL` can point to `http://localhost:3000` (when running the backend locally).
- Android emulator (default AVD): use `http://10.0.2.2:3000` to reach the host machine.
- Physical device: expose your dev server via a tunnel (ngrok) and use the ngrok URL as `API_BASE_URL`.

Authentication notes
- Use secure local storage (`expo-secure-store` or platform secure storage) for tokens.
- Follow the backend auth routes in [TradingServer/routes/auth.js](TradingServer/routes/auth.js) for endpoints and required payloads.

Important endpoints
- See route handlers in [TradingServer/routes/auth.js](TradingServer/routes/auth.js) and [TradingServer/routes/stocks.js](TradingServer/routes/stocks.js) for available API endpoints and request/response shapes.
- API documentation: import [TradingServer/docs/swagger.yaml](TradingServer/docs/swagger.yaml) into Swagger UI or Postman to inspect endpoints.

Testing the mobile app
1. Start the backend locally (see Getting started).
2. Configure `API_BASE_URL` in your React Native app depending on your target (simulator/emulator/device).
3. Run the mobile app with Expo or React Native CLI.

Example quick start (Expo)
```bash
npx create-expo-app trading-app-frontend
cd trading-app-frontend
expo install expo-secure-store
# set API_BASE_URL in app config or use .env handling
expo start
```

Next steps
- I can scaffold a minimal React Native starter that demonstrates login, fetching stocks, and placing an order. Would you like that?