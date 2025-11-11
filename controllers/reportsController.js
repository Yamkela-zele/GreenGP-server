import db from '../config/dbConfig.js';
import path from 'path';
import fs from 'fs';

export const getAllReports = (req, res) => {
  const userId = req.user.id;
  const query = 'SELECT * FROM reports WHERE generated_by = ? ORDER BY created_at DESC';

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching reports', error: err.message });
    }
    res.json(results);
  });
};

export const getReportById = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const query = 'SELECT * FROM reports WHERE id = ? AND generated_by = ?';
  db.query(query, [id, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching report', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Report not found' });
    }
    res.json(results[0]);
  });
};

export const createReport = (req, res) => {
  const { title, description, report_type, parameters } = req.body;
  const userId = req.user.id;

  const query = `INSERT INTO reports (title, description, report_type, generated_by, parameters, status)
                 VALUES (?, ?, ?, ?, ?, 'pending')`;

  db.query(query, [title, description, report_type, userId, JSON.stringify(parameters || {})], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating report', error: err.message });
    }
    res.status(201).json({
      id: result.insertId,
      title,
      description,
      report_type,
      generated_by: userId,
      parameters: parameters || {},
      status: 'pending'
    });
  });
};

export const updateReport = (req, res) => {
  const { id } = req.params;
  const { title, description, status, file_path } = req.body;
  const userId = req.user.id;

  const query = `UPDATE reports SET title = ?, description = ?, status = ?, file_path = ?
                 WHERE id = ? AND generated_by = ?`;

  db.query(query, [title, description, status, file_path, id, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating report', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Report not found or not authorized' });
    }
    res.json({ message: 'Report updated successfully' });
  });
};

export const deleteReport = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // First get the file path to delete the file
  const selectQuery = 'SELECT file_path FROM reports WHERE id = ? AND generated_by = ?';
  db.query(selectQuery, [id, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching report', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Report not found or not authorized' });
    }

    const filePath = results[0].file_path;

    // Delete the report from database
    const deleteQuery = 'DELETE FROM reports WHERE id = ? AND generated_by = ?';
    db.query(deleteQuery, [id, userId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error deleting report', error: err.message });
      }

      // Delete the file if it exists
      if (filePath) {
        const fullPath = path.join(process.cwd(), filePath);
        fs.unlink(fullPath, (err) => {
          if (err) console.error('Error deleting report file:', err);
        });
      }

      res.json({ message: 'Report deleted successfully' });
    });
  });
};

export const generateReport = (req, res) => {
  const { templateType, parameters } = req.body;
  const userId = req.user.id;

  // This is a simplified report generation
  // In a real application, you would use a reporting library like jsPDF, ExcelJS, etc.

  const reportData = {
    templateType,
    parameters,
    generatedAt: new Date().toISOString(),
    userId
  };

  // For now, just create a JSON report
  const reportTitle = `${templateType.charAt(0).toUpperCase() + templateType.slice(1)} Report - ${new Date().toLocaleDateString()}`;
  const reportDescription = `Generated ${templateType} report with parameters: ${JSON.stringify(parameters)}`;

  const query = `INSERT INTO reports (title, description, report_type, generated_by, parameters, status, file_path)
                 VALUES (?, ?, ?, ?, ?, 'completed', ?)`;

  // Create a simple JSON file as placeholder
  const fileName = `report_${Date.now()}.json`;
  const filePath = `reports/${fileName}`;

  // Ensure reports directory exists
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Write the report data to file
  fs.writeFileSync(path.join(reportsDir, fileName), JSON.stringify(reportData, null, 2));

  db.query(query, [reportTitle, reportDescription, templateType, userId, JSON.stringify(parameters), filePath], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error generating report', error: err.message });
    }
    res.status(201).json({
      id: result.insertId,
      title: reportTitle,
      description: reportDescription,
      report_type: templateType,
      status: 'completed',
      file_path: filePath
    });
  });
};
