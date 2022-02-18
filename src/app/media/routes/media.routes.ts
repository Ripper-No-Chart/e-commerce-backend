import { Router } from 'express';
import Token from '../../../auth/token/token';
import HistoryMiddleware from '../../history/middlewares/history.middlewares';
import UserMiddleware from '../../users/middlewares/user.middlewares';
import MediaController from '../controllers/media.controllers';
import multer from 'multer';

const router: Router = Router();

const MulterMiddleware = {
  picture: multer({ limits: { fileSize: 8 * 1024 * 1024 } }).single('data'),
  video: multer({ limits: { fileSize: 16 * 1024 * 1024 } }).single('data'),
};

router.post(
  '/upload/profile_picture',
  Token.verifyToken,
  UserMiddleware.checkActive,
  MulterMiddleware.picture,
  HistoryMiddleware.saveHistory('upload picture'),
  MediaController.uploadProfilePicture
); // Upload picture

router.post(
  '/upload/profile_trailer',
  Token.verifyToken,
  UserMiddleware.checkActive,
  MulterMiddleware.video,
  HistoryMiddleware.saveHistory('upload trailer'),
  MediaController.uploadProfileTrailer
); // Upload trailer

router.post('/get/profile_picture', Token.verifyToken, UserMiddleware.checkActive, MediaController.getProfilePicture); // Get profile picture and thumbnail
router.post('/get/profile_trailer', Token.verifyToken, UserMiddleware.checkActive, MediaController.getProfileTrailer); // Get profile trailer

export default router;
