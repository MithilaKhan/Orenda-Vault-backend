import z from "zod";

const createNoteZodSchema = z.object({
    body: z.object({
        title: z.string({ required_error: "Title is required" }),
        description: z.string({ required_error: "Description is required" }),
        collection: z.string({ required_error: "Collection is required" }),
    })
})

const updateNoteZodSchema = z.object({
    body: z.object({
        title: z.string({ required_error: "Title is required" }).optional(),
        description: z.string({ required_error: "Description is required" }).optional(),
        collection: z.string({ required_error: "Collection is required" }).optional(),
    })
})

export const NoteValidation ={
    createNoteZodSchema, 
    updateNoteZodSchema
}