import express from 'express';
import companyRouter from './modules/company/company-router';

const app = express();
app.use(express.json());

// http://localhost:3000/companies 여기 주소로 요청이 오면 companyRouter를 실행시켜줘
app.use('/companies', companyRouter);


app.listen(3000, () => {
    console.log(`server is listening at http://localhost:3000`)
})

export default app;
