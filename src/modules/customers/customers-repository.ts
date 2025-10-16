import prisma from '../../lib/prisma';
import type { Customer, Company, Prisma } from '@prisma/client';
import { databaseCheckError } from '../../lib/errors';

interface getManyInput {
  searchBy: string;
  limit: number;
  skip: number;
  keyword: string;
}

interface createData extends Customer {
  company: any;
}

interface updatedData extends Prisma.CustomerUpdateInput {
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

  updatedCustomers = async (updateInputData: updatedData, customerId: number) => {
    let patchCustomer;
    try {
      patchCustomer = await prisma.customer.update({
        data: updateInputData,
        where: { id: customerId },
      });
      return patchCustomer;
    } catch (error) {
      throw databaseCheckError;
    }
  };

  findCustomer = async (customerId: number) => {
    let customer;
    try {
      customer = await prisma.customer.findFirst({
        where: { id: customerId },
      });
    } catch (error) {
      throw databaseCheckError;
    }
    return customer;
  };

  deleteCustomer = async (customerId: number) => {
    try {
      await prisma.customer.delete({
        where: { id: customerId },
      });
    } catch (error) {
      throw databaseCheckError;
    }
  };
}

export default new customerRepository();
