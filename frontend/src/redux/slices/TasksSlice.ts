import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Task = {
  _id: string;
  title: string;
  description: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  message: string;
};

export type TasksState = {
  task: Task | null;
  tasks: Task[];
  loading: boolean;
  error: string | null;
  messageOk: string;
  messageWorn: string;
  messageError: string;
  totalPages: number;
};

const initialState: TasksState = {
  task: null,
  tasks: [],
  loading: false,
  error: null,
  messageOk: "",
  messageWorn: "",
  messageError: "",
  totalPages: 1,
};

const tasksSlice = createSlice({
  name: "tasksSlice",
  initialState,
  reducers: {
    setTask: (state, action: PayloadAction<Task>) => {
      state.task = action.payload;
    },
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
    },
    setTotalPages: (state, action: PayloadAction<number>) => {
      state.totalPages = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTaskById: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(
        (task) => task.id === action.payload.id
      );
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setMessageOk: (state, action: PayloadAction<string>) => {
      state.messageOk = action.payload;
    },
    setMessageWorn: (state, action: PayloadAction<string>) => {
      state.messageWorn = action.payload;
    },
    setMessageError: (state, action: PayloadAction<string>) => {
      state.messageError = action.payload;
    },
  },
});

// Export the actions
export const {
  setTask,
  setTasks,
  setTotalPages,
  addTask,
  updateTaskById,
  setLoading,
  setError,
  setMessageOk,
  setMessageWorn,
  setMessageError,
} = tasksSlice.actions;

// Export the reducer
export default tasksSlice.reducer;
