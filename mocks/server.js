"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Simple mock REST API for drivers, vehicles, and jobs
// Run with: node mocks/server.ts
var express_1 = require("express");
var cors_1 = require("cors");
var app = (0, express_1.default)();
var PORT = 3002;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// In-memory mock data
var drivers = [
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
var vehicles = [
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
var jobs = [
    { id: "j1", type: "Delivery", assignedTo: "1", status: "active" },
    { id: "j2", type: "Pickup", assignedTo: "2", status: "active" },
];
// REST endpoints
app.get("/drivers", function (req, res) {
    res.json(drivers);
});
app.get("/vehicles", function (req, res) {
    res.json(vehicles);
});
app.get("/jobs", function (req, res) {
    res.json(jobs);
});
app.post("/assign-job", function (req, res) {
    var _a = req.body, driverId = _a.driverId, job = _a.job;
    var driver = drivers.find(function (d) { return d.id === driverId; });
    if (driver) {
        driver.currentJob = job;
        driver.status = "Active";
        var vehicle = vehicles.find(function (v) { return v.driverName === driver.name; });
        if (vehicle) {
            vehicle.job = job;
            vehicle.status = "Active";
        }
        jobs.push({
            id: "j".concat(jobs.length + 1),
            type: job,
            assignedTo: driverId,
            status: "active",
        });
        res.json({ success: true });
    }
    else {
        res.status(404).json({ success: false });
    }
});
app.post("/pause-driver", function (req, res) {
    var driverId = req.body.driverId;
    var driver = drivers.find(function (d) { return d.id === driverId; });
    if (driver) {
        driver.status = "Offline";
        var vehicle = vehicles.find(function (v) { return v.driverName === driver.name; });
        if (vehicle)
            vehicle.status = "Offline";
        res.json({ success: true });
    }
    else {
        res.status(404).json({ success: false });
    }
});
app.post("/resume-driver", function (req, res) {
    var driverId = req.body.driverId;
    var driver = drivers.find(function (d) { return d.id === driverId; });
    if (driver) {
        driver.status = "Active";
        var vehicle = vehicles.find(function (v) { return v.driverName === driver.name; });
        if (vehicle)
            vehicle.status = "Active";
        res.json({ success: true });
    }
    else {
        res.status(404).json({ success: false });
    }
});
app.post("/complete-job", function (req, res) {
    var driverId = req.body.driverId;
    var driver = drivers.find(function (d) { return d.id === driverId; });
    if (driver) {
        driver.currentJob = null;
        driver.status = "Idle";
        var vehicle = vehicles.find(function (v) { return v.driverName === driver.name; });
        if (vehicle) {
            vehicle.job = null;
            vehicle.status = "Idle";
        }
        jobs = jobs.map(function (j) {
            return j.assignedTo === driverId ? __assign(__assign({}, j), { status: "completed" }) : j;
        });
        res.json({ success: true });
    }
    else {
        res.status(404).json({ success: false });
    }
});
app.listen(PORT, function () {
    console.log("Mock REST API server running on http://localhost:".concat(PORT));
});
