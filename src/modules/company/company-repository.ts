import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface findAllinput {
  page: string;
  pageSize: string;
  searchBy: string;
  keyword: string;
}

interface findUsersInput{
  page: string;
   pageSize: string;
   searchBy: string;
   keyword: string;

}

class CompanyRepository {
  createCompany = async function( data: Prisma.CompanyCreateInput) {
    return await prisma.company.create({ data });
  }

  findAll = async function({page, pageSize, searchBy, keyword}: findAllinput) {
    const where = (searchBy && keyword) ? { [searchBy]: { contains: keyword } } : {};
    const totalItemCount = await prisma.company.count({ where });
    const pageNum = +page
    const pageSizeNum = +pageSize
    const data = await prisma.company.findMany({
      where,
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      include: { users: true }
    });
    return { totalItemCount, data };
  }

   findById = async function(companyId: number) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    return company
  }

  updateCompany = async function(companyId: number,  data: Prisma.CompanyUpdateInput) {
    return await prisma.company.update({ where: { id: companyId }, data });
  }

  deleteCompany = async function(companyId: number) {
    return await prisma.company.delete({ where: { id: companyId } });
  }

  findUsersByCompany = async function({page, pageSize, searchBy, keyword}:findUsersInput) {
    
    const where = (searchBy && keyword) ? { [searchBy]: { contains: keyword } } : {};
    const totalItemCount = await prisma.user.count({ where });
    
    const pageNum = +page;
    const pageSizeNum = +pageSize;

    const data = await prisma.user.findMany({
      where,
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
      include: { company: true }
    });
    return { totalItemCount, data };
  }
};
export default new CompanyRepository