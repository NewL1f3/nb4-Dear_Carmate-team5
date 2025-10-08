import { Router } from "express";
import { contractController } from "../controllers/contract-controller";

const router = Router();

router.post("/", contractController.create);
router.get("/", contractController.get);
router.put("/:id", contractController.update);
router.delete("/:id", contractController.delete);
router.get("/cars", contractController.getCarInfo);
router.get("/customers", contractController.getCustomerInfo);
router.get("/users", contractController.getUserInfo);

export default router;
