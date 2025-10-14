// src/car/cars-controller.ts
import { Request, Response, NextFunction } from 'express';
import { CarStatusEnum } from '@prisma/client';
import { CarService } from './cars-service';
import { createCarSchema, updateCarSchema, csvUploadSchema } from './cars-dto';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { ZodError } from 'zod';

export class CarController {
    constructor(private carService: CarService) {}

    public createCar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = createCarSchema.parse(req.body);

            if (!req.user || !req.user.companyId) {
                return res.status(401).json({ message: '인증 정보가 유효하지 않습니다.' });
            }
            const companyId = req.user.companyId;

            const newCar = await this.carService.createCar(companyId, validatedData);
            res.status(201).json(newCar);
        } catch (error) {
            next(error);
        }
    };

    public getCars = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user || !req.user.companyId) {
                return res.status(401).json({ message: '인증 정보가 유효하지 않습니다.' });
            }
            const companyId = req.user.companyId;

            const page = req.query.page ? Number(req.query.page) : undefined;
            const pageSize = req.query.pageSize ? Number(req.query.pageSize) : undefined;
            const status = req.query.status as CarStatusEnum | undefined;
            const searchBy = req.query.searchBy as 'carNumber' | 'model' | undefined;
            const keyword = req.query.keyword as string | undefined;

            const cars = await this.carService.getCars({
                page,
                pageSize,
                status,
                searchBy,
                keyword,
                companyId,
            });
            res.status(200).json(cars);
        } catch (error) {
            next(error);
        }
    };

    public getCarById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const carId = Number(req.params.carId);
            if (isNaN(carId)) {
                return res.status(400).json({ message: '유효한 ID가 아닙니다.' });
            }
            const car = await this.carService.getCarById(carId);
            res.status(200).json(car);
        } catch (error) {
            next(error);
        }
    };

    public updateCar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const carId = Number(req.params.carId);
            if (isNaN(carId)) {
                return res.status(400).json({ message: '유효한 ID가 아닙니다.' });
            }
            const validatedData = updateCarSchema.parse(req.body);
            const updatedCar = await this.carService.updateCar(carId, validatedData);
            res.status(200).json(updatedCar);
        } catch (error) {
            next(error);
        }
    };

    public deleteCar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const carId = Number(req.params.carId);
            if (isNaN(carId)) {
                return res.status(400).json({ message: '유효한 ID가 아닙니다.' });
            }
            const result = await this.carService.deleteCar(carId);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    public getCarModels = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const models = await this.carService.getCarModels();
            res.status(200).json(models);
        } catch (error) {
            next(error);
        }
    };

    // ✅ 올바른 uploadCars 메서드 (제조사/모델명으로 modelId 찾기)
    public uploadCars = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
            }

            if (!req.user || !req.user.companyId) {
                fs.unlinkSync(req.file.path);
                return res.status(401).json({ message: '인증 정보가 유효하지 않습니다.' });
            }

            const fileContent = fs.readFileSync(req.file.path, 'utf-8');
            const records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
            });

            const validated = csvUploadSchema.parse({ records });

            const carsToCreate = await Promise.all(
                validated.records.map(async (record) => {
                    const model = await this.carService.findModelByManufacturerAndName(
                        record.manufacturer,
                        record.model
                    );

                    if (!model) {
                        throw new Error(
                            `제조사 "${record.manufacturer}", 모델 "${record.model}"을 찾을 수 없습니다.`
                        );
                    }

                    return {
                        modelId: model.id,
                        companyId: req.user!.companyId,
                        carNumber: record.carNumber,
                        manufacturingYear: record.manufacturingYear,
                        mileage: record.mileage,
                        price: record.price,
                        accidentCount: record.accidentCount,
                        explanation: record.explanation || null,
                        accidentDetails: record.accidentDetails || null,
                    };
                })
            );

            await this.carService.bulkCreateCars(carsToCreate);

            fs.unlinkSync(req.file.path);

            res.status(200).json({
                message: `${carsToCreate.length}개 차량 업로드 성공`,
                count: carsToCreate.length,
            });
        } catch (error) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            if (error instanceof ZodError) {
                const firstError = error.issues[0];
                return res.status(400).json({
                    message: `검증 실패: ${firstError.path.join('.')} - ${firstError.message}`,
                    errors: error.issues,
                });
            }

            next(error);
        }
    };
}