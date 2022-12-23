import express from "express"
const router = express.Router()

// middlewares 
import {isUserAuthenticated } from "../middleware/userMiddleware"

import {addBookmark, deleteBookmark, deleteBookmarks, getBookmarksPerUser} from "../controller/bookmarkController"

// route to register a new user 
router.post('/create', isUserAuthenticated(), addBookmark())

router.get("/user", isUserAuthenticated() ,getBookmarksPerUser())

router.delete("/delete/:bookmarkID",isUserAuthenticated(), deleteBookmark())

router.delete("/delete/user", isUserAuthenticated(), deleteBookmarks())



export default router

