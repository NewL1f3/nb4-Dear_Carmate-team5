import {
  PrismaClient,
  GenderEnum,
  AgeGroupEnum,
  RegionEnum,
  CarStatusEnum,
  ContractStatusEnum,
  CarModelTypeEnum,
} from '@prisma/client';

const prisma = new PrismaClient();

const main = async () => {
  console.log('--- Seeding 시작 ---');

  await prisma.contract.deleteMany();
  await prisma.car.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.model.deleteMany();
  await prisma.manufacturer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  console.log('[0] 기존 데이터 초기화 완료.');

  // 1. Company (회사) 생성
  const company = await prisma.company.create({
    data: {
      companyName: '베스트 카 매니지먼트',
      companyCode: 'BCM-001',
    },
  });
  console.log(`[1] 회사 생성 완료: ID ${company.id}`);

  // 2. User (사용자 - 로그인 주체) 생성
  const user = await prisma.user.create({
    data: {
      companyId: company.id,
      name: '테스트 관리자',
      email: 'admin@bcm.com',
      employeeNumber: '2024001',
      phoneNumber: '010-1234-5678',
      isAdmin: true,
      password: 'password123',
    },
  });
  console.log(`[2] 사용자 생성 완료: ID ${user.id}`);

  // 3. Manufacturer (제조사) 및 Model (모델) 3개 생성
  const manufacturer = await prisma.manufacturer.create({
    data: {
      name: '현대자동차',
    },
  });

  const modelsData = [
    { modelName: '아반떼 AD', type: CarModelTypeEnum.SEDAN },
    { modelName: '쏘나타 DN8', type: CarModelTypeEnum.SEDAN },
    { modelName: '싼타페 TM', type: CarModelTypeEnum.SUV },
  ];

  const createdModels = [];
  for (const modelData of modelsData) {
    const model = await prisma.model.create({
      data: {
        manufacturerId: manufacturer.id,
        ...modelData,
      },
    });
    createdModels.push(model);
  }
  console.log(`[3] 제조사 및 모델 3개 생성 완료 (ID: ${createdModels.map((m) => m.id).join(', ')})`);

  // 4. Customer (고객) 3명 생성
  const customersData = [
    // 1. 김계약
    {
      name: '김계약',
      gender: GenderEnum.male,
      phoneNumber: '010-9999-8888',
      ageGroup: AgeGroupEnum.thirty,
      region: RegionEnum.seoul,
      email: 'customer1@test.com',
      memo: '신속한 계약 진행을 원함',
    },
    // 2. 이철수
    {
      name: '이철수',
      gender: GenderEnum.male,
      phoneNumber: '010-8888-7777',
      ageGroup: AgeGroupEnum.forty,
      region: RegionEnum.busan,
      email: 'customer2@test.com',
      memo: '주말 계약 선호',
    },
    // 3. 박영희
    {
      name: '박영희',
      gender: GenderEnum.female,
      phoneNumber: '010-7777-6666',
      ageGroup: AgeGroupEnum.twenty,
      region: RegionEnum.gyeonggi,
      email: 'customer3@test.com',
      memo: '옵션 확인 필요',
    },
  ];

  const createdCustomers = [];
  for (const customerData of customersData) {
    const customer = await prisma.customer.create({
      data: {
        companyId: company.id,
        ...customerData,
      },
    });
    createdCustomers.push(customer);
  }
  console.log(`[4] 고객 3명 생성 완료 (ID: ${createdCustomers.map((c) => c.id).join(', ')})`);

  // 5. Car (차량) 3대 생성
  const carsData = [
    // 1. 아반떼 AD (model: createdModels[0])
    {
      modelId: createdModels[0].id,
      carNumber: '11가1111',
      manufacturingYear: 2020,
      mileage: 50000,
      price: 15000000,
      explanation: '깔끔하게 관리된 아반떼 AD 차량입니다.',
      status: CarStatusEnum.possession,
    },
    // 2. 쏘나타 DN8 (model: createdModels[1])
    {
      modelId: createdModels[1].id,
      carNumber: '22나2222',
      manufacturingYear: 2022,
      mileage: 15000,
      price: 25000000,
      explanation: '신형 쏘나타, 거의 신차급입니다.',
      status: CarStatusEnum.possession,
    },
    // 3. 싼타페 TM (model: createdModels[2])
    {
      modelId: createdModels[2].id,
      carNumber: '33다3333',
      manufacturingYear: 2021,
      mileage: 30000,
      price: 30000000,
      explanation: '패밀리 SUV, 넉넉한 공간.',
      status: CarStatusEnum.possession,
    },
  ];

  const createdCars = [];
  for (const carData of carsData) {
    const car = await prisma.car.create({
      data: {
        companyId: company.id,
        ...carData,
      },
    });
    createdCars.push(car);
  }
  console.log(`[5] 차량 3대 생성 완료 (ID: ${createdCars.map((c) => c.id).join(', ')})`);

  // 6. Contract (계약) 3건 생성 (1:1 매핑)
  const contractsData = [
    { customerIndex: 0, carIndex: 0, contractName: '아반떼-김계약 매매 계약', contractPrice: 16000000 },
    { customerIndex: 1, carIndex: 1, contractName: '쏘나타-이철수 매매 계약', contractPrice: 26000000 },
    { customerIndex: 2, carIndex: 2, contractName: '싼타페-박영희 매매 계약', contractPrice: 31000000 },
  ];

  const createdContracts = [];
  for (const contractData of contractsData) {
    const contract = await prisma.contract.create({
      data: {
        userId: user.id,
        companyId: company.id,
        customerId: createdCustomers[contractData.customerIndex].id,
        carId: createdCars[contractData.carIndex].id,
        status: ContractStatusEnum.contractSuccessful, // 계약 완료
        resolutionDate: new Date(),
        contractPrice: contractData.contractPrice,
        contractName: contractData.contractName,
      },
    });
    createdContracts.push(contract);
  }
  console.log(`[6] 계약 3건 생성 완료 (ID: ${createdContracts.map((c) => c.id).join(', ')})`);

  console.log('--- Seeding 완료 ---');
  console.log(`✅ 다음 테스트에 필요한 Contract ID 목록: ${createdContracts.map((c) => c.id).join(', ')}`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
