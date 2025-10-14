
const userRouter = express.Router();
import userController from './user-controller';
import authenticateToken from '../../middleware/auth-middleware';


userRouter.post('/', userController.register)
userRouter.get('/me', authenticateToken, userController.getMyInfo)
userRouter.patch('/me', userController.patchMyInfo)
userRouter.delete('/me', userController.deleteMyInfo)
userRouter.delete('/:userId', userController.deleteUser)


export default userRouter;

