# Auth App

A full-stack authentication application with React frontend and Express backend.

## Project Structure

```
auth-app/
├── frontend/          # React frontend application
├── backend/           # Express backend API
└── render.yaml        # Render deployment configuration
```

## Local Development

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your configuration:
   - Set up a PostgreSQL database
   - Generate a secure JWT_SECRET
   - Configure email settings (optional)

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on http://localhost:5001

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will run on http://localhost:3001

## Deployment

### Deploy to Render

1. Push your code to GitHub

2. Connect your GitHub repository to Render

3. Deploy using the `render.yaml` blueprint:
   - This will create both frontend and backend services
   - A PostgreSQL database will be provisioned automatically

4. After deployment, update the environment variables:
   - Update `FRONTEND_URL` in the backend service
   - Update `REACT_APP_API_URL` in the frontend service

### Deploy to GitHub Pages (Frontend Only)

For static frontend hosting:

1. Update `package.json` in frontend:
   ```json
   "homepage": "https://yourusername.github.io/auth-app"
   ```

2. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

3. Add deploy scripts to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5001)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `EMAIL_USER` - Gmail address for sending emails (optional)
- `EMAIL_PASS` - Gmail app-specific password (optional)
- `FRONTEND_URL` - Frontend URL for CORS

### Frontend (.env)
- `PORT` - Development server port (default: 3001)
- `REACT_APP_API_URL` - Backend API URL

## Security Features

- Password hashing with bcrypt
- JWT authentication
- CORS configuration
- Security headers
- Environment variable separation
- SQL injection protection
- XSS protection

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify/:token` - Email verification
- `GET /api/auth/me` - Get current user (protected)

## Technologies Used

### Backend
- Node.js & Express
- PostgreSQL
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for emails
- CORS for cross-origin requests

### Frontend
- React
- React Router for navigation
- Axios for API calls
- Context API for state management
