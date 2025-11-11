# GreenGP Backend

A Node.js backend API using Express and MySQL for the GreenGP application.

## Features

- User registration and login with JWT authentication
- MySQL database integration
- CORS support
- Environment variable configuration

## Project Structure

```
backend/
├── config/
│   └── dbConfig.js          # Database configuration
├── controllers/
│   └── userController.js    # User-related controllers
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   └── userRoutes.js        # User routes
├── services/
│   └── userService.js       # User services (business logic)
├── .env                     # Environment variables
├── createTables.sql         # Database schema
├── package.json             # Dependencies and scripts
├── server.js                # Main server file
└── README.md                # This file
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up the database:
   - Start XAMPP and ensure MySQL is running
   - Run the SQL script in `createTables.sql` to create the database and tables

3. Configure environment variables in `.env`:
   - Update `DB_PASSWORD` with your MySQL root password
   - Adjust other settings as needed

4. Start the server:
   ```
   npm run dev
   ```

The server will run on `http://localhost:5000`

## API Endpoints

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (requires authentication)

## Technologies Used

- Node.js
- Express.js
- MySQL2
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests
