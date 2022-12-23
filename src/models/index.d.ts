import mongoose from "mongoose";

export interface IUser extends mongoose.Document{
    firstName: string,
    otherNames: string,
    msisdn: string,
    password: string,
    countryCode: string,
    isoCode: string,
    email: string,
    gender: string,
    invalidLoginAttempts: number,
    lockCoeff: number,
    lockPeriod: Date,
    userLockStatus: boolean,
    activated: boolean,
    isOtpConfirmed: boolean,
    version: number,
}

export interface IBookmark extends mongoose.Document {
    userID: string,
    image: string,
    recipeName: string,
    recipeSummary: string,
    timeToPrepare: number,
    recipeID: string,
    version: number
}