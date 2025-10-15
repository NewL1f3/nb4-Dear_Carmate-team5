import CompaniesRepository from './company-repository';

class CompaniesService {
  async createCompany(dto: { companyName: string; companyCode: string }, user: any) {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };
    return CompaniesRepository.createCompany({ ...dto, userCount: 0 });
  }

  async getCompanies(query: any, user: any) {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };
    const page = query.page || '1';
    // query = req.query : string
    const pageSize = query.pageSize || '10';
    const searchBy = query.searchBy
    const keyword = query.searchBy
    return CompaniesRepository.findAll({page, pageSize, searchBy, keyword});
  }

   updateCompany = async (id: number, dto: { companyName?: string; companyCode?: string }, user: any)=> {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };
    const updated = await CompaniesRepository.updateCompany(id, dto);
    if (!updated) throw { status: 404, message: '존재하지 않는 회사입니다' };
    return updated;
  }

   deleteCompany = async(id: number, user: any) => {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };
    return CompaniesRepository.deleteCompany(id);
  }

   getCompanyUsers = async(query: any, user: any) => {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };
    const page = query.page || 1;
    const pageSize = query.pageSize || 10;
    const searchBy = query.searchBy;
    const keyword = query.keyword
    return CompaniesRepository.findUsersByCompany({page, pageSize, searchBy, keyword});
  }
}

export default new CompaniesService;

//response formatting 필요, 