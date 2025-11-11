import db from '../config/dbConfig.js';

export const getAllCaseStudies = (req, res) => {
  const query = `
    SELECT cs.*, u.fullName as author_name, u.organization as author_organization
    FROM case_studies cs
    LEFT JOIN users u ON cs.author_id = u.id
    WHERE cs.published = true
    ORDER BY cs.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching case studies', error: err.message });
    }
    res.json(results);
  });
};

export const getCaseStudyById = (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT cs.*, u.fullName as author_name, u.organization as author_organization
    FROM case_studies cs
    LEFT JOIN users u ON cs.author_id = u.id
    WHERE cs.id = ? AND cs.published = true
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching case study', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Case study not found' });
    }
    res.json(results[0]);
  });
};

export const createCaseStudy = (req, res) => {
  const { title, description, smme_id, sector, impact_metrics, content } = req.body;
  const userId = req.user.id;

  const query = `INSERT INTO case_studies (title, description, smme_id, sector, impact_metrics, content, author_id, published)
                 VALUES (?, ?, ?, ?, ?, ?, ?, false)`;

  db.query(query, [title, description, smme_id, sector, JSON.stringify(impact_metrics || {}), content, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating case study', error: err.message });
    }
    res.status(201).json({
      id: result.insertId,
      title,
      description,
      smme_id,
      sector,
      impact_metrics: impact_metrics || {},
      content,
      author_id: userId,
      published: false
    });
  });
};

export const updateCaseStudy = (req, res) => {
  const { id } = req.params;
  const { title, description, sector, impact_metrics, content } = req.body;
  const userId = req.user.id;

  const query = `UPDATE case_studies SET title = ?, description = ?, sector = ?, impact_metrics = ?, content = ?
                 WHERE id = ? AND author_id = ?`;

  db.query(query, [title, description, sector, JSON.stringify(impact_metrics || {}), content, id, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating case study', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Case study not found or not authorized' });
    }
    res.json({ message: 'Case study updated successfully' });
  });
};

export const deleteCaseStudy = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const query = 'DELETE FROM case_studies WHERE id = ? AND author_id = ?';
  db.query(query, [id, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting case study', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Case study not found or not authorized' });
    }
    res.json({ message: 'Case study deleted successfully' });
  });
};

export const publishCaseStudy = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const query = `UPDATE case_studies SET published = true, published_at = NOW()
                 WHERE id = ? AND author_id = ? AND published = false`;

  db.query(query, [id, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error publishing case study', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Case study not found, not authorized, or already published' });
    }
    res.json({ message: 'Case study published successfully' });
  });
};

export const getMyCaseStudies = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT cs.*, s.name as smme_name
    FROM case_studies cs
    LEFT JOIN smme s ON cs.smme_id = s.id
    WHERE cs.author_id = ?
    ORDER BY cs.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching your case studies', error: err.message });
    }
    res.json(results);
  });
};
