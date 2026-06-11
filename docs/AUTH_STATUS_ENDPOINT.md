# /auth/status Endpoint Documentation

## Overview

The `/auth/status` endpoint is used by the React client to rehydrate the Redux authentication state on page refresh. This ensures that logged-in users remain authenticated when they refresh the page.

## Endpoint Details

**Method:** `GET`  
**Path:** `/auth/status`  
**Authentication Required:** No

## Behavior

Returns the current user from `req.user` if the request is authenticated, or `null` if not authenticated.

### Key Differences from `/auth/user`

| Feature | `/auth/status` | `/auth/user` (legacy) |
|---------|----------------|----------------------|
| Unauthenticated response | `200 { user: null }` | `401 { error: 'Not authenticated' }` |
| Use case | Redux state rehydration | Explicit auth check |
| Returns | Always 200 | 200 for authenticated, 401 for unauthenticated |

## Responses

### Authenticated Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Unauthenticated Response

**Status Code:** `200 OK`

**Body:**
```json
{
  "user": null
}
```

## Client Implementation

The React client uses this endpoint in two places:

### 1. Dashboard Component (Protected Route)

On component mount, checks authentication status and redirects to `/` if not authenticated:

```javascript
useEffect(() => {
  getCurrentUser().then((user) => {
    if (user) {
      dispatch(setUser(user));
      setIsAuthenticated(true);
    } else {
      navigate('/', { replace: true });
    }
    setIsLoading(false);
  });
}, [dispatch, navigate]);
```

### 2. Landing Page (Public Route)

On component mount, checks if user is already authenticated and redirects to dashboard:

```javascript
useEffect(() => {
  getCurrentUser().then((user) => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  });
}, [navigate]);
```

## Why This Matters

Without `/auth/status`, the following issue occurs:

1. User logs in successfully → Redux state updated with user data
2. User refreshes page → Redux state is reset
3. Client doesn't know if user is authenticated
4. User appears logged out until they interact with a protected route
5. Poor user experience and potential security confusion

With `/auth/status`:

1. User logs in successfully → Redux state updated with user data
2. User refreshes page → Redux state is reset
3. **Client immediately calls `/auth/status` on mount**
4. **Redux state is rehydrated with user data**
5. User remains logged in → Great user experience!

## Security Considerations

- **No authentication required** - This endpoint must be accessible without authentication to detect logged-out state
- **Session-based** - Uses `req.user` from Passport.js session
- **No sensitive data** - Returns only safe user fields (no passwords)
- **Consistent with CORS** - Uses same session cookies as other endpoints

## Testing

### Unit Test

```javascript
describe('GET /auth/status', () => {
  it('should return user null when not authenticated', async () => {
    const response = await request(app)
      .get('/auth/status')
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toBeNull();
  });
});
```

### Manual Testing

**Unauthenticated request:**
```bash
curl http://localhost:3001/auth/status
# Response: {"user":null}
```

**Authenticated request:**
```bash
# First login to get a session cookie
curl -c cookies.txt -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Then check status with the session cookie
curl -b cookies.txt http://localhost:3001/auth/status
# Response: {"user":{"id":1,"email":"user@example.com","firstName":"John","lastName":"Doe"}}
```

## Related Endpoints

- `POST /auth/login` - Authenticate user and create session
- `POST /auth/logout` - End user session
- `POST /auth/signup` - Create new user account
- `GET /auth/user` - Legacy endpoint (use `/auth/status` for state rehydration)

## Migration Notes

If you were previously using `/auth/user`, consider migrating to `/auth/status` for state rehydration use cases, as it:

1. Returns consistent 200 status codes (easier to handle in client)
2. Explicitly designed for the "check if authenticated" use case
3. Returns `{ user: null }` instead of throwing 401 errors
4. Better developer experience when debugging

Keep using `/auth/user` if you need to:
- Explicitly check for authentication failures (401 status)
- Distinguish between "not authenticated" and "request error"

