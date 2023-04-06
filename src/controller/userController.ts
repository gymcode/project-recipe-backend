import { Request, Response } from "express";
import { RegisterDTO, ConfirmOTPDTO, ResendDTO } from "../dto/request/user.dto";
import { CountryMsisdnValidation } from "../utils/msisdnValidation";
import { wrapFailureResponse, wrapSuccessResponse } from "../shared/response";
import GenerateOTP from "../utils/generateOtp";
import client from "../config/redis";
import bcrypt from "bcryptjs";
import { NaloSendSms } from "../config/sms";
import {
    REQUEST_NOT_PERFORMED,
    USER_EXISTS,
    USER_NOT_FOUND,
    SMS_OTP_MESSAGE,
    ACCOUNT_DOESNOT_EXIST,
    EXPIRED_OTP,
    WRONG_OTP
} from "../shared/constants";

// user model
import User from "../models/User";
import generateOtp from "../utils/generateOtp";
import _ from "lodash";
import { signAccessJwtToken, signRefreshJwtToken, verifySignedJwtWebToken } from "../security/jwtSecurity";
import { GenerateAndStoreCode } from "../utils/generateAndHashCode";
import { CodeHash } from "../security/passwordSecurity";

import { Logger } from "../logger";
import { Secret } from "jsonwebtoken";
const logger = new Logger()

const SCRETE_KEY: Secret = String(process.env.REFRESH_TOKEN_SECRET);

// access and fresh token stuff
// generate both access and refresh token when the user logs in 
// when the access token expires, use the refresh token to generate a new access token and expire the refresh token 

/*
register a new user 
*/
export function userRegistration() {
    return async (req: Request, res: Response) => {
        try {
            // validating the msisdn based on the country code
            const request: RegisterDTO = req.body;
            const response = CountryMsisdnValidation(
                request.msisdn,
                request.countryCode
            );

            const { error, msg } = response!;

            if (error) throw new Error(msg);
            const msisdn = msg;

            // checking in the database if the user already exists
            let user = await User.findOne({ msisdn: msisdn }).exec();
            if (user != null) {
                if (!user.isOtpConfirmed) 
                    return wrapFailureResponse({
                        res: res,
                        systemCode: "U02",
                        errorMsg: USER_EXISTS,
                        statusCode: 500,
                        detailedError: error,
                    });

                throw new Error(USER_EXISTS);
            }

            // add user
            const userInput = new User({
                firstName: request.firstName,
                otherNames: request.otherNames,
                msisdn: msisdn,
                countryCode: request.countryCode,
                isoCode: request.isoCode,
                password: CodeHash(request.password)
            });
            user = await userInput.save();
            if (user == null) throw new Error(REQUEST_NOT_PERFORMED);

            // check is the request requires an email verification 

            // generate code  hash code
            const code = GenerateOTP();
            logger.info(code);
            await GenerateAndStoreCode(`${code}`, user)

            // TODO(send SMS to user with the otp)
            NaloSendSms(`+${msisdn}`, SMS_OTP_MESSAGE.replace("#otp", `${code}`));
            wrapSuccessResponse({
                res: res,
                statusCode: 200,
                data: user
            });

        } catch (error: any) {
            logger.error(error);
            return wrapFailureResponse({
                res: res,
                errorMsg: error.message,
                statusCode: 500,
                detailedError: error,
            });
        }
    };
}


// email verification

