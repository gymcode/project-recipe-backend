import {Request, Response} from "express"
import {AddBookmarkDTO} from '../dto/request/bookmark.dto'
import Bookmark from "../models/Bookmark";
import _ from "lodash";
import { wrapFailureResponse, wrapSuccessResponse } from "../shared/response";

// adding logger class
import { Logger } from "../logger";
const logger = new Logger()

/*
register a new user 
*/
export function addBookmark() {
    return async (req: Request, res: Response) => {
        try {
            const { user, token } = res.locals.user_info;
            if (user == null)
                return wrapFailureResponse({
                    res: res,
                    errorMsg: "User not found",
                    statusCode: 422,
                });

            const request: AddBookmarkDTO = req.body
            // check if user has already bookmarked a recipe
            const bookmark = await Bookmark.findOne({recipeID: request.recipeID}).exec()
            if (bookmark != null) throw new Error ("User has already bookmarked this post")

            const bookmarkModel = new Bookmark({
                userID: user._id,
                image: request.image,
                recipeName: request.recipeName,
                recipeSummary: request.recipeSummary,
                timeToPrepare: request.timeToPrepare,
                recipeID: request.recipeID
            })
            
            // saving the bookmark for a user 
            const isDataSaved = await bookmarkModel.save()

            if (isDataSaved == null ) throw new Error("Could not saved data")

            wrapSuccessResponse({
                res: res,
                statusCode: 200,
                data: isDataSaved,
                token: token
            });

        } catch (error: any) {
            logger.error(error)
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
register a new user 
*/
export function getBookmarksPerUser() {
    return async (req: Request, res: Response) => {
        try {
            const { user, token } = res.locals.user_info;
            if (user == null)
                return wrapFailureResponse({
                    res: res,
                    errorMsg: "User not found",
                    statusCode: 422,
                });

            // check if user has already bookmarked a recipe
            const bookmarks = await Bookmark.find({userID: user._id}).exec()
            if (bookmarks == null) throw new Error ("Sorry you have not bookmark any recipe yet.")

            wrapSuccessResponse({
                res: res,
                statusCode: 200,
                data: bookmarks,
                token: token
            });

        } catch (error: any) {
            logger.error(error)
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
register a new user 
*/
export function deleteBookmark() {
    return async (req: Request, res: Response) => {
        try {
            const { user, token } = res.locals.user_info;
            if (user == null)
                return wrapFailureResponse({
                    res: res,
                    errorMsg: "User not found",
                    statusCode: 422,
                });

            const bookmarkID = req.params.bookmarkID
            // check if user has already bookmarked a recipe
            const isBookmarkDeleted = await Bookmark.deleteOne({_id: bookmarkID}).exec()
            if (isBookmarkDeleted == null) throw new Error ("Could not execute request.")

            wrapSuccessResponse({
                res: res,
                statusCode: 200,
                data: true,
                token: token
            });

        } catch (error: any) {
            logger.error(error)
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
register a new user 
*/
export function deleteBookmarks() {
    return async (req: Request, res: Response) => {
        try {
            const { user, token } = res.locals.user_info;
            if (user == null)
                return wrapFailureResponse({
                    res: res,
                    errorMsg: "User not found",
                    statusCode: 422,
                });

            // check if user has already bookmarked a recipe
            const isBookmarkDeleted = await Bookmark.deleteMany({userID: user._id}).exec()
            if (isBookmarkDeleted == null) throw new Error ("Could not execute request.")

            wrapSuccessResponse({
                res: res,
                statusCode: 200,
                data: true,
                token: token
            });

        } catch (error: any) {
            logger.error(error)
            return wrapFailureResponse({
                res: res,
                errorMsg: `An Error occured:${error.message}`,
                statusCode: 500,
                detailedError: error,
            });
        }
    };
}


