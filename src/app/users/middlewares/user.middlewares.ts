import { NextFunction, Request, Response } from 'express';
import HttpHandler from '../../../helpers/handler.helper';
import UserModel from '../models/user.models';
import bcrypt from 'bcrypt';
import { BAD_REQUEST, FORBIDDEN, INTERNAL_ERROR } from '../../../constants/codes.constanst';

class UsersMiddleware {
  /**
   * Verify User
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public async checkCredentials(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { password } = req; // Extract password from request
      const { email } = req.body; // Extract email from body
      // Find if user exist and if allow login is true
      const user = await UserModel.findOne({
        $and: [{ 'primary_data.email': email }, { 'permissions.active': true }],
      });
      if (!user) {
        return HttpHandler.response(res, FORBIDDEN, {
          message: 'Forbidden',
          data: { error: 'User not exist or not authorized' },
        });
      }
      const hashedPassword = user?.auth_data.password; // Set hashed password
      // Compare password with hashed stored password
      const decryptPassword = bcrypt.compareSync(password!, hashedPassword!);
      // If credentials are invalid
      if (!decryptPassword || !user) {
        return HttpHandler.response(res, BAD_REQUEST, {
          message: 'Bad request error',
          data: { error: 'Bad credentials' },
        });
      }
      delete req.password; // Delete req.password
      req._id = user._id; // Set _id
      req.email = email; // Set email
      next();
    } catch (e) {
      return HttpHandler.response(res, INTERNAL_ERROR, {
        message: 'Internal Error',
        data: { error: (e as Error).message },
      });
    }
  }

  /**
   * Check if user not exist before next
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public async checkActive(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email } = req.body.email ? req.body : req; // Extract email from body or token;
      const userExist = await UserModel.findOne({
        $and: [{ 'primary_data.email': email }, { 'permissions.active': true }],
      }); // Check if user exist
      if (!userExist) {
        return HttpHandler.response(res, FORBIDDEN, {
          message: 'Forbidden',
          data: { error: 'User registered or not allowed' },
        });
      }
      next();
    } catch (e) {
      return HttpHandler.response(res, INTERNAL_ERROR, {
        message: 'Internal Error',
        data: { error: (e as Error).message },
      });
    }
  }

  /**
   * Check user data before request new code or register new user
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public async checkEmail(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email } = req.body.email ? req.body : req; // Extract email from body or token;
      const userExist = await UserModel.findOne({ 'primary_data.email': email }); // Check if user exist
      if (userExist) {
        return HttpHandler.response(res, BAD_REQUEST, {
          message: 'Bad request error',
          data: { error: 'User registered previously' },
        });
      }
      req.email = email;
      next();
    } catch (e) {
      return HttpHandler.response(res, INTERNAL_ERROR, {
        message: 'Internal Error',
        data: { error: (e as Error).message },
      });
    }
  }
}

export default new UsersMiddleware();
