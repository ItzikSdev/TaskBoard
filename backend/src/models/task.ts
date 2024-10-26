import { timeStamp } from 'console';
import mongoose, { Schema, Document } from 'mongoose';


interface ITask extends Document {
    title: string;
    description: string;
    priority: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const TaskSchema: Schema<ITask> = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: Number,
        min: 0,
        max: 1,
        required: true
    }
}, { timestamps: true })

TaskSchema.pre<ITask>('save', function (next) {
    if (!this.priority) {
        this.priority = Math.random()
    }
    next()
})

const TaskModel = mongoose.model<ITask>('Task', TaskSchema)
export default TaskModel