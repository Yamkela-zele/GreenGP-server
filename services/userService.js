import db from '../config/dbConfig.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const registerUser = (userData, callback) => {
  const { fullName, email, password, organization, role, phone } = userData;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = 'INSERT INTO users (fullName, email, password, organization, role, phone) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [fullName, email, hashedPassword, organization, role, phone], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, { id: result.insertId, fullName, email, organization, role, phone });
  });
};

export const loginUser = (loginData, callback) => {
  const { email, password } = loginData;

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(null, { message: 'User not found' });
    }

    const user = results[0];
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return callback(null, { message: 'Invalid password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, fullName: user.fullName, organization: user.organization, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    callback(null, {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        organization: user.organization,
        role: user.role,
        phone: user.phone
      }
    });
  });
};

export const getUserProfile = (userId, callback) => {
  const query = 'SELECT id, fullName, email, organization, role, phone FROM users WHERE id = ?';
  db.query(query, [userId], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    if (results.length === 0) {
      return callback(null, { message: 'User not found' });
    }
    callback(null, results[0]);
  });
};