/*
it should confirm otp
*/
export function confirmOTP() {
    return async (req: Request, res: Response) => {
        try {
            // getting the request body
            const request: ConfirmOTPDTO = req.body;
            const response = CountryMsisdnValidation(
                request.msisdn,
                request.countryCode
            );
            const { error, msg } = response!;

            if (error) throw new Error(msg)
            const msisdn = msg;

            // getting the user details based on the msisdn
            const user = await User.findOne({ msisdn: msisdn }).exec();
            if (user == null) throw new Error(ACCOUNT_DOESNOT_EXIST)

            // get the otp from the cached data
            const storageKey = `${user._id}_OTP`;
            const value = await client.get(storageKey);
            const data = JSON.parse(value!);
            logger.info(value)
            // checking for the expire by comparison
            const currentDateTime = new Date();
            if (currentDateTime > new Date(data.expire_at))
                throw new Error(EXPIRED_OTP)

            // comparing the hashed OTP and the code
            const otpCodeComparison = bcrypt.compareSync(request.code, data.code);
            if (!otpCodeComparison) throw new Error(WRONG_OTP)

            // deleting the cached data
            client.del(storageKey);

            // update otp confirm status for the user
            const resp = await User.findOneAndUpdate(
                { _id: user._id },
                { isOtpConfirmed: true, update_at: new Date() },
                {
                    new: true,
                    upsert: true,
                    rawResult: true, // Return the raw result from the MongoDB driver
                }
            );

            if (resp == null) throw new Error(REQUEST_NOT_PERFORMED)

            wrapSuccessResponse({
                res: res,
                statusCode: 200,
                data: resp.value
            });

        } catch (error: any) {
            logger.error(error);
            return wrapFailureResponse({
                res: res,
                errorMsg: error.message,
                statusCode: 500,
                detailedError: error,
            });
        }
    };
}

/*
it should resend otp
*/
export function resendOTP() {
    return async (req: Request, res: Response) => {
        try {
            const request: ResendDTO = req.body;
            const response = CountryMsisdnValidation(
                request.msisdn,
                request.countryCode
            );
            const { error, msg } = response!;

            if (error) throw new Error(msg)
            const msisdn = msg;

            // getting the user details based on the msisdn
            const user = await User.findOne({ msisdn: msisdn }).exec();
            if (user == null) throw new Error(ACCOUNT_DOESNOT_EXIST)

            // generating the otp
            const code = generateOtp();
            logger.info(code);
            await GenerateAndStoreCode(`${code}`, user)


            // TODO(send SMS to user with the otp)
            NaloSendSms(`+${msisdn}`, SMS_OTP_MESSAGE.replace("#otp", `${code}`));

            wrapSuccessResponse({
                res: res,
                statusCode: 200,
                data: user,
            });
        } catch (error: any) {
            logger.error(error);
            return wrapFailureResponse({
                res: res,
                errorMsg: error.message,
                statusCode: 500,
                detailedError: error,
            });
        }
    };
}

/*
it should reset otp
*/
export function resetPassword() {
    return async (req: Request, res: Response) => {
        try {
            // validating the msisdn based on the country code
            const request = req.body;
            logger.info(request);

            const response = CountryMsisdnValidation(
                request.msisdn,
                request.countryCode
            );
            const { error, msg } = response!;

            if (error) throw new Error(msg)
            const msisdn = msg;

            // checking in the database if the user already exists
            let user = await User.findOne({ msisdn: msisdn }).exec();
            if (user == null) throw new Error(ACCOUNT_DOESNOT_EXIST)

            // generate code  hash code
            const code = GenerateOTP();
            logger.info(code);
            await GenerateAndStoreCode(`${code}`, user)

            // update user details
            const resp = await User.findOneAndUpdate(
                { _id: user._id },
                {
                    isPinSet: false,
                    activated: false,
                    isOtpConfirmed: false,
                    update_at: new Date(),
                },
                {
                    new: true,
                    upsert: true,
                    rawResult: true, // Return the raw result from the MongoDB driver
                }
            );

            if (resp.ok != 1)
                return wrapFailureResponse({
                    res: res,
                    errorMsg: "Could not reset accoutn",
                    statusCode: 422,
                });

            // TODO(send SMS to user with the otp)
            NaloSendSms(`+${msisdn}`, SMS_OTP_MESSAGE.replace("#otp", `${code}`));

            wrapSuccessResponse({
                res: res,
                statusCode: 200,
                data: user,
            });
        } catch (error: any) {
            logger.error(error);
            return wrapFailureResponse({
                res: res,
                errorMsg: error.message,
                statusCode: 500,
                detailedError: error,
            });
        }
    };
}

