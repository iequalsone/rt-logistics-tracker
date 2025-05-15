// Simple mock WebSocket server for real-time vehicle updates
// Run with: node mocks/websocket.ts
import { WebSocketServer } from "ws";
const PORT = 3001;
// In-memory vehicle state (should match server.ts for demo)
const vehicles = [
    {
        id: "1",
        name: "Truck 1",
        lat: 37.7749,
        lng: -122.4194,
        driverName: "Alice",
        status: "Active",
        route: "A",
        job: "Delivery",
    },
    {
        id: "2",
        name: "Van 2",
        lat: 37.7849,
        lng: -122.4094,
        driverName: "Bob",
        status: "Idle",
        route: "B",
        job: "Pickup",
    },
    {
        id: "3",
        name: "Car 3",
        lat: 37.7649,
        lng: -122.4294,
        driverName: "Charlie",
        status: "Offline",
        route: "C",
        job: null,
    },
];
function randomMove(vehicle) {
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
