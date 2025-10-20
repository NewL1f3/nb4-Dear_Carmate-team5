import prisma from '../../lib/prisma';
import { databaseCheckError } from '../../lib/errors';
import { getManyRepoInput, createData, updatedData } from './customers-dto';

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

  getManyCustomers = async ({ searchBy, limit, skip, keyword, companyId }: getManyRepoInput) => {
    let customers;

    //검색 기준에 따라 customer 찾기
    if (searchBy == 'name') {
      customers = await prisma.customer.findMany({
        take: limit,
        skip,
        where: {
          companyId,
          name: {
            contains: keyword,
          },
        },
      });
    } else if (searchBy == 'email') {
      customers = await prisma.customer.findMany({
        take: limit,
        skip,
        where: {
          companyId,
          email: {
            contains: keyword,
          },
        },
      });
    } else {
      customers = await prisma.customer.findMany({
        take: limit,
        skip,
        where: {
          companyId,
        },
      });
    }

    return customers;
  };

  countCustomers = async () => {
    const customerCount = await prisma.customer.count({});
    return customerCount;
  };

  updateCustomers = async (updateInputData: updatedData, customerId: number) => {
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

  createMany = async (rows: any[]) => {
    return await prisma.customer.createMany({
      data: rows,
      skipDuplicates: true,
    });
  };
}

export default new customerRepository();
