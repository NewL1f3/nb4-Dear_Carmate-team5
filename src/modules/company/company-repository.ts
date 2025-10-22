import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface findAllinput {
  page: string;
  pageSize: string;
  searchBy: string;
  keyword: string;
}

interface findUsersInput {
  page: string;
  pageSize: string;
  searchBy: string;
  keyword: string;
}

class CompanyRepository {
  createCompany = async function (data: Prisma.CompanyCreateInput) {
    return await prisma.company.create({ data });
  };

  getManyCompany = async function (where: any, skip: number, take: number) {
    try {
      const data = await prisma.company.findMany({
        where,
        skip,
        take,
        include: {
          users: true,
        },
      });
      return data;
    } catch (error) {
      console.error(error);
      throw new Error('error occured');
    }
  };

  getCompanyCount = async function (where = {}) {
    const count = await prisma.company.count({ where });
    return count;
  };

  findById = async function (companyId: number) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    return company;
  };

  updateCompany = async function (companyId: number, data: Prisma.CompanyUpdateInput) {
    return await prisma.company.update({ where: { id: companyId }, data });
  };

  deleteCompany = async function (companyId: number) {
    return await prisma.company.delete({ where: { id: companyId } });
  };

  findCompanyUsers = async function (where: any, skip: number, take: number) {
    try {
      const users = await prisma.user.findMany({
        where,
        skip,
        take,
        //include에서 company 수정 필요
        include: { company: true },
      });
      return users;
    } catch (error) {
      console.error(error);
      throw new Error('error occured');
    }
  };
  getCompanyUserCount = async function (companyId: number) {
    const count = await prisma.user.count({
      where: { companyId },
    });
    return count;
  };
}

export default new CompanyRepository();
