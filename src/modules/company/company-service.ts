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
    const searchBy = query.searchBy;
    const keyword = query.keyword;

    const where: any = searchBy && keyword ? { [searchBy]: { contains: keyword } } : {};
    const pageNum = +page
    const pageSizeNum = +pageSize

    const skip = (pageNum - 1) * pageSizeNum;
    const take = pageSizeNum;


    const companies = await CompanyRepository.getManyCompany(where, skip, take);
    const totalItemCount = await CompanyRepository.getCompanyCount();

    const formatCompanies = companies.map(formatResponse);

    return {
      currentPage: pageNum,
      totalPages: Math.ceil(totalItemCount / pageSizeNum),
      totalItemCount,
      data: formatCompanies,
    };
  }

  updateCompany = async (id: number, dto: { companyName?: string; companyCode?: string }, user: any) => {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };
    const updated = await CompanyRepository.updateCompany(id, dto);
    if (!updated) throw { status: 404, message: '존재하지 않는 회사입니다' };

    return formatResponse(updated);
  };

  deleteCompany = async (id: number, user: any) => {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };
    await CompanyRepository.deleteCompany(id);
  };

  getCompanyUsers = async (query: any, user: any) => {
    if (!user?.isAdmin) throw { status: 401, message: '관리자 권한이 필요합니다' };

    const pageNum = Number(query.page) || 1;
    const pageSizeNum = Number(query.pageSize) || 8;
    const searchBy = query.searchBy;
    const keyword = query.keyword;

    const where: any = searchBy && keyword ? { [searchBy]: { contains: keyword } } : {};

    const skip = (pageNum - 1) * pageSizeNum;
    const take = pageSizeNum;

    const companyUsers = await CompanyRepository.findCompanyUsers(where, skip, take);
    const totalItemCount = await CompanyRepository.getCompanyUserCount(where);
    const totalPages = Math.ceil(totalItemCount / pageSizeNum);

    const formattedUsers = companyUsers.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      employeeNumber: u.employeeNumber,
      phoneNumber: u.phoneNumber,
      company: {
        companyName: u.company?.companyName,
      },
    }));
    
  return {
    currentPage: pageNum,
    totalPages,
    totalItemCount,
    data: formattedUsers,
  };
  };
}

export default new CompanyService();

function formatResponse(company: any) {
  const formattedResponse = {
    id: company.id,
    companyName: company.companyName,
    companyCode: company.companyCode,
    userCount: company.userCount,
  };
  return formattedResponse;
}
