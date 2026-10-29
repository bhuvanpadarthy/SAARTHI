import { Router } from 'express';
import { isSupabaseConfigured } from '../../config/supabase.js';

const router = Router();

const sendHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: isSupabaseConfigured ? 'Supabase PostgreSQL (Connected)' : 'Local Storage Engine (Active)',
      service: 'SAARTHI Paint-Shop POS & Inventory Management Backend',
    },
  });
};

router.get('/health', sendHealthStatus);
router.get('/', sendHealthStatus);

export default router;
