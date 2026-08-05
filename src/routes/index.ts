import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { CollectionRoutes } from '../app/modules/collection/collection.route';
import { NoteRoutes } from '../app/modules/note/note.route';
const router = express.Router();

const apiRoutes = [
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  }, 
  {
    path:"/collection",
    route:CollectionRoutes,
  },
  {
    path:"/notes",
    route:NoteRoutes
  }
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
