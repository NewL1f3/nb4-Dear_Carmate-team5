import CompaniesRepository from './company-repository';
class CompaniesService {
  async createCompany(dto: { companyName: string; companyCode: string }, user: any) {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };
    const newCompany = await CompaniesRepository.createCompany({ ...dto, userCount: 0 });
    return formatResponse(newCompany);
  }

  async getCompanies(query: any, user: any) {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };
    const page = query.page || '1';
    // query = req.query : string
    const pageSize = query.pageSize || '10';
    const searchBy = query.searchBy
    const keyword = query.searchBy
    return await CompaniesRepository.findAll({page, pageSize, searchBy, keyword});
  }

   updateCompany = async (id: number, dto: { companyName?: string; companyCode?: string }, user: any)=> {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };
    const updated = await CompaniesRepository.updateCompany(id, dto);
    if (!updated) throw { status: 404, message: '존재하지 않는 회사입니다' };
    
    return formatResponse(updated);
  }

   deleteCompany = async(id: number, user: any) => {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };
    await CompaniesRepository.deleteCompany(id);
  }

   getCompanyUsers = async(query: any, user: any) => {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };

    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const searchBy = query.searchBy;
    const keyword = query.keyword
    return await CompaniesRepository.findUsersByCompany({page, pageSize, searchBy, keyword});
  }
}

export default new CompaniesService;

function formatResponse(company:any){
  const formattedResponse = {
    id:company.id,
    companyName:company.companyName,
    companyCode: company.companyCode,
    userCount: company.userCount
  }
  return formattedResponse
}
/*
company = 
{"id":2,"companyName":"patchedCompany","companyCode":"3333","userCount":0,"createdAt":"2025-10-16T05:38:50.937Z","updatedAt":"2025-10-16T05:42:01.936Z"}


*/



//response formatting 필요, 