import z from "zod";

const createCollectionZodSchema = z.object({
    body: z.object({
        title: z.string({ message: "Title is required" }),
        description: z.string({ message: "Description is required" }).optional(),
        icon: z.string({ message: "Icon is required" }),
    })
})

const updateCollectionZodSchema = z.object({
    body: z.object({
        title: z.string({ message: "Title is required" }).optional(),
        description: z.string({ message: "Description is required" }).optional(),
        icon: z.string({ message: "Icon is required" }).optional(),
    })
})

export const CollectionValidation ={
    createCollectionZodSchema, 
    updateCollectionZodSchema
}