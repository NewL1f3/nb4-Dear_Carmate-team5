import express from 'express';
import customerRouter from './modules/customers/customers-router';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/customers', customerRouter);
app.get('/dashboard');

app.listen(3000, () => console.log(`server is listening at http://localhost:3000`));
