// src/modules/cars/cars-service.ts
import { CarStatusEnum } from '@prisma/client';
import { CarRepository } from './cars-repository';
import { CreateCarDto, UpdateCarDto } from './cars-dto';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class CarService {
  constructor(private carRepository: CarRepository) {}

  public getCars = async (params: {
    page?: number;
    pageSize?: number;
    status?: CarStatusEnum;
    searchBy?: 'carNumber' | 'model';
    keyword?: string;
    companyId: number;
  }) => {
    return await this.carRepository.findMany(params);
  };

  public getCarById = async (id: number) => {
    const car = await this.carRepository.findById(id);
    if (!car) {
      throw new Error('차량을 찾을 수 없습니다.');
    }
    return car;
  };

  public createCar = async (companyId: number, carData: CreateCarDto) => {
    const existingCar = await this.carRepository.findByCarNumber(companyId, carData.carNumber);

    if (existingCar) {
      throw new Error(`차량 번호 ${carData.carNumber}는 이미 등록되어 있습니다.`);
    }

    let modelId = carData.modelId;

    if (!modelId && carData.manufacturer && carData.model) {
      const foundModel = await this.carRepository.findModelByManufacturerAndName(carData.manufacturer, carData.model);

      if (!foundModel) {
        throw new Error(`제조사 "${carData.manufacturer}", 모델 "${carData.model}"을 찾을 수 없습니다.`);
      }

      modelId = foundModel.id;
    }

    if (!modelId) {
      throw new Error('modelId 또는 manufacturer/model 정보가 필요합니다.');
    }

    return this.carRepository.create({
      model: { connect: { id: modelId } },
      company: { connect: { id: companyId } },
      carNumber: carData.carNumber,
      manufacturingYear: carData.manufacturingYear,
      mileage: carData.mileage,
      price: carData.price,
      accidentCount: carData.accidentCount ?? 0,
      explanation: carData.explanation,
      accidentDetails: carData.accidentDetails,
    });
  };

  public updateCar = async (id: number, companyId: number, carData: UpdateCarDto) => {
    const existingCar = await this.carRepository.findById(id);

    if (!existingCar) {
      throw new Error('차량을 찾을 수 없습니다.');
    }

    if (existingCar.companyId !== companyId) {
      throw new Error('해당 차량에 대한 권한이 없습니다.');
    }

    const { manufacturer, model, ...updateData } = carData;

    if (!updateData.modelId && manufacturer && model) {
      const foundModel = await this.carRepository.findModelByManufacturerAndName(manufacturer, model);

      if (!foundModel) {
        throw new Error(`제조사 "${manufacturer}", 모델 "${model}"을 찾을 수 없습니다.`);
      }

      updateData.modelId = foundModel.id;
    }

    return await this.carRepository.update(id, updateData);
  };

  public deleteCar = async (id: number, companyId: number) => {
    const existingCar = await this.carRepository.findById(id);

    if (!existingCar) {
      throw new Error('차량을 찾을 수 없습니다.');
    }

    if (existingCar.companyId !== companyId) {
      throw new Error('해당 차량에 대한 권한이 없습니다.');
    }

    await this.carRepository.delete(id);
    return { message: '차량이 삭제되었습니다.' };
  };

  public getCarModels = async () => {
    const modelsFromDb = await this.carRepository.findAllModels();
    const groupedByManufacturer = modelsFromDb.reduce(
      (acc, model) => {
        const manufacturerName = model.manufacturer.name;
        if (!acc[manufacturerName]) {
          acc[manufacturerName] = [];
        }
        acc[manufacturerName].push(model.modelName);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    return {
      data: Object.entries(groupedByManufacturer).map(([manufacturer, models]) => ({
        manufacturer,
        model: models,
      })),
    };
  };

  public findModelByManufacturerAndName = async (manufacturerName: string, modelName: string) => {
    return this.carRepository.findModelByManufacturerAndName(manufacturerName, modelName);
  };

  public bulkUploadCarsWithTransaction = async (
    companyId: number,
    records: Array<{
      manufacturer: string;
      model: string;
      carNumber: string;
      manufacturingYear: number;
      mileage: number;
      price: number;
      accidentCount: number;
      explanation?: string;
      accidentDetails?: string;
    }>,
  ) => {
    return await prisma.$transaction(async (tx) => {
      const carsToCreate = [];

      for (const record of records) {
        const model = await this.carRepository.findModelByManufacturerAndName(record.manufacturer, record.model, tx);

        if (!model) {
          throw new Error(`제조사 "${record.manufacturer}", 모델 "${record.model}"을 찾을 수 없습니다.`);
        }

        carsToCreate.push({
          modelId: model.id,
          companyId,
          carNumber: record.carNumber,
          manufacturingYear: record.manufacturingYear,
          mileage: record.mileage,
          price: record.price,
          accidentCount: record.accidentCount,
          explanation: record.explanation || null,
          accidentDetails: record.accidentDetails || null,
        });
      }

      return await this.carRepository.bulkCreate(carsToCreate, tx);
    });
  };
}
