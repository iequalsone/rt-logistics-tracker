// Shared data for both REST API and WebSocket servers
// Shared data instances
export const drivers = [
    {
        id: "1",
        name: "Alice",
        status: "Active",
        vehicleId: "1",
        currentJob: "Delivery",
    },
    {
        id: "2",
        name: "Bob",
        status: "Idle",
        vehicleId: "2",
        currentJob: "Pickup",
    },
    {
        id: "3",
        name: "Charlie",
        status: "Offline",
        vehicleId: null,
        currentJob: null,
    },
];
export const vehicles = [
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
// Using a class to manage jobs so we can update them without reassigning
export class JobManager {
    constructor() {
        this._jobs = [
            { id: "j1", type: "Delivery", assignedTo: "1", status: "active" },
            { id: "j2", type: "Pickup", assignedTo: "2", status: "active" },
        ];
    }
    get jobs() {
        return this._jobs;
    }
    addJob(job) {
        this._jobs.push(job);
    }
    updateJobStatus(assignedTo, status) {
        this._jobs = this._jobs.map((j) => j.assignedTo === assignedTo ? Object.assign(Object.assign({}, j), { status }) : j);
    }
}
export const jobManager = new JobManager();
