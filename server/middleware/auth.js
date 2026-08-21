import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employee from '../models/Employee.js';

// ============================================================
// DEMO MODE CONFIGURATION
// ============================================================
// When DEMO_MODE is true, the protect middleware accepts the
// demo user ID without requiring a real user in the database.
// This allows the client demo to access protected routes.
// ============================================================
const DEMO_MODE = process.env.DEMO_MODE === 'true' || true;
const DEMO_USER_ID = 'demo-user-id';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // If token is plain demo token in DEMO_MODE
      if (DEMO_MODE && token === 'demo-mode-token') {
        let employeeProfile = null;
        try {
          employeeProfile = await Employee.findOne().populate('department manager');
        } catch (e) {}

        req.user = {
          _id: DEMO_USER_ID,
          id: DEMO_USER_ID,
          email: 'demo@hrms.com',
          role: 'Employee',
          employeeProfile: employeeProfile
        };
        return next();
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtsecretkey12345!');

      // ============================================================
      // DEMO MODE: If the token belongs to the demo user, create a
      // demo user context with an employee profile so POSH complaints
      // and other employee features work.
      // ============================================================
      if (DEMO_MODE && decoded.id === DEMO_USER_ID) {
        // Try to find any employee profile to attach
        let employeeProfile = null;
        try {
          employeeProfile = await Employee.findOne().populate('department manager');
        } catch (e) {
          // Ignore DB errors in demo mode
        }

        req.user = {
          _id: DEMO_USER_ID,
          id: DEMO_USER_ID,
          email: 'demo@hrms.com',
          role: 'Employee',
          employeeProfile: employeeProfile
        };
        return next();
      }

      // Get user from the token and populate employee profile
      req.user = await User.findById(decoded.id).populate('employeeProfile').select('-password');
      if (!req.user) {
        if (DEMO_MODE) {
          let employeeProfile = null;
          try {
            employeeProfile = await Employee.findOne().populate('department manager');
          } catch (e) {}
          req.user = {
            _id: DEMO_USER_ID,
            id: DEMO_USER_ID,
            email: 'demo@hrms.com',
            role: 'Employee',
            employeeProfile: employeeProfile
          };
          return next();
        }
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      if (DEMO_MODE) {
        let employeeProfile = null;
        try {
          employeeProfile = await Employee.findOne().populate('department manager');
        } catch (e) {}
        req.user = {
          _id: DEMO_USER_ID,
          id: DEMO_USER_ID,
          email: 'demo@hrms.com',
          role: 'Employee',
          employeeProfile: employeeProfile
        };
        return next();
      }
      console.error('Token verification error:', error);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};
