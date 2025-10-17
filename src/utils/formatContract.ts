// utils/formatContract.ts (혹은 같은 파일 상단에 두어도 무방)
import { ContractResponse } from '../modules/contracts/contracts-dto';
import { ContractEntity } from '../types/contract'

export const formatContract = (contract: ContractEntity): ContractResponse => {
  if (!contract) {
    throw new Error('Invalid contract object');
  }

  return {
    id: contract.id,
    status: contract.status,
    resolutionDate: contract.resolutionDate?.toISOString() ?? null,
    contractPrice: contract.contractPrice,
    meetings: (contract.meetings || []).map((m: any) => ({
      id: m.id,
      date: m.date.toISOString(),
      alarms: (m.alarms || []).map((a: Date | string) =>
        typeof a === 'string' ? a : new Date(a).toISOString()
      ),
    })),
    user: { id: contract.user.id, name: contract.user.name },
    customer: { id: contract.customer.id, name: contract.customer.name },
    car: { id: contract.car.id, model: contract.car.model.modelName },
  };
};
