import express, { Application, json, Request, Response, urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import notFound from "./middlewares/notFound";

const app: Application = express();

app.use(
  cors({
    origin: process.env.APP_URL,
    credentials: true,
  }),
);

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", router);

app.get("/", (req:Request, res: Response)=>{
    res.send("Hello World! RentNest API is running.")
})

app.use(globalErrorHandler);
app.use(notFound);

export default app;
