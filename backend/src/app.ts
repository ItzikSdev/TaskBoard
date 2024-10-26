import express,{ Express, NextFunction, Request, Response }from "express";
import dotenv from "dotenv";
import morgan from 'morgan';
import cors from "cors";
import mongoose from "mongoose";

import api from "./routes/api";
import errorHandler from "./middleware/errorHandler";
import AppError from "./utils/appError";


dotenv.config({ path: ".env" }); 

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('Connected to MongoDB...');
  } catch (err) {
    console.error('Could not connect to MongoDB...', err);
  }
};
connectDB();

const app: Express = express();
app.use(express.json());
app.use(cors());
app.use(morgan('combined'));
app.use(errorHandler)
app.use("/", api);

app.all("*", (req: Request, res: Response, next: NextFunction) => next(new AppError(`Cant find ${req.originalUrl} on this server `, 404)))

const port = 3100;
const serverName = "Backend";
app.listen(port, () => {
  console.log(
    `[server]: ${serverName} Server is running at http://localhost:${port}`
  );
});
