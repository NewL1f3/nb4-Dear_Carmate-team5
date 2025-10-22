import { PrismaClient, CarModelTypeEnum, GenderEnum, RegionEnum, AgeGroupEnum, CarStatusEnum, ContractStatusEnum } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const saltRounds = 10;

async function main() {
  console.log('🏁 Start seeding...');

  // 1. 회사 2개 생성
  const [codeItMotors, speedsterAuto] = await Promise.all([
    prisma.company.create({
      data: {
        companyName: '코드잇 모터스',
        companyCode: 'CODEIT001',
      },
    }),
    prisma.company.create({
      data: {
        companyName: '스피드스터 오토',
        companyCode: 'SPEED001',
      },
    }),
  ]);
  console.log(`✅ Created 2 companies`);

  // 2. 딜러(User) 생성
  const hashedPassword = await bcrypt.hash('password123', saltRounds);

  const [adminUser, staff1, staff2, speedsterAdmin, speedsterStaff] = await Promise.all([
    prisma.user.create({
      data: {
        companyId: codeItMotors.id,
        name: '김관리',
        email: 'admin@codeit.com',
        employeeNumber: 'EMP001',
        phoneNumber: '010-1234-5678',
        isAdmin: true,
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        companyId: codeItMotors.id,
        name: '이직원',
        email: 'staff1@codeit.com',
        employeeNumber: 'EMP002',
        phoneNumber: '010-2345-6789',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        companyId: codeItMotors.id,
        name: '박사원',
        email: 'staff2@codeit.com',
        employeeNumber: 'EMP003',
        phoneNumber: '010-3456-7890',
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        companyId: speedsterAuto.id,
        name: '최관리',
        email: 'admin@speedster.com',
        employeeNumber: 'EMP001',
        phoneNumber: '010-4567-8901',
        isAdmin: true,
        password: hashedPassword,
      },
    }),
    prisma.user.create({
      data: {
        companyId: speedsterAuto.id,
        name: '정직원',
        email: 'staff@speedster.com',
        employeeNumber: 'EMP002',
        phoneNumber: '010-5678-9012',
        password: hashedPassword,
      },
    }),
  ]);
  console.log('✅ Created 5 users');

  // 3. 🏎️ F1 드라이버 고객들 생성 (한글 이름)
  const [maxCustomer, lewisCustomer, landoCustomer, charlesCustomer, carlosCustomer, georgeCustomer, fernandoCustomer, oscarCustomer, yukiCustomer, pierreCustomer] = await Promise.all([
    prisma.customer.create({
      data: {
        companyId: codeItMotors.id,
        name: '맥스 페르스타펜',
        gender: GenderEnum.male,
        phoneNumber: '010-1111-1111',
        email: 'max@f1.com',
        ageGroup: AgeGroupEnum.twenty,
        region: RegionEnum.seoul,
      },
    }),
    prisma.customer.create({
      data: {
        companyId: codeItMotors.id,
        name: '루이스 해밀턴',
        gender: GenderEnum.male,
        phoneNumber: '010-2222-2222',
        email: 'lewis@f1.com',
        ageGroup: AgeGroupEnum.thirty,
        region: RegionEnum.gangwon,
      },
    }),
    prisma.customer.create({
      data: {
        companyId: speedsterAuto.id,
        name: '란도 노리스',
        gender: GenderEnum.male,
        phoneNumber: '010-3333-3333',
        email: 'lando@f1.com',
        ageGroup: AgeGroupEnum.twenty,
        region: RegionEnum.busan,
      },
    }),
    prisma.customer.create({
      data: {
        companyId: codeItMotors.id,
        name: '샤를 르클레르',
        gender: GenderEnum.male,
        phoneNumber: '010-4444-4444',
        email: 'charles@f1.com',
        ageGroup: AgeGroupEnum.twenty,
        region: RegionEnum.incheon,
      },
    }),
    prisma.customer.create({
      data: {
        companyId: speedsterAuto.id,
        name: '카를로스 사인츠',
        gender: GenderEnum.male,
        phoneNumber: '010-5555-5555',
        email: 'carlos@f1.com',
        ageGroup: AgeGroupEnum.thirty,
        region: RegionEnum.daegu,
      },
    }),
    prisma.customer.create({
      data: {
        companyId: codeItMotors.id,
        name: '조지 러셀',
        gender: GenderEnum.male,
        phoneNumber: '010-6666-6666',
        email: 'george@f1.com',
        ageGroup: AgeGroupEnum.twenty,
        region: RegionEnum.gyeonggi,
      },
    }),
    prisma.customer.create({
      data: {
        companyId: speedsterAuto.id,
        name: '페르난도 알론소',
        gender: GenderEnum.male,
        phoneNumber: '010-7777-7777',
        email: 'fernando@f1.com',
        ageGroup: AgeGroupEnum.forty,
        region: RegionEnum.jeju,
      },
    }),
    prisma.customer.create({
      data: {
        companyId: codeItMotors.id,
        name: '오스카 피아스트리',
        gender: GenderEnum.male,
        phoneNumber: '010-8888-8888',
        email: 'oscar@f1.com',
        ageGroup: AgeGroupEnum.twenty,
        region: RegionEnum.ulsan,
      },
    }),
    prisma.customer.create({
      data: {
        companyId: speedsterAuto.id,
        name: '유키 츠노다',
        gender: GenderEnum.male,
        phoneNumber: '010-9999-9999',
        email: 'yuki@f1.com',
        ageGroup: AgeGroupEnum.twenty,
        region: RegionEnum.gwangju,
      },
    }),
    prisma.customer.create({
      data: {
        companyId: codeItMotors.id,
        name: '피에르 가슬리',
        gender: GenderEnum.male,
        phoneNumber: '010-0000-0000',
        email: 'pierre@f1.com',
        ageGroup: AgeGroupEnum.twenty,
        region: RegionEnum.daejeon,
      },
    }),
  ]);
  console.log('🏎️ Created 10 F1 driver customers');

  // 4. 제조사 및 모델 생성
  const [hyundai, kia, bmw, benz, chevrolet] = await Promise.all([
    prisma.manufacturer.create({ data: { name: '현대' } }),
    prisma.manufacturer.create({ data: { name: '기아' } }),
    prisma.manufacturer.create({ data: { name: 'BMW' } }),
    prisma.manufacturer.create({ data: { name: '메르세데스-벤츠' } }),
    prisma.manufacturer.create({ data: { name: '쉐보레' } }),
  ]);
  console.log('✅ Created 5 manufacturers');

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
  console.log('✅ Created 8 car models');


  // 5. 차량 생성
  const models = await prisma.model.findMany({ include: { manufacturer: true } });

  const getModelId = (manufacturerName: string, modelName: string) => {
    const model = models.find((m) => m.manufacturer.name === manufacturerName && m.modelName === modelName);
    return model!.id;
  };

  await prisma.car.createMany({
    data: [
      // 코드잇 모터스 차량들
      { modelId: getModelId('현대', '아반떼'), companyId: codeItMotors.id, carNumber: '12가3456', manufacturingYear: 2018, mileage: 50000, price: 25000000, accidentCount: 0, explanation: '매우 깨끗한 상태', status: CarStatusEnum.possession },
      { modelId: getModelId('현대', '쏘나타'), companyId: codeItMotors.id, carNumber: '34나5678', manufacturingYear: 2020, mileage: 30000, price: 32000000, accidentCount: 1, explanation: '경미한 접촉사고 이력', status: CarStatusEnum.contractProceeding },
      { modelId: getModelId('현대', '그랜저'), companyId: codeItMotors.id, carNumber: '56다7890', manufacturingYear: 2021, mileage: 20000, price: 42000000, accidentCount: 0, explanation: '거의 새 차', status: CarStatusEnum.possession },
      { modelId: getModelId('기아', 'K5'), companyId: codeItMotors.id, carNumber: '78라1234', manufacturingYear: 2019, mileage: 45000, price: 28000000, accidentCount: 0, explanation: '정기 점검 완료', status: CarStatusEnum.possession },
      { modelId: getModelId('기아', '쏘렌토'), companyId: codeItMotors.id, carNumber: '90마5678', manufacturingYear: 2022, mileage: 15000, price: 45000000, accidentCount: 0, explanation: 'SUV 인기 모델', status: CarStatusEnum.possession },

      // 스피드스터 오토 차량들
      { modelId: getModelId('BMW', '3시리즈'), companyId: speedsterAuto.id, carNumber: '11바2222', manufacturingYear: 2020, mileage: 35000, price: 48000000, accidentCount: 0, explanation: '수입차 인기 모델', status: CarStatusEnum.possession },
      { modelId: getModelId('메르세데스-벤츠', 'E클래스'), companyId: speedsterAuto.id, carNumber: '33사4444', manufacturingYear: 2021, mileage: 25000, price: 65000000, accidentCount: 0, explanation: '프리미엄 세단', status: CarStatusEnum.contractProceeding },
      { modelId: getModelId('쉐보레', '스파크'), companyId: speedsterAuto.id, carNumber: '55아6666', manufacturingYear: 2017, mileage: 80000, price: 12000000, accidentCount: 2, explanation: '경차 실용적', status: CarStatusEnum.possession },
    ],
  });
  console.log('✅ Created 8 cars');

// 6. ✅ Contract 생성
  const createdCars = await prisma.car.findMany();

  const getCarId = (carNumber: string) => {
    const car = createdCars.find((c) => c.carNumber === carNumber);
    return car!.id;
  };

  await prisma.contract.createMany({
    data: [
      {
        userId: staff1.id,
        customerId: maxCustomer.id,
        carId: getCarId('78라1234'), // K5
        companyId: codeItMotors.id,
        status: ContractStatusEnum.carInspection,
        contractName: '맥스 페르스타펜 K5 계약',
      },
      {
        userId: adminUser.id,
        customerId: lewisCustomer.id,
        carId: getCarId('56다7890'), // 그랜저
        companyId: codeItMotors.id,
        status: ContractStatusEnum.priceNegotiation,
        contractName: '루이스 해밀턴 그랜저 계약',
      },
      {
        userId: speedsterStaff.id,
        customerId: landoCustomer.id,
        carId: getCarId('11바2222'), // BMW 3시리즈
        companyId: speedsterAuto.id,
        status: ContractStatusEnum.contractDraft,
        contractName: '란도 노리스 BMW 계약',
      },
      {
        userId: staff2.id,
        customerId: charlesCustomer.id,
        carId: getCarId('90마5678'), // 쏘렌토
        companyId: codeItMotors.id,
        status: ContractStatusEnum.contractSuccessful,
        contractName: '샤를 르클레르 쏘렌토 계약',
      },
    ],
  });
  console.log('✅ Created 4 contracts');
  console.log('🎉 Seeding finished!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
