import express from 'express';
import {
  getAllIoTDevices,
  getIoTDeviceById,
  getIoTDevicesBySMME,
  getIoTReadings,
  createIoTDevice,
  updateIoTDevice,
  deleteIoTDevice
} from '../controllers/iotController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All IoT routes require authentication
router.use(authenticateToken);

router.get('/', getAllIoTDevices);
router.get('/:id', getIoTDeviceById);
router.get('/smme/:smmeId', getIoTDevicesBySMME);
router.get('/:deviceId/readings', getIoTReadings);
router.post('/', createIoTDevice);
router.put('/:id', updateIoTDevice);
router.delete('/:id', deleteIoTDevice);

export default router;
