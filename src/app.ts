import express, { Request, Response } from "express";
import dotenv from "dotenv";
import userRouter from "./modules/user/user-router";
import authRouter from "./modules/auth/auth-router";
import cors from "cors";

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.get('/', (req: Request, res: Response) =>{
    res.send("hello world");
});

app.use("/users", userRouter);
app.use("/auth", authRouter);

app.listen(port, () =>{
console.log(`servser is running on port ${port}`);
});
