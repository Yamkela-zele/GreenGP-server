-- Create database
CREATE DATABASE IF NOT EXISTS greengp;

-- Use the database
USE greengp;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  role VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create smme table
CREATE TABLE IF NOT EXISTS smme (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sector VARCHAR(100),
  location VARCHAR(255),
  contact_person VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  registration_date DATE,
  status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create iot_devices table
CREATE TABLE IF NOT EXISTS iot_devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_name VARCHAR(255) NOT NULL,
  device_type VARCHAR(100),
  serial_number VARCHAR(255) UNIQUE,
  smme_id INT,
  location VARCHAR(255),
  installation_date DATE,
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  last_reading TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (smme_id) REFERENCES smme(id) ON DELETE CASCADE
);

-- Create iot_readings table
CREATE TABLE IF NOT EXISTS iot_readings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id INT,
  reading_type VARCHAR(100),
  value DECIMAL(10,2),
  unit VARCHAR(50),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES iot_devices(id) ON DELETE CASCADE
);

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  report_type VARCHAR(100),
  generated_by INT,
  parameters JSON,
  file_path VARCHAR(500),
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (generated_by) REFERENCES users(id)
);

-- Create case_studies table
CREATE TABLE IF NOT EXISTS case_studies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  smme_id INT,
  sector VARCHAR(100),
  impact_metrics JSON,
  content TEXT,
  author_id INT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (smme_id) REFERENCES smme(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Create analytics_cache table for performance
CREATE TABLE IF NOT EXISTS analytics_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cache_key VARCHAR(255) UNIQUE,
  data JSON,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample user (optional)
-- INSERT INTO users (fullName, email, password, organization, role, phone) VALUES ('Admin User', 'admin@example.com', '$2a$10$examplehashedpassword', 'Bit by Bit Solutions', 'admin', '+27123456789');
