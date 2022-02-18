import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { load } from 'ts-dotenv';
import HttpHandler from '../../helpers/handler.helper';
import { CREATED, UNAUTHORIZED, FORBIDDEN, INTERNAL_ERROR } from '../../constants/codes.constanst';

const env = load({
  JWT_KEY: String,
});

class Token {
  /**
   * Generate token
   * @param req
   * @param res
   */
  static generateToken = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { expiresIn } = req;
      const { _id, email } = req;
      const token = jwt.sign({ email: email!, _id: _id! }, env.JWT_KEY, { expiresIn: expiresIn || '60d' }); // Generate token
      return HttpHandler.response(res, CREATED, { message: 'Token created successfully', data: { token, expiresIn } });
    } catch (e) {
      return HttpHandler.response(res, INTERNAL_ERROR, {
        message: 'Internal Error',
        data: { error: (e as Error).message },
      });
    }
  };

  /**
   * Verify token and next()
   * @param req
   * @param res
   * @param next
   * @returns
   */
  static async verifyToken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const bearerHeader = req.headers['authorization'];
      if (bearerHeader === undefined) {
        return HttpHandler.response(res, FORBIDDEN, { message: 'Forbidden', data: 'Access forbidden' }); // If token is incorrect return Forbidden;
      }
      const bearerToken = bearerHeader.split(' ')[1]; // Return header authorization
      jwt.verify(bearerToken, env.JWT_KEY, async (err, authData) => {
        if (err) {
          return HttpHandler.response(res, UNAUTHORIZED, {
            message: 'Unauthorized',
            data: 'Wrong token or token expired',
          }); // If token is incorrect return Forbidden;
        } else {
          const map = new Map(Object.entries(authData!)); // Extract email and _id from authData
          req.email = map.get('email')!; // Set email
          req._id = map.get('_id')!; // Set _id
          next(); // If token is verified
        }
      });
    } catch (e) {
      return HttpHandler.response(res, INTERNAL_ERROR, {
        message: 'Internal Error',
        data: { error: (e as Error).message },
      });
    }
  }
}

export default Token;
