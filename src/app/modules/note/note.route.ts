import express from "express"; 
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { NoteController } from "./note.controller";

const router= express.Router(); 

router.route("/").post(auth(USER_ROLES.USER),NoteController.createNote).get(auth(),NoteController.getAllNote) 

router.route("/:id").patch(auth(USER_ROLES.USER),NoteController.updateNote).delete(auth(USER_ROLES.USER),NoteController.deleteNote) 

export const NoteRoutes = router ;
