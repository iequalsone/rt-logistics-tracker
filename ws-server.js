import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 3001 });

let vehicles = [
  {
    id: "veh-1",
    name: "Truck 1",
    lat: 37.7749,
    lng: -122.4194,
    driverName: "Alice",
    status: "en route",
    route: "A-B",
    job: "Delivery",
  },
  {
    id: "veh-2",
    name: "Van 2",
    lat: 37.7849,
    lng: -122.4094,
    driverName: "Bob",
    status: "idle",
    route: "B-C",
    job: "Pickup",
  },
  {
    id: "veh-3",
    name: "Truck 3",
    lat: 37.7649,
    lng: -122.4294,
    driverName: "Charlie",
    status: "en route",
    route: "C-D",
    job: "Delivery",
  },
];

function randomizeVehiclePositions() {
  vehicles = vehicles.map((v) => ({
    ...v,
    lat: v.lat + (Math.random() - 0.5) * 0.002,
    lng: v.lng + (Math.random() - 0.5) * 0.002,
  }));
}

setInterval(() => {
  randomizeVehiclePositions();
  const data = JSON.stringify({ type: "update", vehicles });
  server.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}, 2000);

server.on("connection", (ws) => {
  ws.send(JSON.stringify({ type: "update", vehicles }));
  console.log("Client connected");
});

console.log("WebSocket server running on ws://localhost:3001");
