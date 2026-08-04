import { Model, Types } from "mongoose";

export type Icollection= {
    title:string, 
    description:string, 
    icon:string, 
    user:Types.ObjectId, 
} 

export type CollectionModel= Model<Icollection>;