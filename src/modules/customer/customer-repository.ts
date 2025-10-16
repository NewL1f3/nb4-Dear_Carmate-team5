import prisma from '../../lib/prisma';
import type { Customer, Company } from '@prisma/client';

interface getManyInput {
  searchBy: string;
  limit: number;
  skip: number;
  keyword: string;
}

interface createData extends Customer {
  company: any;
}

class customerRepository {
  createCustomer = async (newData: createData) => {
    let newCustomer;
    try {
      newCustomer = await prisma.customer.create({
        data: newData,
      });
    } catch (error) {
      // throw databaseCheckError;
      console.error(error);
    }
    return newCustomer;
  };

  getManyCustomers = async ({ searchBy, limit, skip, keyword }: getManyInput) => {
    let customers;

    //검색 기준에 따라 customer 찾기
    if (searchBy == 'name') {
      customers = await prisma.customer.findMany({
        take: limit,
        skip,
        where: {
          name: {
            contains: keyword,
          },
        },
      });
    }

    if (searchBy == 'email') {
      customers = await prisma.customer.findMany({
        take: limit,
        skip,
        where: {
          email: {
            contains: keyword,
          },
        },
      });
    }

    return customers;
  };

  countCustomers = async () => {
    const customerCount = await prisma.customer.count({});
    return customerCount;
  };
}

export default new customerRepository();
