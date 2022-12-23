import mongoose from 'mongoose'
const {Schema} = mongoose
import {IBookmark} from "./index"

const bookmarkSchema = new Schema<IBookmark>({
    userID: {type: String, required: true},
    recipeID: {type: String, required: true},
    image: {type: String, required: true},
    recipeName: {type: String, required: true},
    recipeSummary: {type: String, required: true},
    timeToPrepare: {type: Number, required: true},
    version: {type: Number, default: 1}
}, {timestamps: true})

const model = mongoose.model<IBookmark>("bookmarks", bookmarkSchema)

export default model