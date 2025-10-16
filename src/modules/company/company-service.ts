import CompanyRepository from './company-repository';
class CompanyService {
  async createCompany(dto: { companyName: string; companyCode: string }, user: any) {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };
    const newCompany = await CompanyRepository.createCompany({ ...dto, userCount: 0 });
    return formatResponse(newCompany);
  }

  async getCompanies(query: any, user: any) {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };
    const page = query.page || '1';
    const pageSize = query.pageSize || '10';
    const searchBy = query.searchBy
    const keyword = query.searchBy


    const where: any = (searchBy && keyword) ? { [searchBy]: { contains: keyword } } : {};
    const pageNum = +page
    const pageSizeNum = +pageSize

    const companies =await CompanyRepository.getManyCompany(pageNum, pageSizeNum, where)
    //{ totalItemCount, data };
    //
    const totalItemCountString = await CompanyRepository.getCompanyCount();
    const totalItemCount = +totalItemCountString

    const formatCompanies = [];    
    
    for(const company of companies){
      formatCompanies.push(formatResponse(company))
    }

    const resultFormat = {
      currentPage: Number(query.page) || 1,
      totalpages: Math.floor(totalItemCount/pageSizeNum)+1 ,
      totalItemCount,
      data: formatCompanies
    }
    return resultFormat;
  }

   updateCompany = async (id: number, dto: { companyName?: string; companyCode?: string }, user: any)=> {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };
    const updated = await CompanyRepository.updateCompany(id, dto);
    if (!updated) throw { status: 404, message: '존재하지 않는 회사입니다' };
    
    return formatResponse(updated);
  }

   deleteCompany = async(id: number, user: any) => {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };
    await CompanyRepository.deleteCompany(id);
  }

   getCompanyUsers = async(query: any, user: any) => {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };

    const page = Number(query.page) || 1;
    const pageSize = query.pageSize || 10;
    const searchBy = query.searchBy;
    const keyword = query.keyword
    
    const pageNum = +page;
    const pageSizeNum = +pageSize;

    // repo에서 쓸 변수들 정의
    const where = (searchBy && keyword) ? { [searchBy]: { contains: keyword } } : {};
    const take =  pageSizeNum;
    const skip = (pageNum - 1) * pageSizeNum
    const companyUsers = await CompanyRepository.findCompanyUsers(where,skip,take);
    const totalItemCount = await 

    const result = {
      currentPage: page,
      totalPages: totalItemcount,
      totalItemCount,
      data: companyUsers
    }
    return result;
  }
}

export default new CompanyService;

function formatResponse(company:any){
  const formattedResponse = {
    id:company.id,
    companyName:company.companyName,
    companyCode: company.companyCode,
    userCount: company.userCount
  }
  return formattedResponse
}

