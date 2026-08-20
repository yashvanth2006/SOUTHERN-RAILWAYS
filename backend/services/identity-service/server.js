import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { resolveUserScope } from './services/authorization/scopeService.js';
import { resolveScopeUser } from './utils/resolveScopeUser.js';
import { hasPermission } from './services/authorization/permissionService.js';

dotenv.config({ path: '../../.env', override: true }); // Use root env for DB

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Identity Service is running' });
});

// Section 2: Cross-Service Authorization Pattern Internal Endpoint
const verifyInternalSecret = (req, res, next) => {
  const secret = req.headers['x-internal-secret'];
  if (secret !== process.env.INTERNAL_SERVICE_SECRET) {
    return res.status(403).json({ msg: 'Forbidden: Invalid internal secret' });
  }
  next();
};

app.post('/internal/resolve-scope', verifyInternalSecret, async (req, res) => {
  try {
    const { userId, action, scopeUserHeader } = req.body;
    const scopeUser = await resolveScopeUser({ user: { id: userId }, headers: { "x-scope-user": scopeUserHeader } });
    if (!scopeUser) return res.json({ allowed: false, status: 401, body: { msg: "User not found or inactive" } });
    
    const scope = await resolveUserScope(scopeUser._id);
    console.log(`[resolve-scope] userId=${userId}, resolvedRole=${scope?.role}, action=${action}, allowed=${hasPermission(scope?.role, action)}`);
    if (!scope || !hasPermission(scope.role, action)) {
      return res.json({ allowed: false, status: 403, body: { msg: "Access denied" } });
    }
    
    res.json({ allowed: true, scope });
  } catch (err) {
    console.error("Internal resolve scope failed:", err);
    res.json({ allowed: false, status: 500, body: { msg: "Internal error" } });
  }
});

const PORT = process.env.IDENTITY_PORT || 3002;
app.listen(PORT, () => {
  console.log(`Identity Service running on port ${PORT}`);
});
