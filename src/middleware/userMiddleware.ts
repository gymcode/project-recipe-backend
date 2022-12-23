import { Request, Response, NextFunction } from "express";
import { wrapFailureResponse } from "../shared/response";
import { verifySignedJwtWebToken } from "../security/jwtSecurity";
import { Secret } from "jsonwebtoken";
import User from "../models/User"
import Joi from "joi";

const SCRETE_KEY: Secret = String(process.env.ACCESS_TOKEN_SECRET);

export function userValidationMiddleware(schema: Joi.ObjectSchema<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req.body);
      if (error != undefined)
        return wrapFailureResponse({
          res: res,
          statusCode: 422,
          errorMsg: error.details[0].message,
          detailedError: error,
        });
      return next();
    } catch (error: any) {
      console.error(error);
      return wrapFailureResponse({
        res: res,
        errorMsg: `An Error occured:${error.message}`,
        statusCode: 500,
        detailedError: error,
      });
    }
  };
}

export function isUserAuthenticated() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // getting from the headers
      const authHeader = req.headers["authorization"];

      if (authHeader == undefined)
        throw new Error("Authorization header not found");

      if (!authHeader.startsWith("Bearer"))
        throw new Error("Authorization header must start with /Bearer /");

      const token = authHeader.split(" ")[1];

      const data = verifySignedJwtWebToken(token, SCRETE_KEY);
      console.log(`here we have the data being logged out and in and there ---- ${data.payload}`)

      if (data.payload == null) throw new Error("Un-authorized access")

      // use the id from the payload to get the user details
      const user = await User.findOne({ _id: data.payload._id }).exec()
      const user_info = {user: user, token: token}
      res.locals.user_info = user_info        

      return next();
    } catch (error: any) {
      console.error(error);
      return wrapFailureResponse({
        res: res,
        errorMsg: `An Error occured:${error.message}`,
        statusCode: 500,
        detailedError: error,
      });
    }
  };
}
