import express from 'express';
import { getDashboard } from './dashboard/dashboard';
const app = express();
app.use(express.json());

app.get('/dashboard', getDashboard);

app.listen(3000, () => console.log(`server is listening at http://localhost:3000`));
