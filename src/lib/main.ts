import express from 'express';
import customerRouter from '../customer/customer-router';

const app = express();
app.use(express.json());
app.use('/customers', customerRouter);
app.get('/dashboard');

app.listen(3000, () => console.log(`server is listening at http://localhost:3000`));
