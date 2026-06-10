# HotSpotr
---
Location! Location! Location!

This is a Business Planning tool meant to replace the research necessary to identify a Target Market, conduct a Competitive Analysis, and find that perfect location.

View the deployed application https://hotspotr.herokuapp.com/

## Documentation

- **[Security Documentation](docs/SECURITY.md)** - Authentication, password management, session handling, and security best practices

## Getting Started

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- Redis (for session storage)
- MySQL (for database)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run installDeps
   ```

3. Configure environment variables:
   ```bash
   cp env.example .env
   cp config/config.example.js config/config.js
   cp ecosystem.config.example.js ecosystem.config.js
   ```

4. Set up your `.env` file with:
   - `SESSION_SECRET` - Random string for session encryption
   - `REDIS_URL` - Redis connection URL (default: `redis://localhost:6379`)
   - `REACT_APP_GOOGLE_API_KEY` - Google Maps API key
   - Database credentials (MySQL)

5. Run database migrations:
   ```bash
   npx sequelize-cli db:migrate
   ```

### Services Required

Make sure the following services are running:

```bash
# Redis (for session storage)
redis-server

# MySQL (for database)
mysql.server start  # macOS
# or
sudo service mysql start  # Linux
```

### Development

```bash
npm run dev
```

This runs both the Express server (port 3001) and React client (port 3000) in development mode.

### Testing

```bash
npm test
```

### Production

```bash
npm run build
npm start
```

## Features

### User Authentication
- **Email/Password authentication** with Passport.js
- **Optional name fields** - firstName and lastName can be provided during signup
- **Session persistence** - Users stay logged in across page refreshes
- **Secure password storage** - Bcrypt hashing with salt level 8
- **Redis-backed sessions** - Fast, scalable session management

### User Signup/Login
**Signup form includes:**
- First Name (optional)
- Last Name (optional)
- Email (required)
- Password (required, min 6 characters)

**Login form includes:**
- Email (required)
- Password (required)

### Dashboard Features
- Personalized welcome message with user's name or email
- Target industry selection
- Target location selection
- Demographics analysis
- Competition heatmap visualization
- Google Maps integration

## Database

### User Model Schema
```javascript
{
  id: INTEGER (primary key),
  firstName: STRING (optional, max 50 characters),
  lastName: STRING (optional, max 50 characters),
  localemail: STRING (required, unique, validated as email),
  localpassword: STRING (required, bcrypt hashed),
  createdAt: DATE,
  updatedAt: DATE
}
```

### Managing Migrations

Run migrations:
```bash
npx sequelize-cli db:migrate
```

Rollback last migration:
```bash
npx sequelize-cli db:migrate:undo
```

## API Endpoints

### Authentication
- `POST /signup` - Create new user account
- `POST /login` - Authenticate user
- `GET /logout` - End user session
- `GET /api/user/current` - Get current logged-in user info
- `GET /dashboard` - Check if user is authenticated

### Application
- `POST /call` - Google Places API search

## Security

This application implements multiple security measures including:
- **Bcrypt password hashing** (salt level 8)
- **Redis-backed sessions** with HttpOnly cookies
- **Input validation** on all authentication endpoints (express-validator)
- **Protection against session hijacking**
- **Password logging prevention** (bodyBlacklist in request logging)
- **Passwords never stored in client state** (Redux only stores safe user data)
- **CORS protection** with configurable origins
- **Separate validation rules** for login and signup

For detailed security information, see [docs/SECURITY.md](docs/SECURITY.md).

## Troubleshooting

### Common Issues

**Login 500 Error:**
- Ensure Redis is running: `redis-cli ping` should return `PONG`
- Check database connection settings in `.env`
- Verify all dependencies are installed

**User data undefined:**
- User data is loaded automatically on Dashboard mount
- Check browser console for API errors
- Verify `/api/user/current` endpoint is accessible

**Database migration errors:**
- Ensure MySQL is running
- Verify database credentials in `config/config.js`
- Check that `.sequelizerc` file exists in root directory

## Tech Stack

### Backend
- Node.js / Express
- Sequelize ORM
- MySQL database
- Redis (session store)
- Passport.js (authentication)
- Bcryptjs (password hashing)
- Express-validator (input validation)

### Frontend
- React
- Redux (state management)
- Material-UI (MUI)
- React Router
- Google Maps API
- Axios (HTTP client)

## License

MIT

