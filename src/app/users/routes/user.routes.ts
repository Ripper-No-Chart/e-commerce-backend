import { Router } from 'express';
import UserControllers from '../controllers/user.controllers';
import Token from '../../../auth/token/token';
import UserMiddleware from '../middlewares/user.middlewares';
import PasswordMiddleware from '../middlewares/password.middlewares';
import CodeMiddleware from '../../codes/middlewares/code.middlewares';
import HistoryMiddleware from '../../history/middlewares/history.middlewares';
const router: Router = Router();

router.post(
  '/register_request',
  UserMiddleware.checkEmail, // Check user not exist
  CodeMiddleware.sendCode, // Send the request
  HistoryMiddleware.saveHistory('register request'), // Save history
  Token.generateToken // Generate token
);

router.post(
  '/register_user',
  Token.verifyToken, // Verify token and set email
  UserMiddleware.checkEmail, // Check user not exist
  CodeMiddleware.checkCode, // Validate there is not a previously code
  PasswordMiddleware.passwordComplexity, // Check password complexity
  HistoryMiddleware.saveHistory('register new user'), // Save history
  UserControllers.registerUser // Register new user
);

router.post(
  '/edit_user',
  Token.verifyToken, // Verify token and set id
  UserMiddleware.checkActive, // Check user is active
  HistoryMiddleware.saveHistory('edit user data'), // Save history
  UserControllers.editUser // Edit an existing user
);

router.post(
  '/get_data',
  Token.verifyToken, // Verify token
  UserMiddleware.checkActive, // Check user is active
  UserControllers.getUser // Get user data
);

export default router;
