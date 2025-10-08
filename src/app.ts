import express, { Request, Response } from "express";
import dotenv from "dotenv";
import userController from "./user-controller"

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.get('/', (req: Request, res: Response) =>{
    res.send("hello world");
});

app.use("/users", userController);

app.listen(port, () =>{
console.log(`servser is running on port ${port}`);
});
