import { model, Schema } from "mongoose";
import { CollectionModel, Icollection } from "./collection.interface";

const collectionSchema= new Schema<Icollection,CollectionModel>({ 
    title:{
        type:String,
        required:true
    }, 
    description:{
        type:String, 
        default: "" 
    },  
    icon:{
        type:String, 
        default: "" 
    },  
    user:{ 
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
    }
}, { timestamps: true }) 

export const Collection= model<Icollection,CollectionModel>("Collection",collectionSchema)