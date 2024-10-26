import axios from "axios"
import { Task } from "../redux/slices/TasksSlice"

export const fetchTasks = async (
    page:number, 
    limit: number, 
    filterByPriority: string, 
    filterByTitle: string, 
    sort: { priority?: number; createdAt?: number; lastSortField?: 'priority' | 'createdAt' }
    ): Promise<Task[]> => {
    const priority = filterByPriority
    const title = filterByTitle;
    const sortBy = sort.lastSortField || (sort.priority !== undefined ? 'priority' : 'createdAt')
    const order = sortBy && sort[sortBy] === 1 ? 'asc' : 'desc'; 
    
    const response = await axios.get("http://localhost:3100/api/tasks", {
        params: {page, limit, priority, title, sortBy, order}
    });    

    return response.data;
};

export const fetchTaskById = async (id: string): Promise<Task> => {
    const response = await axios.get(`http://localhost:3100/api/tasks/${id}`);
    return response.data.task;
};

export const createTask = async (data: { title: string; description: string }): Promise<Task> => {
    const response = await axios.post("http://localhost:3100/api/tasks", data, {
        headers: { "Content-Type": "application/json" },
    });
    return response.data.task;
};

export const putTaskById = async (id: string, data: { title: string; description: string }): Promise<Task> => {
    const response = await axios.put(`http://localhost:3100/api/tasks/${id}`, data, {
        headers: { "Content-Type": "application/json" },
    });    
    return response.data.task;
};

export const deleteTaskById = async (id: string): Promise<Task> => {
    const response = await axios.delete(`http://localhost:3100/api/tasks/${id}`, {
        headers: { "Content-Type": "application/json" },
    })
    return response.data
}