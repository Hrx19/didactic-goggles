import express from 'express';
import {
  createOrder,
  verifyPayment,
  getUserOrders,
  getAllOrders,
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);
router.get('/orders', protect, getUserOrders);
router.get('/admin/orders', protect, authorize('admin'), getAllOrders);

export default router;