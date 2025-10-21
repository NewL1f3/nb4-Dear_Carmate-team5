import express from 'express'

const userRouter = express.Router();
import userController from './user-controller';
import authenticateToken from '../../middleware/auth-middleware';


userRouter.post('/', userController.register)
userRouter.get('/me', authenticateToken, userController.getMyInfo)
userRouter.patch('/me', authenticateToken, userController.patchMyInfo)
// userRouter.delete('/me', authenticateToken, userController.deleteMyInfo)
// userRouter.delete('/:userId',authenticateToken, userController.deleteUser)


export default userRouter;

