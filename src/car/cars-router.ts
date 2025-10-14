// src/car/cars-router.ts
import { Router } from 'express';
import { CarRepository } from './cars-repository';
import { CarService } from './cars-service';
import { CarController } from './cars-controller';
import { authenticate } from './auth';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = Router();

const carRepository = new CarRepository();
const carService = new CarService(carRepository);
const carController = new CarController(carService);

router.get('/models', carController.getCarModels);

router.post('/upload', authenticate, upload.single('file'), carController.uploadCars);

router.get('/', authenticate, carController.getCars);

router.post('/', authenticate, carController.createCar);

router.get('/:carId', authenticate, carController.getCarById);

router.patch('/:carId', authenticate, carController.updateCar);

router.delete('/:carId', authenticate, carController.deleteCar);

export default router;