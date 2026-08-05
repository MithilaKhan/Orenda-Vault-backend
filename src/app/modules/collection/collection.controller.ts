import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { CollectionService } from "./collection.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createCollection = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = {
        ...req.body,
        user: req.user.id
    }
    const result = await CollectionService.createCollectionToDB(payload)

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Collection created successfully!",
        data: result
    })
}) 

const getAllCollection = catchAsync(async (req:Request, res:Response, next:NextFunction)=>{
    const result = await CollectionService.getAllCollectionToDB(req.user.id , req.query); 
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Collection fetched successfully!",
        data: result
    })
})  

const getCollectionById= catchAsync(async(req:Request , res:Response, next:NextFunction)=>{
    const result = await CollectionService.getCollectionByIdToDB(req.params.id,req.user.id)

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Collection fetched successfully!",
        data: result
    })
})

const updateCollection = catchAsync(async(req:Request , res:Response, next:NextFunction)=>{
    const payload = {
        ...req.body,
        user: req.user.id
    } 

    const result= await CollectionService.updateCollectionToDB(req.params.id, payload, req.user.id) 

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Collection updated successfully!",
        data: result
    })
}) 

const deleteCollection=catchAsync(async(req:Request , res:Response, next:NextFunction)=>{ 
    const result = await CollectionService.deleteCollectionToDB(req.params.id, req.user.id) 

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Collection deleted successfully!",
        data: result
    })
    
})

export const CollectionController = {
    createCollection, 
    getAllCollection,
    updateCollection,
    deleteCollection,
    getCollectionById
}
