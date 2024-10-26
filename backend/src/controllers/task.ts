import { NextFunction, Request, Response } from "express";

import TaskModel from "../models/task";
import NodeCache from "node-cache";
import AppError from "../utils/appError";
import { SortOrder } from "mongoose";
import { calculatePriority } from "../services/task";

const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL of 600 seconds (10 minutes)


const taskStaticClass = {
    createTask: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { title, description } = req.body
            if (!title || !description) throw next(new AppError("Title and description are required", 400))

            const priority = calculatePriority(description, title)
            const newTask = await TaskModel.create({ title, description, priority })

            return res.status(201).json({ message: "Task created successfully", task: newTask })
        } catch (error) {
            next(error)
        }
    },
    getTask: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            let task = await TaskModel.findById(id)
            const cacheKey = `task_${id}`;
            const cachedTask = cache.get(cacheKey);
            if (cachedTask) {
                return res.status(200).json({ message: "Data retrieved from cache", task: cachedTask})
            } else {
                if (!task) {
                    return res.status(404).json({ message: 'Task not found' });
                }
                cache.set(cacheKey, task);
                return res.status(200).json({ message: 'Data retrieved from database', task });
            }
        } catch (error) {
            next(error)
        }
    },
    getTaskWithParameters: async (req: Request, res: Response, next: NextFunction) => {
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const title = req.query.title ? (req.query.title as string).trim() : undefined
        const priority = req.query.priority ? calculatePriority(req.query.priority as string, title as string) : undefined
        const sortBy = req.query.sortBy ? (req.query.sortBy as string) : 'createdAt';
        const order = req.query.order === 'desc' ? 'desc' : 'asc';

        const filter: {[key: string]: any} = {}
        if (priority !== undefined) filter.priority = priority;
        if (title !== undefined) filter.title = new RegExp(title, 'i');

        const sortCriteria: [string, SortOrder][] = [[sortBy, order]];        

        const cacheKey = `tasks_${page}_${limit}_${sortBy}_${order}_${priority}_${title}`;
        const myCacheKey = cache.get(cacheKey)
        if (myCacheKey) {
            return res.status(200).json({ message: "Data retrieved from cache", ...myCacheKey })
        }
        const skip = (page - 1) * limit
        const totalTasks = await TaskModel.countDocuments() 
        const totalPages = Math.ceil(totalTasks / limit) 
        const tasks =  await TaskModel.find(filter).sort(sortCriteria).skip(skip).limit(limit)
        

        const cacheData = {
            totalTasks,
            totalPages,
            currentPage: page, 
            tasksPerPage: limit,
            tasks,
        }

        cache.set(cacheKey, cacheData)
        return res.status(200).json({ message: 'Data retrieved from database', ...cacheData });

    },
    updateTask: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { title, description } = req.body

            if (!id) throw next(new AppError("Id are required", 400))
            if (!description) throw next(new AppError("description are required for update", 400))

            const task = await TaskModel.findById(id)
            if (!task) return res.status(404).json({ message: "Task not found" })

            let priority = task.priority
            if ((title && task.title !== title) || description && task.description !== description) {
                priority = calculatePriority(description || task.description, title || task.title, task.createdAt)
            }
            const updateTask = await TaskModel.findByIdAndUpdate(id, { description, title, priority }, { new: true })
            return res.status(201).json({ message: `Task ${id} updated successfully`, task: updateTask })
        } catch (error) {
            next(error)
        }
    },
    deleteTask: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            let task = await TaskModel.findByIdAndDelete(id)
            if (!task) return res.status(404).json({ message: 'Task not found' });

            return res.status(200).json({ message: 'Task deleted', task });
        } catch (error) {
            next(error)
        }
    }
};




export default taskStaticClass;
