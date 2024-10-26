import express, { Express } from "express";
import taskStaticClass from "../controllers/task";
import { validateTaskId } from "../middleware/validation";

const api: Express = express();

api.post("/api/tasks", taskStaticClass.createTask);
api.get("/api/tasks", taskStaticClass.getTaskWithParameters);
api.get("/api/tasks/:id", validateTaskId, taskStaticClass.getTask);
api.delete("/api/tasks/:id", validateTaskId, taskStaticClass.deleteTask);
api.put("/api/tasks/:id", validateTaskId, taskStaticClass.updateTask);

export default api;
