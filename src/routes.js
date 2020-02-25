import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import CourierController from './app/controllers/CourierController';
import FileController from './app/controllers/FileController';
import OrderController from './app/controllers/OrderController';
import CourierOrderController from './app/controllers/CourierOrderController';
import WithdrawalOrderController from './app/controllers/WithdrawalOrderController';
import DeliveryOrderController from './app/controllers/DeliveryOrderController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';
import OrderDeliveryProblemController from './app/controllers/OrderDeliveryProblemController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);
routes.get('/couriers/:courierId/orders', CourierOrderController.index);

routes.get(
  '/couriers/:courierId/orders/delivered',
  DeliveryOrderController.index
);
routes.put(
  '/couriers/:courierId/order/:orderId',
  WithdrawalOrderController.update
);
routes.put(
  '/couriers/:courierId/delivery/:orderId',
  upload.single('file'),
  DeliveryOrderController.update
);

routes.use(authMiddleware);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);

routes.get('/couriers', CourierController.index);
routes.post('/couriers', CourierController.store);
routes.put('/couriers/:courierId', CourierController.update);
routes.delete('/couriers/:courierId', CourierController.delete);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/orders', OrderController.index);
routes.post('/orders', OrderController.store);
routes.put('/orders/:orderId', OrderController.update);
routes.delete('/orders/:orderId', OrderController.delete);

routes.get('/delivery/problems', DeliveryProblemController.index);
routes.get('/delivery/:orderId/problems', OrderDeliveryProblemController.index);
routes.post('/delivery/:orderId/problems', DeliveryProblemController.store);

routes.delete(
  '/problem/:problemId/cancel-order',
  DeliveryProblemController.delete
);

export default routes;
