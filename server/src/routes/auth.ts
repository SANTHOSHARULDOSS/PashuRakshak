import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/db.js';
import { AuthRequest, authenticateToken } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'pashu_rakshak_secure_jwt_secret_sih2026_key_982347';

function generateToken(user: any) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      district: user.district,
      taluka: user.taluka,
      village: user.village
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Standard Login
router.post('/login', async (req, res: Response) => {
  const { identifier, password } = req.body; // email or phone

  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Identifier and password are required' });
  }

  try {
    const user = db.prepare(`
      SELECT * FROM users WHERE (email = ? OR phone = ?) AND is_active = 1
    `).get(identifier, identifier) as any;

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or user not found' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid && password !== 'pashu123') { // allow demo universal password
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    logAudit({
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        full_name: user.full_name,
        role: user.role,
        district: user.district,
        taluka: user.taluka,
        village: user.village,
        language_pref: user.language_pref
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Demo Instant Switcher Login (No password needed for judges to evaluate all 6 roles instantly)
router.post('/demo/:role', (req, res) => {
  const { role } = req.params;
  const normalizedRole = role.toUpperCase();

  try {
    const user = db.prepare(`
      SELECT * FROM users WHERE role = ? LIMIT 1
    `).get(normalizedRole) as any;

    if (!user) {
      return res.status(404).json({ success: false, message: `No demo account found for role: ${role}` });
    }

    const token = generateToken(user);

    logAudit({
      userId: user.id,
      userName: user.full_name,
      userRole: user.role,
      action: 'DEMO_SWITCH_LOGIN',
      entity: 'User',
      entityId: user.id,
      ipAddress: req.ip
    });

    return res.json({
      success: true,
      message: `Switched to demo role: ${user.role}`,
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        full_name: user.full_name,
        role: user.role,
        district: user.district,
        taluka: user.taluka,
        village: user.village,
        language_pref: user.language_pref
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Current User Profile & Role Info
router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  try {
    const user = db.prepare(`SELECT * FROM users WHERE id = ?`).get(req.user?.id) as any;
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let extraProfile = null;
    if (user.role === 'FARMER') {
      extraProfile = db.prepare(`SELECT * FROM farmer_profiles WHERE user_id = ?`).get(user.id);
    } else if (['FIELD_VET', 'PARA_VET'].includes(user.role)) {
      extraProfile = db.prepare(`SELECT * FROM veterinary_workers WHERE user_id = ?`).get(user.id);
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        full_name: user.full_name,
        role: user.role,
        district: user.district,
        taluka: user.taluka,
        village: user.village,
        language_pref: user.language_pref,
        profile: extraProfile
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
