import { CODE_FAILURE, CODE_SUCCESS } from "./constants"
import {IErrorResponse, ISuccessResponse} from "./index"

export function wrapFailureResponse({res, errorMsg, detailedError, statusCode, systemCode="U01"}: IErrorResponse){
    res.status(statusCode).json({
        code: CODE_FAILURE,
        systemCode: statusCode,
        msg: "failure",
        data: null,
        error: {
            error: true,
            errMsg: errorMsg, 
            detailedError: detailedError
        }
    })
}

export function wrapSuccessResponse({res, statusCode, data, token, msg = "success", systemCode="U00"}: ISuccessResponse){
    res.status(statusCode).json({
        code: CODE_SUCCESS,
        systemCode: systemCode,
        msg: msg,
        data: data,
        token: token,
        error: {
            error: false,
            errMsg: "", 
            detailedError: null
        }
    })
}

    
