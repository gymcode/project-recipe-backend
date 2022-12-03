import { Request, Response, NextFunction } from "express"
import { wrapFailureResponse } from "../shared/response"
import { verifySignedJwtWebToken } from "../security/jwtSecurity"
import User from "../models/User"
import jwt, { Secret } from 'jsonwebtoken'
import Joi from "joi"


const SCRETE_KEY: Secret = String(process.env.ACCESS_TOKEN_SECRET)

export function userValidationMiddleware (schema: Joi.ObjectSchema<any>){
    return (req: Request, res: Response, next: NextFunction)=>{
        try {
            const {error} =  schema.validate(req.body)

            if (error == undefined) return next()
            wrapFailureResponse(res, 422,error.details[0].message, error)
        } catch (error) {
            console.error(error)
        }
    }
}

export function isUserAuthenticated(client: any){
    return async (req: Request, res: Response, next: NextFunction) =>{
        try {
            let payload;

            // getting from the headers 
            const authHeader = req.headers["authorization"]

            if (authHeader == undefined) return wrapFailureResponse(res, 400, "Authorization header not found", null)

            if (!authHeader.startsWith("Bearer")) return wrapFailureResponse(res, 400, "Authorization header must start with /Bearer /", null)

            const token = authHeader.substring(7)
            console.log(token)
            let accessToken = token
            const data = verifySignedJwtWebToken(token, SCRETE_KEY)

            payload = data.payload

            if (data.payload == null && !data.expired) return wrapFailureResponse(res, 400, "Un-authorized access", null)

            // check if the token is expired
            
            
            // res.locals.user_info = user_info

            return next()
        } catch (error) {
            console.error(error)
        }
    }
}
