import express, { Application, json, Request, Response, urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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

app.get("/", (req:Request, res: Response)=>{
    res.send("Hello World!")
})

export default app;
