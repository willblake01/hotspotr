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
   - `REDIS_URL` - Redis connection URL
   - `REACT_APP_GOOGLE_API_KEY` - Google Maps API key
   - Database credentials

### Development

```bash
npm run dev
```

This runs both the Express server and React client in development mode.

### Testing

```bash
npm test
```

### Production

```bash
npm run build
npm start
```

## Security

This application implements multiple security measures including:
- Bcrypt password hashing (salt level 8)
- Redis-backed sessions with HttpOnly cookies
- Input validation on all authentication endpoints
- Protection against session hijacking
- Password logging prevention

For detailed security information, see [docs/SECURITY.md](docs/SECURITY.md).

## License

MIT

