import * as Router from 'koa-router';
import { processErrors } from './errors';
import {
  handleCreateUser,
  handleDeleteUser,
  handleEditEmail,
  handleEditField,
  handleGetUser,
  handleGetUsers,
} from './users';

const router = new Router();
router.use(processErrors);
router.get('/users', handleGetUsers);
router.get('/users/:id', handleGetUser);
router.post('/users', handleCreateUser);
router.delete('/users/:id', handleDeleteUser);

// editing fields
router.put('/users/:id/email', handleEditEmail);
router.put('/users/:id/:field', handleEditField);

export default router;
