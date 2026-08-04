import { model, Schema } from "mongoose";
import { CollectionModel, Icollection } from "./collection.interface";

const collectionSchema= new Schema<Icollection,CollectionModel>({ 
    title:{
        type:String,
        required:true
    }, 
    description:{
        type:String, 
        optional:true 
    },  
    icon:{
        type:String, 
        optional:true 
    },  
    user:{ 
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
}) 

export const Collection= model<Icollection,CollectionModel>("Collection",collectionSchema)