// Simple mock REST API for drivers, vehicles, and jobs
// Run with: node mocks/server.ts
import express from "express";
import cors from "cors";
import { drivers, vehicles, jobManager } from "./shared-data.js";
const app = express();
const PORT = 3002;
app.use(cors());
app.use(express.json());
// REST endpoints
app.get("/drivers", function (req, res) {
    res.json(drivers);
});
app.get("/vehicles", function (req, res) {
    res.json(vehicles);
});
app.get("/jobs", function (req, res) {
    res.json(jobManager.jobs);
});
app.post("/assign-job", function (req, res) {
    const { driverId, job } = req.body;
    const driver = drivers.find((d) => d.id === driverId);
    if (driver) {
        driver.currentJob = job;
        driver.status = "Active";
        const vehicle = vehicles.find((v) => v.driverName === driver.name);
        if (vehicle) {
            vehicle.job = job;
            vehicle.status = "Active";
        }
        jobManager.addJob({
            id: `j${jobManager.jobs.length + 1}`,
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
    const { driverId } = req.body;
    const driver = drivers.find((d) => d.id === driverId);
    if (driver) {
        driver.status = "Offline";
        const vehicle = vehicles.find((v) => v.driverName === driver.name);
        if (vehicle)
            vehicle.status = "Offline";
        res.json({ success: true });
    }
    else {
        res.status(404).json({ success: false });
    }
});
app.post("/resume-driver", function (req, res) {
    const { driverId } = req.body;
    const driver = drivers.find((d) => d.id === driverId);
    if (driver) {
        driver.status = "Active";
        const vehicle = vehicles.find((v) => v.driverName === driver.name);
        if (vehicle)
            vehicle.status = "Active";
        res.json({ success: true });
    }
    else {
        res.status(404).json({ success: false });
    }
});
app.post("/complete-job", function (req, res) {
    const { driverId } = req.body;
    const driver = drivers.find((d) => d.id === driverId);
    if (driver) {
        driver.currentJob = null;
        driver.status = "Idle";
        const vehicle = vehicles.find((v) => v.driverName === driver.name);
        if (vehicle) {
            vehicle.job = null;
            vehicle.status = "Idle";
        }
        jobManager.updateJobStatus(driverId, "completed");
        res.json({ success: true });
    }
    else {
        res.status(404).json({ success: false });
    }
});
app.listen(PORT, () => {
    console.log(`Mock REST API server running on http://localhost:${PORT}`);
});
