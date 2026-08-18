"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const collection_controller_1 = require("./collection.controller");
const router = express_1.default.Router();
router.route("/").post((0, auth_1.default)(user_1.USER_ROLES.USER), collection_controller_1.CollectionController.createCollection).get((0, auth_1.default)(), collection_controller_1.CollectionController.getAllCollection);
router.route("/:id").get((0, auth_1.default)(), collection_controller_1.CollectionController.getCollectionById).patch((0, auth_1.default)(user_1.USER_ROLES.USER), collection_controller_1.CollectionController.updateCollection).delete((0, auth_1.default)(user_1.USER_ROLES.USER), collection_controller_1.CollectionController.deleteCollection);
exports.CollectionRoutes = router;
