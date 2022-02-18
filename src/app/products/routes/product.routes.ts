import { Router } from 'express';
import Token from '../../../auth/token/token';
import HistoryMiddleware from '../../history/middlewares/history.middlewares';
import UserMiddleware from '../../users/middlewares/user.middlewares';
import ProductController from '../controllers/product.controllers';

const router: Router = Router();

router.post(
  '/add',
  Token.verifyToken,
  UserMiddleware.checkActive,
  HistoryMiddleware.saveHistory('add a new product'),
  ProductController.addProduct
); // Add a single product

router.post(
  '/delete',
  Token.verifyToken,
  UserMiddleware.checkActive,
  HistoryMiddleware.saveHistory('delete a product'),
  ProductController.deleteProduct
); // Delete a single product

router.post(
  '/edit',
  Token.verifyToken,
  UserMiddleware.checkActive,
  HistoryMiddleware.saveHistory('edit a product'),
  ProductController.editProduct
); // Edit a single product

router.post('/get_details', Token.verifyToken, UserMiddleware.checkActive, ProductController.getDetails); // Get details of a single product
router.post('/get_all', Token.verifyToken, UserMiddleware.checkActive, ProductController.getAll); // Get all product
router.post('/change_access', Token.verifyToken, UserMiddleware.checkActive, ProductController.changeAccess); // Change product access
router.post('/search', Token.verifyToken, UserMiddleware.checkActive, ProductController.search); // Search products
router.post('/associate', Token.verifyToken, UserMiddleware.checkActive, ProductController.associate); // Associate to a product

export default router;
