"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const note_controller_1 = require("./note.controller");
const router = express_1.default.Router();
router.route("/").post((0, auth_1.default)(user_1.USER_ROLES.USER), note_controller_1.NoteController.createNote).get((0, auth_1.default)(), note_controller_1.NoteController.getAllNote);
router.route("/:id").patch((0, auth_1.default)(user_1.USER_ROLES.USER), note_controller_1.NoteController.updateNote).delete((0, auth_1.default)(user_1.USER_ROLES.USER), note_controller_1.NoteController.deleteNote);
exports.NoteRoutes = router;
