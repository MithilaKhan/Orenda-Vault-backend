import ApiError from "../../../errors/ApiError";
import { Note } from "../note/note.model";
import { Icollection } from "./collection.interface";
import { Collection } from "./collection.model";
import { StatusCodes } from "http-status-codes";

const createCollectionToDB = async (payload: Icollection) => {
    const isExist = await Collection.findOne({ user: payload.user, title: payload.title })
    if (isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You already have a collection with this name!")
    }

    const collection = await Collection.create(payload)
    return collection
}

const getAllCollectionToDB = async (userId: string, query: { search?: string, page?: string, limit?: string }) => {
    const searchTerm = query.search
    const searchFilters = searchTerm ? { title: { $regex: searchTerm, $options: "i" } } : {}
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const skip = (page - 1) * limit

    const filter = { user: userId, ...searchFilters }

    const allCollection = await Collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
    const total = await Collection.countDocuments(filter) 

    return {
        meta: {
            page,
            limit,
            total
        },
        data: allCollection
    }
}  

const getCollectionByIdToDB = async(id:string,userId:string)=>{
    const isCollection = await Collection.findById(id) 
    
    if(!isCollection) {
        throw new ApiError(StatusCodes.BAD_REQUEST,"Collection not found!")
    } 

    if(isCollection.user.toString() !== userId){ 
        throw new ApiError(StatusCodes.FORBIDDEN, "You do not have permission to access this collection!")
    } 

    const notes = await Note.find({collection:id, user:userId}).sort({createdAt:-1}) 

    return {
        ...isCollection.toObject(),
        notes:notes
    }
}

const updateCollectionToDB = async (id: string, payload: Partial<Icollection>, userId: string) => {
    const isExist = await Collection.findById(id)
    if (!isExist) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Collection not found!")
    }

    if(isExist.user.toString() !== userId){
        throw new ApiError(StatusCodes.BAD_REQUEST, "You are not authorized to update this collection!")
    }

    const result = await Collection.findByIdAndUpdate(id, payload, { new: true })
    return result
} 

const deleteCollectionToDB = async(id:string , userId:string)=>{ 
    const isExist = await Collection.findById(id)  

    if(!isExist){
        throw new ApiError(StatusCodes.BAD_REQUEST , "Collection not found!")
    } 

    if(isExist.user.toString() !== userId){
        throw new ApiError(StatusCodes.BAD_REQUEST , "You are not authorized to delete this collection!")
    }

    const result = await Collection.findByIdAndDelete(id)
    return result 

}   


export const CollectionService = { createCollectionToDB, getAllCollectionToDB ,getCollectionByIdToDB ,updateCollectionToDB,deleteCollectionToDB} 