import db from '../config/dbConfig.js';

export const getAllIoTDevices = (req, res) => {
  const userId = req.user.id;
  const query = `
    SELECT d.*, s.name as smme_name
    FROM iot_devices d
    LEFT JOIN smme s ON d.smme_id = s.id
    WHERE s.user_id = ?
    ORDER BY d.created_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching IoT devices', error: err.message });
    }
    res.json(results);
  });
};

export const getIoTDeviceById = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const query = `
    SELECT d.*, s.name as smme_name
    FROM iot_devices d
    LEFT JOIN smme s ON d.smme_id = s.id
    WHERE d.id = ? AND s.user_id = ?
  `;

  db.query(query, [id, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching IoT device', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'IoT device not found' });
    }
    res.json(results[0]);
  });
};

export const getIoTDevicesBySMME = (req, res) => {
  const { smmeId } = req.params;
  const userId = req.user.id;

  const query = `
    SELECT d.* FROM iot_devices d
    LEFT JOIN smme s ON d.smme_id = s.id
    WHERE d.smme_id = ? AND s.user_id = ?
    ORDER BY d.created_at DESC
  `;

  db.query(query, [smmeId, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching IoT devices for SMME', error: err.message });
    }
    res.json(results);
  });
};

export const getIoTReadings = (req, res) => {
  const { deviceId } = req.params;
  const { timeRange } = req.query;
  const userId = req.user.id;

  // First verify the device belongs to the user
  const deviceQuery = `
    SELECT d.id FROM iot_devices d
    LEFT JOIN smme s ON d.smme_id = s.id
    WHERE d.id = ? AND s.user_id = ?
  `;

  db.query(deviceQuery, [deviceId, userId], (err, deviceResults) => {
    if (err) {
      return res.status(500).json({ message: 'Error verifying device access', error: err.message });
    }
    if (deviceResults.length === 0) {
      return res.status(404).json({ message: 'Device not found or not authorized' });
    }

    // Build readings query with optional time range
    let readingsQuery = 'SELECT * FROM iot_readings WHERE device_id = ?';
    let params = [deviceId];

    if (timeRange) {
      const hours = parseInt(timeRange);
      if (!isNaN(hours)) {
        readingsQuery += ' AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)';
        params.push(hours);
      }
    }

    readingsQuery += ' ORDER BY timestamp DESC LIMIT 1000';

    db.query(readingsQuery, params, (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching IoT readings', error: err.message });
      }
      res.json(results);
    });
  });
};

export const createIoTDevice = (req, res) => {
  const { device_name, device_type, serial_number, smme_id, location, installation_date, status } = req.body;
  const userId = req.user.id;

  // Verify SMME belongs to user
  const smmeQuery = 'SELECT id FROM smme WHERE id = ? AND user_id = ?';
  db.query(smmeQuery, [smme_id, userId], (err, smmeResults) => {
    if (err) {
      return res.status(500).json({ message: 'Error verifying SMME', error: err.message });
    }
    if (smmeResults.length === 0) {
      return res.status(404).json({ message: 'SMME not found or not authorized' });
    }

    const query = `INSERT INTO iot_devices (device_name, device_type, serial_number, smme_id, location, installation_date, status)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(query, [device_name, device_type, serial_number, smme_id, location, installation_date, status || 'active'], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ message: 'Serial number already exists' });
        }
        return res.status(500).json({ message: 'Error creating IoT device', error: err.message });
      }
      res.status(201).json({
        id: result.insertId,
        device_name,
        device_type,
        serial_number,
        smme_id,
        location,
        installation_date,
        status: status || 'active'
      });
    });
  });
};

export const updateIoTDevice = (req, res) => {
  const { id } = req.params;
  const { device_name, device_type, serial_number, location, installation_date, status } = req.body;
  const userId = req.user.id;

  const query = `
    UPDATE iot_devices d
    LEFT JOIN smme s ON d.smme_id = s.id
    SET d.device_name = ?, d.device_type = ?, d.serial_number = ?, d.location = ?, d.installation_date = ?, d.status = ?
    WHERE d.id = ? AND s.user_id = ?
  `;

  db.query(query, [device_name, device_type, serial_number, location, installation_date, status, id, userId], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Serial number already exists' });
      }
      return res.status(500).json({ message: 'Error updating IoT device', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'IoT device not found or not authorized' });
    }
    res.json({ message: 'IoT device updated successfully' });
  });
};

export const deleteIoTDevice = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const query = `
    DELETE d FROM iot_devices d
    LEFT JOIN smme s ON d.smme_id = s.id
    WHERE d.id = ? AND s.user_id = ?
  `;

  db.query(query, [id, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting IoT device', error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'IoT device not found or not authorized' });
    }
    res.json({ message: 'IoT device deleted successfully' });
  });
};
