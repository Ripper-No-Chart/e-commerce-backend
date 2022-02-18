import { Request, Response } from 'express';
import HttpHandler from '../../../helpers/handler.helper';
import { CREATED, SUCCESS, INTERNAL_ERROR } from '../../../constants/codes.constanst';
import ProductModel from '../models/product.models';
import SearchModel, { SearchInterface } from '../../search/models/search.model';
import randomLink from '../../../tools/random.tools';
import searchTool from '../../../tools/search.tools';
import mongoose from 'mongoose';
import moment from 'moment';

class ProductController {
  /**
   * Add a new product
   * @param req
   * @param res
   * @returns
   */
  public async addProduct(req: Request, res: Response): Promise<Response> {
    try {
      const { categorie, product_info, product_status, tags } = req.body;
      const { _id } = req; // Extract _id from token
      const link = randomLink.generateLink(); // Generate a randon link
      const product = new ProductModel({
        user: _id, // Insert into user field _id extracted from token
        categorie,
        product_info,
        product_status,
        product_access: {
          link,
          access: true,
        },
        tags,
      });
      await product.save();
      return HttpHandler.response(res, CREATED, {
        message: 'Product saved successfully',
        data: { _id: product._id },
      });
    } catch (e) {
      return HttpHandler.response(res, INTERNAL_ERROR, {
        message: 'Internal Error',
        data: { error: (e as Error).message },
      });
    }
  }

  /**
   * Delete a product
   * @param req
   * @param res
   * @returns
   */
  public async deleteProduct(req: Request, res: Response): Promise<Response> {
    try {
      const { _id } = req.body; // Extract _id of product from body
      const product = await ProductModel.findByIdAndDelete(_id);
      return HttpHandler.response(res, SUCCESS, {
        message: 'Product deleted successfully',
        data: { _id: product?._id },
      });
    } catch (e) {
      return HttpHandler.response(res, INTERNAL_ERROR, {
        message: 'Internal Error',
        data: { error: (e as Error).message },
      });
    }
  }

  /**
   * Get all products
   * @param req
   * @param res
   * @returns
   */
  public async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const { _id } = req; // Extract _id from token
      // Get all products from user
      const products = await ProductModel.aggregate([
        {
          $match: {
            user: mongoose.Types.ObjectId(_id),
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'categorie',
            foreignField: '_id',
            as: 'categorie',
          },
        },
        {
          $unwind: {
            path: '$categorie',
            includeArrayIndex: 'categorie._id',
          },
        },
        {
          $project: {
            categorie: '$categorie.categorie',
            product_info: 1,
            product_access: 1,
          },
        },
      ]);
      return HttpHandler.response(res, SUCCESS, {
        message: 'Response successfully',
        data: { products },
      });
    } catch (e) {
      return HttpHandler.response(res, INTERNAL_ERROR, {
        message: 'Internal Error',
        data: { error: (e as Error).message },
      });
    }
  }

  /**
   * Get details of a single product from _id
   * @param req
   * @param res
   * @returns
   */
  public async getDetails(req: Request, res: Response): Promise<Response> {
    try {
      const { _id } = req.body; // Extract _id of product from body
      // Get a product detail
      const product = await ProductModel.aggregate([
        {
          $match: {
            _id: mongoose.Types.ObjectId(_id),
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'categorie',
            foreignField: '_id',
            as: 'categorie',
          },
        },
        {
          $unwind: {
            path: '$categorie',
            includeArrayIndex: 'categorie._id',
          },
        },
        {
          $project: {
            categorie: '$categorie.categorie',
            product_info: 1,
            product_access: 1,
            product_status: 1,
            tags: 1,
          },
        },
      ]);
      return HttpHandler.response(res, SUCCESS, {
        message: 'Response successfully',
        data: { _id: product[0] },
      });
    } catch (e) {
      return HttpHandler.response(res, INTERNAL_ERROR, {
        message: 'Internal Error',
        data: { error: (e as Error).message },
      });
    }
  }

  /**
   * Edit a sigle product
   * @param req
   * @param res
   * @returns
   */
  public async editProduct(req: Request, res: Response): Promise<Response> {
    try {
      delete req.body.product_access; // Remove product access
      const product = await ProductModel.findByIdAndUpdate(req.body._id, { $set: req.body }, { upsert: false }); // Find by id and update
      return HttpHandler.response(res, SUCCESS, {
        message: 'Product edited successfully',
        data: { _id: product?._id },
      });
    } catch (e) {
      return HttpHandler.response(res, INTERNAL_ERROR, {
        message: 'Internal Error',
        data: { error: (e as Error).message },
      });
    }
  }

  /**
   * Change product access
   * @param req
   * @param res
   * @returns
   */
  public async changeAccess(req: Request, res: Response): Promise<Response> {
    try {
      const { access } = req.body.product_access;
      const product = await ProductModel.findByIdAndUpdate(req.body._id, { $set: { 'product_access.access': access } }); // Find by id and update product access
      return HttpHandler.response(res, SUCCESS, {
        message: 'Product access edited successfully',
        data: { _id: product?._id },
      });
    } catch (e) {
      return HttpHandler.response(res, INTERNAL_ERROR, {
        message: 'Internal Error',
        data: { error: (e as Error).message },
      });
    }
  }

  /**
   * Search product function
   * @param req
   * @param res
   * @returns
   */
  public async search(req: Request, res: Response): Promise<Response> {
    try {
      const raw_search = req.body.search;
      // Parse search and remove black list items
      const search = searchTool.parseSearch(raw_search);
      // Save search and raw search
      const registerSearch: SearchInterface = new SearchModel({ search, raw_search });
      await registerSearch.save();
      // Product aggregation
      const products = await ProductModel.aggregate([
        {
          $match: {
            'product_access.access': true,
            tags: {
              $all: search,
            },
          },
        },
        {
          $lookup: {
            from: 'categories',
            localField: 'categorie',
            foreignField: '_id',
            as: 'categorie',
          },
        },
        {
          $unwind: {
            path: '$categorie',
            includeArrayIndex: 'categorie._id',
          },
        },
        {
          $project: {
            categorie: '$categorie.categorie',
            product_info: 1,
            product_access: 1,
          },
        },
      ]);

      return HttpHandler.response(res, SUCCESS, {
        message: 'Response successfully',
        data: { products },
      });
    } catch (e) {
      return HttpHandler.response(res, INTERNAL_ERROR, {
        message: 'Internal Error',
        data: { error: (e as Error).message },
      });
    }
  }
  /**
   * Associate product to seller
   * @param req
   * @param res
   * @returns
   */
  public async associate(req: Request, res: Response): Promise<Response> {
    try {
      const { _id } = req;
      const { product_id } = req.body;
      const product = await ProductModel.updateOne(
        { _id: mongoose.Types.ObjectId(product_id) },
        { $addToSet: { associate: { _id: mongoose.Types.ObjectId(_id), createdAt: moment() } } }
      );
      return HttpHandler.response(res, SUCCESS, { message: 'Association successfully', data: { product } });
    } catch (e) {
      return HttpHandler.response(res, INTERNAL_ERROR, {
        message: 'Internal Error',
        data: { error: (e as Error).message },
      });
    }
  }
}

export default new ProductController();
