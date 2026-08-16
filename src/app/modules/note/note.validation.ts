import z from "zod";

const createNoteZodSchema = z.object({
    body: z.object({
        title: z.string({ message: "Title is required" }),
        description: z.string({ message: "Description is required" }),
        collection: z.string({ message: "Collection is required" }).nullable().optional(),
        isFavorite: z.boolean().optional(),
    })
})

const updateNoteZodSchema = z.object({
    body: z.object({
        title: z.string({ message: "Title is required" }).optional(),
        description: z.string({ message: "Description is required" }).optional(),
        collection: z.string({ message: "Collection is required" }).nullable().optional(),
        isFavorite: z.boolean().optional(),
    })
})

export const NoteValidation ={
    createNoteZodSchema, 
    updateNoteZodSchema
}