import db from '../config/dbConfig.js';

export const getAllSMME = (req, res) => {
  const userId = req.user.id;
  const query = 'SELECT * FROM smme WHERE user_id = ? ORDER BY created_at DESC';

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching SMMEs', error: err.message });
    }
    res.json(results);
  });
};

export const getSMMEById = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const query = 'SELECT * FROM smme WHERE id = ? AND user_id = ?';
  db.query(query, [id, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching SMME', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'SMME not found' });
    }
    res.json(results[0]);
  });
};

export const createSMME = (req, res) => {
  const { name, description, sector, location, contact_person, contact_email, contact_phone, registration_date, status } = req.body;
  const userId = req.user.id;

  const query = `INSERT INTO smme (name, description, sector, location, contact_person, contact_email, contact_phone, registration_date, status, user_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [name, description, sector, location, contact_person, contact_email, contact_phone, registration_date, status || 'active', userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating SMME', error: err.message });
    }
    res.status(201).json({
      id: result.insertId,
      name,
      description,
      sector,
      location,
      contact_person,
      contact_email,
      contact_phone,
      registration_date,
      status: status || 'active',
      user_id: userId
    });
  });
};

export const updateSMME = (req, res) => {
  const { id } = req.params;
  const { name, description, sector, location, contact_person, contact_email, contact_phone, registration_date, status } = req.body;
  const userId = req.user.id;

  const query = `UPDATE smme SET name = ?, description = ?, sector = ?, location = ?, contact_person = ?,
                 contact_email = ?, contact_phone = ?, registration_date = ?, status = ?
                 WHERE id = ? AND user_id = ?`;

  db.query(query, [name, description, sector, location, contact_person, contact_email, contact_phone, registration_date, status, id, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating SMME', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'SMME not found or not authorized' });
    }
    res.json({ message: 'SMME updated successfully' });
  });
};

export const deleteSMME = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const query = 'DELETE FROM smme WHERE id = ? AND user_id = ?';
  db.query(query, [id, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting SMME', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'SMME not found or not authorized' });
    }
    res.json({ message: 'SMME deleted successfully' });
  });
};
