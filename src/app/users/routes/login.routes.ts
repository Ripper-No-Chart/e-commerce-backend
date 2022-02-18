import { Router } from 'express';
import UserMiddleware from '../middlewares/user.middlewares';
import PasswordMiddleware from '../middlewares/password.middlewares';
import HistoryMiddleware from '../../history/middlewares/history.middlewares';
import Token from '../../../auth/token/token';
const router: Router = Router();

router.post(
  '/',
  UserMiddleware.checkActive, // Check user is active
  PasswordMiddleware.passwordComplexity, // Check password complexity
  UserMiddleware.checkCredentials, // Check credentials and set request
  HistoryMiddleware.saveHistory('start session'), // Save history
  Token.generateToken // Generate token
);

export default router;
