import { NextFunction, Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { NoteService } from "./note.service";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";

const createNote = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const payload = {
        ...req.body,
        user: req.user.id
    }
    const result = await NoteService.createNoteToDB(payload)

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Note created successfully!",
        data: result
    })
}) 

const getAllNote = catchAsync(async (req:Request, res:Response, next:NextFunction)=>{
    const result = await NoteService.getAllNoteToDB(req.user.id , req.query); 
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Note fetched successfully!",
        data: result
    })
}) 

const updateNote = catchAsync(async(req:Request , res:Response, next:NextFunction)=>{
    const payload = {
        ...req.body,
        user: req.user.id
    } 

    const result= await NoteService.updateNoteToDB(req.params.id, payload, req.user.id) 

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Note updated successfully!",
        data: result
    })
}) 

const deleteNote=catchAsync(async(req:Request , res:Response, next:NextFunction)=>{ 
    const result = await NoteService.deleteNoteToDB(req.params.id, req.user.id) 

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: "Note deleted successfully!",
        data: result
    })
    
})

export const NoteController = {
    createNote, 
    getAllNote,
    updateNote,
    deleteNote
}
