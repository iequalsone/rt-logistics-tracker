// Simple mock WebSocket server for real-time vehicle updates
// Run with: node mocks/websocket.ts
import { WebSocketServer } from "ws";
import { vehicles, Vehicle } from "./shared-data.js";

const PORT = 3001;

function randomMove(vehicle: Vehicle) {
  // Only move if not offline
  if (vehicle.status !== "Offline") {
    vehicle.lat += (Math.random() - 0.5) * 0.001;
    vehicle.lng += (Math.random() - 0.5) * 0.001;
  }
}

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws) => {
  // Send initial state
  ws.send(JSON.stringify({ type: "update", vehicles }));

  // Broadcast vehicle updates every 2s
  const interval = setInterval(() => {
    vehicles.forEach(randomMove);
    ws.send(JSON.stringify({ type: "update", vehicles }));
  }, 2000);

  ws.on("close", () => clearInterval(interval));
});

console.log(`Mock WebSocket server running on ws://localhost:${PORT}`);
