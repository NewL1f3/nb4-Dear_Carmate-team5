// src/car/cars-service.ts
import { CarRepository } from './cars-repository';
import { CarStatusEnum, Prisma } from '@prisma/client';
import { CreateCarDto, UpdateCarDto } from './cars-dto';

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
        return this.carRepository.findMany(params);
    };

    public getCarById = async (id: number) => {
        const car = await this.carRepository.findById(id);
        if (!car) {
            throw new Error(`차량 ID ${id}를 찾을 수 없습니다.`);
        }
        return car;
    };

    public createCar = async (companyId: number, createCarDto: CreateCarDto) => {
        const carData = {
            ...createCarDto,
            companyId: companyId,
        };
        return this.carRepository.create(carData);
    };

    public updateCar = async (id: number, updateCarDto: UpdateCarDto) => {
        await this.getCarById(id);

        const { modelId, ...restOfData } = updateCarDto;
        const updateData: Prisma.CarUpdateInput = { ...restOfData };

        if (modelId) {
            updateData.model = { connect: { id: modelId } };
        }

        return this.carRepository.update(id, updateData);
    };

    public deleteCar = async (id: number) => {
        await this.getCarById(id);
        await this.carRepository.delete(id);
        return { message: '차량 삭제 성공' };
    };

    public getCarModels = async () => {
        const modelsFromDb = await this.carRepository.findAllModels();

        const groupedByManufacturer = modelsFromDb.reduce((acc, model) => {
            const { manufacturer, modelName } = model;
            if (!acc[manufacturer.name]) {
                acc[manufacturer.name] = [];
            }
            acc[manufacturer.name].push(modelName);
            return acc;
        }, {} as Record<string, string[]>);

        const result = Object.keys(groupedByManufacturer).map((manufacturerName) => ({
            manufacturer: manufacturerName,
            model: groupedByManufacturer[manufacturerName],
        }));

        return { data: result };
    };

    public bulkCreateCars = async (
        carsData: Array<{
            modelId: number;
            companyId: number;
            carNumber: string;
            manufacturingYear: number;
            mileage: number;
            price: number;
            accidentCount?: number;
            explanation?: string | null;
            accidentDetails?: string | null;
        }>
    ) => {
        return this.carRepository.bulkCreate(carsData);
    };

    public findModelByManufacturerAndName = async (manufacturerName: string, modelName: string) => {
        return this.carRepository.findModelByManufacturerAndName(manufacturerName, modelName);
    };
}