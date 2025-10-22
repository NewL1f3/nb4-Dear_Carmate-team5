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

  // 3. Manufacturer (제조사) 및 Model (모델) 생성 (확장된 데이터)
  const [hyundai, kia, bmw, benz, chevrolet] = await Promise.all([
    prisma.manufacturer.create({ data: { name: '현대' } }), // 사용자 요청에 따라 '현대'로 생성
    prisma.manufacturer.create({ data: { name: '기아' } }),
    prisma.manufacturer.create({ data: { name: 'BMW' } }),
    prisma.manufacturer.create({ data: { name: '메르세데스-벤츠' } }),
    prisma.manufacturer.create({ data: { name: '쉐보레' } }),
  ]);
  console.log('[3-1] 제조사 5개 생성 완료');

  await prisma.model.createMany({
    data: [
      { manufacturerId: hyundai.id, modelName: '아반떼', type: CarModelTypeEnum.SEDAN },
      { manufacturerId: hyundai.id, modelName: '쏘나타', type: CarModelTypeEnum.SEDAN },
      { manufacturerId: hyundai.id, modelName: '그랜저', type: CarModelTypeEnum.SEDAN },
      { manufacturerId: kia.id, modelName: 'K5', type: CarModelTypeEnum.SEDAN },
      { manufacturerId: kia.id, modelName: '쏘렌토', type: CarModelTypeEnum.SUV },
      { manufacturerId: bmw.id, modelName: '3시리즈', type: CarModelTypeEnum.SEDAN },
      { manufacturerId: benz.id, modelName: 'E클래스', type: CarModelTypeEnum.SEDAN },
      { manufacturerId: chevrolet.id, modelName: '스파크', type: CarModelTypeEnum.COMPACT },
    ],
  });
  console.log('[3-2] 모델 8개 생성 완료');

  // 아반떼, 쏘나타, (SUV 대체로) 쏘렌토를 사용합니다.
  const neededModels = await prisma.model.findMany({
    where: {
      modelName: {
        in: ['아반떼', '쏘나타', '쏘렌토'],
      },
    },
  });

  // 조회된 모델에서 필요한 3가지 모델을 명시적으로 찾아 순서를 정의합니다.
  const avante = neededModels.find((m) => m.modelName === '아반떼');
  const sonata = neededModels.find((m) => m.modelName === '쏘나타');
  const sorento = neededModels.find((m) => m.modelName === '쏘렌토');

  // 배열에 담아 createdModels로 사용합니다. (모델이 없는 경우 에러를 던집니다.)
  const createdModels = [avante, sonata, sorento].filter((m): m is Exclude<typeof m, undefined> => m !== undefined);

  if (createdModels.length !== 3) {
    throw new Error('필수 모델 (아반떼, 쏘나타, 쏘렌토) 중 일부를 찾지 못했습니다. 시딩 실패.');
  }

  // createdModels[0] = 아반떼, createdModels[1] = 쏘나타, createdModels[2] = 쏘렌토 (기존 싼타페 대체)
  console.log(`[3-3] 차량 생성을 위한 모델 3개 준비 완료 (ID: ${createdModels.map((m) => m.id).join(', ')})`);

  // 4. Customer (고객) 3명 생성 (이전과 동일)
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

  // 5. Car (차량) 3대 생성 (수정된 createdModels 사용)
  const carsData = [
    // 1. 아반떼 (model: createdModels[0])
    {
      modelId: createdModels[0].id,
      carNumber: '11가1111',
      manufacturingYear: 2020,
      mileage: 50000,
      price: 15000000,
      explanation: '깔끔하게 관리된 아반떼 차량입니다.',
      status: CarStatusEnum.possession,
    },
    // 2. 쏘나타 (model: createdModels[1])
    {
      modelId: createdModels[1].id,
      carNumber: '22나2222',
      manufacturingYear: 2022,
      mileage: 15000,
      price: 25000000,
      explanation: '신형 쏘나타, 거의 신차급입니다.',
      status: CarStatusEnum.possession,
    },
    // 3. 쏘렌토 (model: createdModels[2] - 기존 싼타페 대체)
    {
      modelId: createdModels[2].id,
      carNumber: '33다3333',
      manufacturingYear: 2021,
      mileage: 30000,
      price: 30000000,
      explanation: '패밀리 SUV 쏘렌토, 넉넉한 공간.',
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

  // 6. Contract (계약) 3건 생성 (이전과 동일)
  const contractsData = [
    { customerIndex: 0, carIndex: 0, contractName: '아반떼-김계약 매매 계약', contractPrice: 16000000 },
    { customerIndex: 1, carIndex: 1, contractName: '쏘나타-이철수 매매 계약', contractPrice: 26000000 },
    { customerIndex: 2, carIndex: 2, contractName: '쏘렌토-박영희 매매 계약', contractPrice: 31000000 },
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
  console.log(`[6] 계약 3건 생성 완료 (ID: ${createdContracts.map((c) => c.id).join(', ')}`);

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
