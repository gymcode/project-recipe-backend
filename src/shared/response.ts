import { CODE_FAILURE, CODE_SUCCESS } from "./constants"
import {IErrorResponse, ISuccessResponse} from "./index"

export function wrapFailureResponse({res, errorMsg, detailedError, statusCode}: IErrorResponse){
    res.status(statusCode).json({
        code: CODE_FAILURE,
        msg: "failure",
        data: null,
        error: {
            error: true,
            errMsg: errorMsg, 
            detailedError: detailedError
        }
    })
}

export function wrapSuccessResponse({res, statusCode, data, token, msg = "success"}: ISuccessResponse){
    res.status(statusCode).json({
        code: CODE_SUCCESS,
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

    
