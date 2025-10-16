import { Router, Request, Response, NextFunction } from 'express';
import CompaniesService from './company-service';

interface AuthRequest extends Request {
  user?: any; // or a specific type like: user?: { id: number; name: string }
}

class companyController{
 postCompany = async(req:AuthRequest , res: Response) => {
  try {
    const result = await CompaniesService.createCompany(req.body, req['user']);
    return res.status(201).json(result);
  } catch (err: any) {
    console.error(err);
    return res.status(err.status || 400).json({ message: err.message || '잘못된 요청입니다' });
  }
}

 getCompanies = async(req:AuthRequest , res: Response) => {
  try {
    const result = await CompaniesService.getCompanies(req.query, req['user']);
    return res.json(result);
  } catch (err: any) {
    return res.status(err.status || 400).json({ message: err.message || '잘못된 요청입니다' });
  }
}

 getcompanyUsers = async (req:AuthRequest , res:Response) => {
  try {
    const result = await CompaniesService.getCompanyUsers(req.query, req['user']);
    return res.json({
      currentPage: Number(req.query.page) ||1,
      totalItemCount: result.totalItemCount,
      data:result
    });
  }catch(error){
    console.log(error)
    res.send(error)
  }
}


 updateCompany = async (req:AuthRequest , res:Response) => {
  try {
    const id = Number(req.params.companyId);
    const result = await CompaniesService.updateCompany(id, req.body, req['user']);
    return res.json(result);
  } catch (err: any) {
    res.status(err.status || 400).json({ message: err.message || '잘못된 요청입니다' });
  }
}

 deleteCompany = async (req:AuthRequest , res:Response) => {
  try {
    const id = Number(req.params.companyId);
    await CompaniesService.deleteCompany(id, req['user']);

    return res.json({ message: '회사 삭제 성공' });
  } catch (err: any) {
    
    return res.status(err.status || 400).json({ message: err.message || '잘못된 요청입니다' });
  }
}
}

export default new companyController;
