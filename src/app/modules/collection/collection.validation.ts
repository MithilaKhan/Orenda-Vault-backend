import z from "zod";

const createCollectionZodSchema = z.object({
    body: z.object({
        title: z.string({ required_error: "Title is required" }),
        description: z.string({ required_error: "Description is required" }).optional(),
        icon: z.string({ required_error: "Icon is required" }),
    })
})

const updateCollectionZodSchema = z.object({
    body: z.object({
        title: z.string({ required_error: "Title is required" }).optional(),
        description: z.string({ required_error: "Description is required" }).optional(),
        icon: z.string({ required_error: "Icon is required" }).optional(),
    })
})

export const CollectionValidation ={
    createCollectionZodSchema, 
    updateCollectionZodSchema
}