import { Response } from "express"

export interface IErrorResponse {
    res: Response, 
    statusCode: number, 
    errorMsg:string, 
    detailedError?: any
    systemCode?:string
}

export interface ISuccessResponse {
    res: Response, 
    statusCode: number, 
    msg?: string,
    data?: any, 
    token?: Token,
    systemCode?:string
}

export interface Token {
    accessToken: string,
    refreshToken: string
}