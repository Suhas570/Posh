import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import transporter from '../config/nodemailer.js';
import AuditLog from '../models/AuditLog.js';

// Helper to sign JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtsecretkey12345!', {
    expiresIn: '24h'
  });
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).populate('employeeProfile');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify employee status if Employee profile exists
    if (user.employeeProfile && user.employeeProfile.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    const token = signToken(user._id);

    // Audit Log for login
    await AuditLog.create({
      user: user._id,
      email: user.email,
      role: user.role,
      action: 'LOGIN',
      details: `User logged in from IP ${req.ip}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employeeProfile: user.employeeProfile
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 Hour
    await user.save({ validateBeforeSave: false });

    // Send email
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const mailOptions = {
      to: user.email,
      subject: 'HRMS Password Reset Link',
      text: `You requested a password reset. Please make a PUT request to: \n\n ${resetUrl} \n\n This link expires in 1 hour.`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Password reset link sent to email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
    }

    // Set new password
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    // Audit Log for password reset
    await AuditLog.create({
      user: user._id,
      email: user.email,
      role: user.role,
      action: 'PASSWORD_RESET',
      details: 'Password reset completed successfully',
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Register Employee (Admin or System Setup operation)
export const registerUser = async (req, res) => {
  try {
    const { email, password, role, employeeId } = req.body;

    // Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Check if employee profile exists
    const employee = await Employee.findOne({ employeeId });
    if (!employee && role !== 'Super Admin' && role !== 'Internal Committee') {
      return res.status(400).json({ success: false, message: 'Employee profile not found with this ID' });
    }

    const newUser = await User.create({
      email,
      password,
      role,
      employeeProfile: employee ? employee._id : null
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
