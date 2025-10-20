// types/contract.ts
import { Contract as PrismaContract, Car, Customer, User, Meeting } from '@prisma/client';

export type ContractEntity = PrismaContract & {
  car: Car & { model: { modelName: string } };
  customer: Customer;
  user: User;
  meetings?: (Meeting & { alarms?: (Date | string)[] })[];
};
