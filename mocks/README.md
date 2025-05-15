# Mock Backend & WebSocket Server

This project includes a simple mock REST API and WebSocket server for local development and testing.

## How to Run the Mock Backend

### 1. Install dependencies (if not already installed)

```
npm install express cors ws
```

### 2. Start the REST API server

```
node mocks/server.ts
```

- Runs on http://localhost:3002
- Endpoints: `/drivers`, `/vehicles`, `/jobs`, `/assign-job`, `/pause-driver`, `/resume-driver`, `/complete-job`

### 3. Start the WebSocket server

```
node mocks/websocket.ts
```

- Runs on ws://localhost:3001
- Broadcasts vehicle updates every 2 seconds

## Notes

- The mock servers use in-memory data and do not persist changes between restarts.
- The REST API and WebSocket server are independent but use similar initial data for demo purposes.
- You can modify the mock data in `mocks/server.ts` and `mocks/websocket.ts` as needed for your tests.

---

For more details, see the implementation plan in `implementation/logistic-tracker.md`.
