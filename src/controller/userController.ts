import { Request, Response } from "express";
import { RegisterDTO, ConfirmOTPDTO } from "../dto/request/user.dto";
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
import { signJwtWebToken } from "../security/jwtSecurity";
import { GenerateAndStoreCode } from "../utils/generateAndHashCode";

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
            if (response == undefined) throw new Error();
            const { error, msg } = response;

            if (error) throw new Error(msg);
            const msisdn = msg;

            // checking in the database if the user already exists
            let user = await User.findOne({ msisdn: msisdn }).exec();
            if (user != null) throw new Error(USER_EXISTS);

            // add user
            const userInput = new User({
                firstName: request.firstName,
                othrNames: request.otherNames,
                msisdn: msisdn,
                countryCode: request.countryCode,
                isoCode: request.isoCode,
                password: request.password
            });
            user = await userInput.save();
            if (user == null) throw new Error(REQUEST_NOT_PERFORMED);

            // generate code  hash code
            const code = GenerateOTP();
            console.log(code);
            await GenerateAndStoreCode(`${code}`, user)

            // TODO(send SMS to user with the otp)
            NaloSendSms(`+${msisdn}`, SMS_OTP_MESSAGE.replace("#otp", `${code}`));
            wrapSuccessResponse({
                res: res,
                statusCode: 200,
                data: user
            });

        } catch (error: any) {
            console.log(error);
            return wrapFailureResponse({
                res: res,
                errorMsg: `An Error occured:${error.message}`,
                statusCode: 500,
                detailedError: error,
            });
        }
    };
}

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
            if (response == undefined) throw new Error()
            const { error, msg } = response;

            if (error) throw new Error(msg)
            const msisdn = msg;

            // getting the user details based on the msisdn
            const user = await User.findOne({ msisdn: msisdn }).exec();
            if (user == null) throw new Error(ACCOUNT_DOESNOT_EXIST)

            // get the otp from the cached data
            const storageKey = `${user._id}_OTP`;
            const value = await client.get(storageKey);
            const data = JSON.parse(value);

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

            // expires in one day
            const token = await signJwtWebToken(user, client);

            wrapSuccessResponse({
                res: res,
                statusCode: 200,
                data: resp.value,
                token: token
            });

        } catch (error: any) {
            console.log(error);
            return wrapFailureResponse({
                res: res,
                errorMsg: `An Error occured:${error.message}`,
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
            const request = req.body;
            const response = CountryMsisdnValidation(
                request.msisdn,
                request.countryCode
            );
            if (response == undefined) throw new Error()
            const { error, msg } = response;

            if (error) throw new Error(msg)
            const msisdn = msg;

            // getting the user details based on the msisdn
            const user = await User.findOne({ msisdn: msisdn }).exec();
            if (user == null) throw new Error(ACCOUNT_DOESNOT_EXIST)

            // generating the otp
            const code = generateOtp();
            console.log(code);
            await GenerateAndStoreCode(`${code}`, user)


            // TODO(send SMS to user with the otp)
            NaloSendSms(`+${msisdn}`, SMS_OTP_MESSAGE.replace("#otp", `${code}`));

            wrapSuccessResponse({
                res: res,
                statusCode: 200,
                data: user,
            });
        } catch (error: any) {
            console.log(error);
            return wrapFailureResponse({
                res: res,
                errorMsg: `An Error occured:${error.message}`,
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
            console.log(request);
            const response = CountryMsisdnValidation(
                request.msisdn,
                request.countryCode
            );
            if (response == undefined) throw new Error()

            const { error, msg } = response;

            if (error) throw new Error(msg)
            const msisdn = msg;

            // checking in the database if the user already exists
            let user = await User.findOne({ msisdn: msisdn }).exec();
            if (user == null) throw new Error(ACCOUNT_DOESNOT_EXIST)

            // generate code  hash code
            const code = GenerateOTP();
            console.log(code);
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
            // console.log(resp)
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
            console.log(error);
            return wrapFailureResponse({
                res: res,
                errorMsg: `An Error occured:${error.message}`,
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
            if (response == undefined) throw new Error()
            const { error, msg } = response;

            if (error) throw new Error(msg)
            const msisdn = msg;

            // getting the user details based on the msisdn
            const user = await User.findOne({ msisdn: msisdn }).exec();
            console.log(user);
            if (user == null) throw new Error(ACCOUNT_DOESNOT_EXIST)

            const pinConfirmationStatus = bcrypt.compareSync(
                request.pin,
                user.password
            );
            if (!pinConfirmationStatus) {
                throw new Error("Wrong password or username")
            } else {
                // success
                const token = await signJwtWebToken(user, client);
                wrapSuccessResponse({
                    res: res,
                    statusCode: 200,
                    data: _.omit(JSON.parse(JSON.stringify(user)), ["password"]),
                    token: token,
                });
            }

        } catch (error: any) {
            console.log(error);
            return wrapFailureResponse({
                res: res,
                errorMsg: `An Error occured:${error.message}`,
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
            console.log(error);
            return wrapFailureResponse({
                res: res,
                errorMsg: `An Error occured:${error.message}`,
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
            console.log(error);
            return wrapFailureResponse({
                res: res,
                errorMsg: `An Error occured:${error.message}`,
                statusCode: 500,
                detailedError: error,
            });
        }
    };
}

