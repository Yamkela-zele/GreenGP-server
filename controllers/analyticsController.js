import db from '../config/dbConfig.js';

export const getDashboardStats = (req, res) => {
  const userId = req.user.id;

  // Get SMME count
  const smmeQuery = 'SELECT COUNT(*) as total_smme FROM smme WHERE user_id = ?';

  // Get IoT devices count
  const iotQuery = `
    SELECT COUNT(*) as total_devices FROM iot_devices d
    LEFT JOIN smme s ON d.smme_id = s.id
    WHERE s.user_id = ?
  `;

  // Get active devices count
  const activeDevicesQuery = `
    SELECT COUNT(*) as active_devices FROM iot_devices d
    LEFT JOIN smme s ON d.smme_id = s.id
    WHERE s.user_id = ? AND d.status = 'active'
  `;

  // Get recent readings count (last 24 hours)
  const recentReadingsQuery = `
    SELECT COUNT(*) as recent_readings FROM iot_readings r
    LEFT JOIN iot_devices d ON r.device_id = d.id
    LEFT JOIN smme s ON d.smme_id = s.id
    WHERE s.user_id = ? AND r.timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
  `;

  Promise.all([
    new Promise((resolve, reject) => db.query(smmeQuery, [userId], (err, result) => err ? reject(err) : resolve(result[0]))),
    new Promise((resolve, reject) => db.query(iotQuery, [userId], (err, result) => err ? reject(err) : resolve(result[0]))),
    new Promise((resolve, reject) => db.query(activeDevicesQuery, [userId], (err, result) => err ? reject(err) : resolve(result[0]))),
    new Promise((resolve, reject) => db.query(recentReadingsQuery, [userId], (err, result) => err ? reject(err) : resolve(result[0])))
  ]).then(([smmeResult, iotResult, activeResult, readingsResult]) => {
    res.json({
      total_smme: smmeResult.total_smme,
      total_devices: iotResult.total_devices,
      active_devices: activeResult.active_devices,
      recent_readings: readingsResult.recent_readings
    });
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: err.message });
  });
};

export const getPerformanceTrends = (req, res) => {
  const userId = req.user.id;
  const { timeRange = '30d' } = req.query;

  // Parse time range
  let days = 30;
  if (timeRange === '7d') days = 7;
  else if (timeRange === '90d') days = 90;

  const query = `
    SELECT
      DATE(r.timestamp) as date,
      COUNT(r.id) as reading_count,
      AVG(r.value) as avg_value
    FROM iot_readings r
    LEFT JOIN iot_devices d ON r.device_id = d.id
    LEFT JOIN smme s ON d.smme_id = s.id
    WHERE s.user_id = ? AND r.timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
    GROUP BY DATE(r.timestamp)
    ORDER BY date DESC
  `;

  db.query(query, [userId, days], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching performance trends', error: err.message });
    }
    res.json(results);
  });
};

export const getLocationAnalytics = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT
      s.location,
      COUNT(s.id) as smme_count,
      COUNT(d.id) as device_count,
      AVG(r.value) as avg_reading
    FROM smme s
    LEFT JOIN iot_devices d ON s.id = d.smme_id
    LEFT JOIN iot_readings r ON d.id = r.device_id
    WHERE s.user_id = ?
    GROUP BY s.location
    ORDER BY smme_count DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching location analytics', error: err.message });
    }
    res.json(results);
  });
};

export const getSectorAnalytics = (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT
      s.sector,
      COUNT(DISTINCT s.id) as smme_count,
      COUNT(d.id) as device_count,
      AVG(r.value) as avg_reading
    FROM smme s
    LEFT JOIN iot_devices d ON s.id = d.smme_id
    LEFT JOIN iot_readings r ON d.id = r.device_id
    WHERE s.user_id = ?
    GROUP BY s.sector
    ORDER BY smme_count DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching sector analytics', error: err.message });
    }
    res.json(results);
  });
};

export const getImpactMetrics = (req, res) => {
  const userId = req.user.id;

  // Calculate various impact metrics
  const energySavingsQuery = `
    SELECT
      SUM(CASE WHEN r.reading_type = 'energy' THEN r.value ELSE 0 END) as total_energy_savings,
      AVG(CASE WHEN r.reading_type = 'efficiency' THEN r.value ELSE NULL END) as avg_efficiency
    FROM iot_readings r
    LEFT JOIN iot_devices d ON r.device_id = d.id
    LEFT JOIN smme s ON d.smme_id = s.id
    WHERE s.user_id = ? AND r.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  `;

  const carbonReductionQuery = `
    SELECT
      SUM(CASE WHEN r.reading_type = 'carbon' THEN r.value ELSE 0 END) as total_carbon_reduction
    FROM iot_readings r
    LEFT JOIN iot_devices d ON r.device_id = d.id
    LEFT JOIN smme s ON d.smme_id = s.id
    WHERE s.user_id = ? AND r.timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  `;

  Promise.all([
    new Promise((resolve, reject) => db.query(energySavingsQuery, [userId], (err, result) => err ? reject(err) : resolve(result[0]))),
    new Promise((resolve, reject) => db.query(carbonReductionQuery, [userId], (err, result) => err ? reject(err) : resolve(result[0])))
  ]).then(([energyResult, carbonResult]) => {
    res.json({
      energy_savings: energyResult.total_energy_savings || 0,
      avg_efficiency: energyResult.avg_efficiency || 0,
      carbon_reduction: carbonResult.total_carbon_reduction || 0,
      period: '30 days'
    });
  }).catch(err => {
    res.status(500).json({ message: 'Error fetching impact metrics', error: err.message });
  });
};
