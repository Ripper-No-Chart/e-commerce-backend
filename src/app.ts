import express from 'express';
import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';

// Routes
import userRoutes from './app/users/routes/user.routes';
import codesRoutes from './app/codes/routes/code.routes';
import loginRoutes from './app/users/routes/login.routes';
import passwordRoutes from './app/users/routes/password.routes';
import categoriesRoutes from './app/categories/routes/categorie.routes';
import productRoutes from './app/products/routes/product.routes';
import mediaRoutes from './app/media/routes/media.routes';

// Database
import './database/database';

// Settings
const app = express();
app.use(morgan('dev'));
app.set('port', process.env.PORT || 3001);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Routes usage
app.use('/api/code', codesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/categorie', categoriesRoutes);
app.use('/api/product', productRoutes);
app.use('/api/media', mediaRoutes);

export default app;
