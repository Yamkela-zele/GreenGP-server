import { registerUser, loginUser, getUserProfile } from '../services/userService.js';

export const register = (req, res) => {
  const { fullName, email, password, organization, role, phone } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required' });
  }

  registerUser({ fullName, email, password, organization, role, phone }, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Email already exists' });
      }
      return res.status(500).json({ message: 'Error registering user', error: err.message });
    }
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result
    });
  });
};

export const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  loginUser({ email, password }, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging in', error: err.message });
    }
    if (result.message) {
      return res.status(401).json({ message: result.message });
    }
    res.json({
      success: true,
      message: 'Login successful',
      ...result
    });
  });
};

export const getProfile = (req, res) => {
  const userId = req.user.id;

  getUserProfile(userId, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching profile', error: err.message });
    }
    if (result.message) {
      return res.status(404).json(result);
    }
    res.json(result);
  });
};
