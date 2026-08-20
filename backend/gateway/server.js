import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend requests
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-scope-user']
}));

const identityProxy = createProxyMiddleware({
  target: process.env.IDENTITY_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
});

const operationsProxy = createProxyMiddleware({
  target: process.env.OPERATIONS_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
});

const complianceProxy = createProxyMiddleware({
  target: process.env.COMPLIANCE_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true,
});

const reportingProxy = createProxyMiddleware({
  target: process.env.REPORTING_SERVICE_URL || 'http://localhost:3005',
  changeOrigin: true,
});

// Health check endpoint (MUST be above catch-all middleware)
app.get('/health', (req, res) => {
  res.json({ status: 'Gateway is running', activeServices: 4, monolithInactive: true });
});

// Phase 2 & 3 routing: route to respective microservices without stripping paths
app.use((req, res, next) => {
  const identityPaths = [
    '/auth',
    '/admin/users',
    '/admin/register',
    '/admin/depots',
    '/admin/districts',
    '/admin/super-admins'
  ];
  const opsPaths = [
    '/driver',
    '/engine',
    '/tcard',
    '/depot'
  ];
  const compliancePaths = [
    '/abnormalities',
    '/issues',
    '/admin/circulars'
  ];
  const reportingPaths = [
    '/admin/reports',
    '/admin/overdue-records',
    '/admin/dashboard'
  ];
  
  if (identityPaths.some(p => req.path.startsWith(p))) {
    return identityProxy(req, res, next);
  }
  if (opsPaths.some(p => req.path.startsWith(p))) {
    return operationsProxy(req, res, next);
  }
  if (compliancePaths.some(p => req.path.startsWith(p))) {
    return complianceProxy(req, res, next);
  }
  if (reportingPaths.some(p => req.path.startsWith(p))) {
    return reportingProxy(req, res, next);
  }
  return res.status(404).json({ msg: "Route not found or not migrated" });
});

// app.use('/uploads', monolithProxy); // Disabled for Phase 5

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
