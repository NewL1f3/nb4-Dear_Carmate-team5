// src/modules/cars/cars-router.ts
import { Router } from 'express';
import { CarRepository } from './cars-repository';
import { CarService } from './cars-service';
import { CarController } from './cars-controller';
import { mockAuthMiddleware } from '../../middlewares/mock-auth-middleware';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = Router();

const carRepository = new CarRepository();
const carService = new CarService(carRepository);
const carController = new CarController(carService);

router.get('/models', carController.getCarModels);

router.post('/upload', mockAuthMiddleware, upload.single('file'), carController.uploadCars);

router.get('/', mockAuthMiddleware, carController.getCars);

router.post('/', mockAuthMiddleware, carController.createCar);

router.get('/:carId', mockAuthMiddleware, carController.getCarById);

router.patch('/:carId', mockAuthMiddleware, carController.updateCar);

router.delete('/:carId', mockAuthMiddleware, carController.deleteCar);

export default router;
