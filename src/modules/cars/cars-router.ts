// src/modules/cars/cars-router.ts
import { Router } from 'express';
import { CarRepository } from './cars-repository';
import { CarService } from './cars-service';
import { CarController } from './cars-controller';
import authenticateToken from '../../middleware/auth-middleware';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });
const router = Router();

const carRepository = new CarRepository();
const carService = new CarService(carRepository);
const carController = new CarController(carService);

router.get('/models', carController.getCarModels);

router.post('/upload', authenticateToken, upload.single('file'), carController.uploadCars);

router.get('/', authenticateToken, carController.getCars);

router.post('/', authenticateToken, carController.createCar);

router.get('/:carId', authenticateToken, carController.getCarById);

router.patch('/:carId', authenticateToken, carController.updateCar);

router.delete('/:carId', authenticateToken, carController.deleteCar);

export default router;
