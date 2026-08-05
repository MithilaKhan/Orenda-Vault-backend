import express from "express"; 
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import { CollectionController } from "./collection.controller";

const router= express.Router(); 

router.route("/").post(auth(USER_ROLES.USER),CollectionController.createCollection).get(auth(),CollectionController.getAllCollection) 

router.route("/:id").get(auth(),CollectionController.getCollectionById).patch(auth(USER_ROLES.USER),CollectionController.updateCollection).delete(auth(USER_ROLES.USER),CollectionController.deleteCollection) 

export const CollectionRoutes = router ;
