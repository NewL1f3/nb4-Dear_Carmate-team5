import express from 'express';
import cors from 'cors';
import { getDashboard } from './modules/dashboard/dashboard-controller';
const app = express();
app.use(express.json());
//cors 사용하기
app.use(cors());

app.get('/dashboard', getDashboard);

app.listen(3000, () => console.log(`server is listening at http://localhost:3000`));