/*
it shoudld handle logging in a new user and storing auth token
*/
export function userLogin() {
    return async (req: Request, res: Response) => {
        try {
            const request = req.body;

            const response = CountryMsisdnValidation(
                request.msisdn,
                request.countryCode
            );
            const { error, msg } = response!;

            if (error) throw new Error(msg)
            const msisdn = msg;

            // getting the user details based on the msisdn
            const user = await User.findOne({ msisdn: msisdn }).exec();
            logger.info(user);
            if (user == null) throw new Error(ACCOUNT_DOESNOT_EXIST)

            const passwordConfirmationStatus = bcrypt.compareSync(
                request.password,
                user.password
            );
            if (!passwordConfirmationStatus) {
                throw new Error("Wrong password or username")
            } else {
                // success
                const accessToken = await signAccessJwtToken(user, client);
                const refreshToken = await signRefreshJwtToken(user)

                const token = {
                    accessToken: accessToken,
                    refreshToken: refreshToken
                }
                wrapSuccessResponse({
                    res: res,
                    statusCode: 200,
                    data: _.omit(JSON.parse(JSON.stringify(user)), ["password"]),
                    token: token,
                });
            }

        } catch (error: any) {
            logger.error(error);
            return wrapFailureResponse({
                res: res,
                errorMsg: error.message,
                statusCode: 500,
                detailedError: error,
            });
        }
    };
}

/*
it should handle getting a single user 
*/
export function getUser() {
    return (req: Request, res: Response) => {
        try {
            const { user, token } = res.locals.user_info;

            if (user == null) throw new Error(USER_NOT_FOUND)

            wrapSuccessResponse({
                res: res,
                statusCode: 200,
                data: _.omit(JSON.parse(JSON.stringify(user)), ["password"]),
                token: token,
            });

        } catch (error: any) {
            logger.error(error);
            return wrapFailureResponse({
                res: res,
                errorMsg: error.message,
                statusCode: 500,
                detailedError: error,
            });
        }
    };
}

/*
it should sign out user 
*/
export function logOut() {
    return (req: Request, res: Response) => {
        try {
            const { user, token } = res.locals.user_info;
    
            if (user == null)
                return wrapFailureResponse({
                    res: res,
                    errorMsg: "User not found",
                    statusCode: 422,
                });
    
            // setting the access token to false
            client.set(token, JSON.stringify({ active: false }));
    
            // deleting the refresh token from the cache
            const storageKey = `${user._id}_REFRESH_TOKEN`;
            client.del(storageKey);
    
            wrapSuccessResponse({
                res: res,
                statusCode: 200,
            });
        } catch (error: any) {
            logger.error(error);
            return wrapFailureResponse({
                res: res,
                errorMsg: error.message,
                statusCode: 500,
                detailedError: error,
            });
        }
    };
}

export function generateRefreshToken(){
    return async(req: Request, res: Response) =>{
        try {
            // get the refresh token from the payload
        const request = req.body
        
        // verify the sign refresh token 
        const verifiedRefreshToken = verifySignedJwtWebToken(request.refreshToken, SCRETE_KEY)

        if (verifiedRefreshToken.payload == null) 
            throw new Error(verifiedRefreshToken.expired)

        const userId = verifiedRefreshToken.payload.id
        const accessToken = await signAccessJwtToken(userId, client)
        const refreshToken = await signRefreshJwtToken(userId)

        const token = {
            accessToken: accessToken,
            refreshToken: refreshToken
        }

        wrapSuccessResponse({
            res: res,
            token: token,
            statusCode: 200,
        });
        } catch (error: any) {
            logger.error(error);
            return wrapFailureResponse({
                res: res,
                errorMsg: error.message,
                statusCode: 500,
                detailedError: error,
            });
        }
    }
}

