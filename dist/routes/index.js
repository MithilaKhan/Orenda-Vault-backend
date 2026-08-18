"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../app/modules/auth/auth.route");
const user_route_1 = require("../app/modules/user/user.route");
const collection_route_1 = require("../app/modules/collection/collection.route");
const note_route_1 = require("../app/modules/note/note.route");
const chat_route_1 = require("../app/modules/chat/chat.route");
const router = express_1.default.Router();
const apiRoutes = [
    {
        path: '/user',
        route: user_route_1.UserRoutes,
    },
    {
        path: '/auth',
        route: auth_route_1.AuthRoutes,
    },
    {
        path: "/collection",
        route: collection_route_1.CollectionRoutes,
    },
    {
        path: "/notes",
        route: note_route_1.NoteRoutes
    },
    {
        path: "/chat",
        route: chat_route_1.ChatRoutes
    }
];
apiRoutes.forEach(route => router.use(route.path, route.route));
exports.default = router;
