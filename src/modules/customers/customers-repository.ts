import prisma from '../../lib/prisma';
import { databaseCheckError } from '../../lib/errors';
import { getManyRepoInput, createData, updatedData } from './customers-dto';
import { Prisma } from '@prisma/client';

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

  getManyCustomers = async ({ where, limit, skip, companyId }: getManyRepoInput) => {
    let customers;

    //검색 기준에 따라 customer 찾기
    customers = await prisma.customer.findMany({
      take: limit,
      skip,
      where,
    });

    return customers;
  };

  countCustomers = async (where: any) => {
    const customerCount = await prisma.customer.count({ where });
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
