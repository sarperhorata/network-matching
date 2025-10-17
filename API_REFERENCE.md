# Oniki.net API Reference

## 📖 Complete API Documentation

**Interactive Swagger Documentation:** http://localhost:3001/api/docs

---

## 🔐 Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Get JWT Token

After login or registration, you'll receive an `access_token`. Use it in subsequent requests.

---

## 📋 API Endpoints Summary

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login user |
| GET | `/api/auth/me` | ✅ | Get current user profile |
| GET | `/api/auth/google` | ❌ | OAuth with Google (ready) |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/:id` | ✅ | Get user by ID |
| PUT | `/api/users/profile` | ✅ | Update own profile |
| POST | `/api/users/upload-photo` | ✅ | Upload profile/banner photo |
| GET | `/api/users/:id/matches` | ✅ | Get user's matches |

### Events

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/events` | ❌ | All | List published events (paginated) |
| GET | `/api/events/:id` | ❌ | All | Get event details |
| POST | `/api/events` | ✅ | Organizer | Create new event |
| PUT | `/api/events/:id` | ✅ | Organizer | Update event |
| DELETE | `/api/events/:id` | ✅ | Organizer | Delete event |
| POST | `/api/events/:id/join` | ✅ | All | Join event |
| POST | `/api/events/:id/check-in` | ✅ | All | Check-in to event (QR code) |
| GET | `/api/events/:id/participants` | ✅ | All | Get event participants |
| POST | `/api/events/:id/approve/:participantId` | ✅ | Organizer | Approve participant |
| POST | `/api/events/:id/reject/:participantId` | ✅ | Organizer | Reject participant |
| GET | `/api/events/:id/qr-code` | ❌ | All | Generate QR code for event |

### Matches

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/matches/generate` | ✅ | Generate AI matches for event |
| GET | `/api/matches/user/:userId` | ✅ | Get user's matches |
| GET | `/api/matches/event/:eventId` | ✅ | Get event matches |
| GET | `/api/matches/recommendations/:userId` | ✅ | Get personalized recommendations |
| PUT | `/api/matches/:matchId/status` | ✅ | Update match status |

### Messages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/messages` | ✅ | Get user's conversations |
| POST | `/api/messages` | ✅ | Send message |
| PUT | `/api/messages/:id` | ✅ | Update message (mark as read) |
| GET | `/api/messages/conversation/:user1/:user2` | ✅ | Get conversation history |
| GET | `/api/messages/unread-count/:userId` | ✅ | Get unread message count |

**WebSocket Events** (namespace: `/messages`)
- `send_message` → `new_message` | `message_sent`
- `mark_as_read` → `message_read` | `message_marked_read`
- `typing_start` → `user_typing`
- `typing_stop` → `user_typing`

### Meetings

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/meetings` | ✅ | Get user's meetings |
| GET | `/api/meetings/:id` | ✅ | Get meeting details |
| POST | `/api/meetings` | ✅ | Create meeting |
| PUT | `/api/meetings/:id` | ✅ | Update meeting |
| DELETE | `/api/meetings/:id` | ✅ | Delete meeting |
| POST | `/api/meetings/:id/accept` | ✅ | Accept meeting request |
| POST | `/api/meetings/:id/decline` | ✅ | Decline meeting request |
| POST | `/api/meetings/:id/complete` | ✅ | Mark meeting as completed |
| GET | `/api/meetings/:id/calendar-link` | ✅ | Get iCal calendar link |

### Analytics

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/analytics/user/:userId` | ✅ | All | Get user analytics |
| GET | `/api/analytics/event/:eventId` | ✅ | All | Get event analytics |
| GET | `/api/analytics/organizer/:organizerId` | ✅ | Organizer | Get organizer analytics |

---

## 🔍 Detailed Endpoint Examples

### 1. Authentication

#### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "participant",
  "company": "Tech Corp",
  "position": "Software Engineer",
  "industries": ["Technology", "Finance"],
  "interests": ["Artificial Intelligence", "Blockchain", "Web Development"],
  "networkingGoals": ["Find Business Partners", "Knowledge Sharing"],
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "twitterUrl": "https://twitter.com/johndoe"
}
```

**Success Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwic3ViIjoiNTUwZTg0MDAtZTI5Yi00MWQ0LWE3MTYtNDQ2NjU1NDQwMDAwIiwicm9sZSI6InBhcnRpY2lwYW50IiwiZmlyc3ROYW1lIjoiSm9obiIsImlhdCI6MTY5NzU1OTYwMCwiZXhwIjoxNjk4MTY0NDAwfQ.example_signature",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "participant",
    "company": "Tech Corp",
    "position": "Software Engineer"
  }
}
```

**Error Responses:**
- `409 Conflict`: Email already exists
- `400 Bad Request`: Invalid input data

---

#### POST /api/auth/login

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "participant"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials

---

#### GET /api/auth/me

Get current authenticated user's profile.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "role": "participant",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Tech Corp",
  "position": "Software Engineer",
  "bio": "Passionate about technology and networking",
  "profilePhoto": "https://storage.oniki.net/uploads/profile.jpg",
  "bannerPhoto": "https://storage.oniki.net/uploads/banner.jpg",
  "industries": ["Technology", "Finance"],
  "interests": ["Artificial Intelligence", "Blockchain"],
  "networkingGoals": ["Find Business Partners"],
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "twitterUrl": "https://twitter.com/johndoe",
  "isActive": true,
  "isEmailVerified": false,
  "createdAt": "2025-10-17T10:00:00.000Z",
  "updatedAt": "2025-10-17T12:30:00.000Z"
}
```

---

### 2. Events

#### GET /api/events?page=1&limit=10

Get paginated list of published events.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Success Response (200):**
```json
{
  "events": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "AI & Blockchain Summit 2025",
      "description": "Join us for the biggest tech networking event of the year",
      "organizerId": "550e8400-e29b-41d4-a716-446655440002",
      "startDate": "2025-11-15T18:00:00.000Z",
      "endDate": "2025-11-15T21:00:00.000Z",
      "location": "Istanbul Tech Hub",
      "address": "Maslak Mahallesi, Sarıyer",
      "city": "Istanbul",
      "country": "Turkey",
      "categories": ["Technology Conference", "Networking Mixer"],
      "coverImage": "https://storage.oniki.net/uploads/event-cover.jpg",
      "capacity": 100,
      "status": "published",
      "isPublic": true,
      "requiresApproval": false,
      "createdAt": "2025-10-10T10:00:00.000Z",
      "updatedAt": "2025-10-10T10:00:00.000Z"
    }
  ],
  "total": 50,
  "totalPages": 5
}
```

---

#### POST /api/events/:id/join

Join an event as a participant.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "message": "Looking forward to networking at this event!"
}
```

**Success Response (201):**
```json
{
  "id": "participant-uuid",
  "eventId": "event-uuid",
  "userId": "user-uuid",
  "status": "approved",
  "hasCheckedIn": false,
  "joinedAt": "2025-10-17T12:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Already joined / Event full / Event not available
- `404 Not Found`: Event not found

---

### 3. Matches

#### POST /api/matches/generate

Generate AI-powered matches for an event or user.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Success Response (201):**
```json
{
  "matches": [
    {
      "user1Id": "550e8400-e29b-41d4-a716-446655440000",
      "user2Id": "550e8400-e29b-41d4-a716-446655440003",
      "score": 85,
      "reasons": [
        "2 shared industries",
        "4 shared interests",
        "2 shared goals"
      ]
    },
    {
      "user1Id": "550e8400-e29b-41d4-a716-446655440000",
      "user2Id": "550e8400-e29b-41d4-a716-446655440004",
      "score": 70,
      "reasons": [
        "1 shared industry",
        "3 shared interests"
      ]
    }
  ]
}
```

**Matching Algorithm Details:**
- **Industry Match**: 20 points per shared industry (max 40)
- **Interest Match**: 10 points per shared interest (max 30)
- **Goal Match**: 15 points per shared goal (max 30)
- **Total**: 0-100 score range

---

#### GET /api/matches/user/:userId

Get all matches for a specific user.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
[
  {
    "id": "match-uuid",
    "user1Id": "user-uuid-1",
    "user2Id": "user-uuid-2",
    "eventId": "event-uuid",
    "score": 75,
    "status": "accepted",
    "matchReasons": {
      "reasons": ["2 shared industries", "3 shared interests"]
    },
    "createdAt": "2025-10-17T12:00:00.000Z",
    "user1": {
      "id": "user-uuid-1",
      "firstName": "John",
      "lastName": "Doe",
      "company": "Tech Corp"
    },
    "user2": {
      "id": "user-uuid-2",
      "firstName": "Jane",
      "lastName": "Smith",
      "company": "Innovation Labs"
    }
  }
]
```

---

### 4. Messages

#### POST /api/messages

Send a new message.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "receiverId": "550e8400-e29b-41d4-a716-446655440003",
  "content": "Hi! I saw we matched at the Tech Summit. Would you like to grab coffee?",
  "eventId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Success Response (201):**
```json
{
  "id": "message-uuid",
  "senderId": "550e8400-e29b-41d4-a716-446655440000",
  "receiverId": "550e8400-e29b-41d4-a716-446655440003",
  "eventId": "550e8400-e29b-41d4-a716-446655440001",
  "content": "Hi! I saw we matched at the Tech Summit. Would you like to grab coffee?",
  "isRead": false,
  "readAt": null,
  "createdAt": "2025-10-17T14:30:00.000Z"
}
```

---

#### WebSocket Connection

**Connect to WebSocket:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/messages', {
  auth: {
    token: 'YOUR_JWT_TOKEN',
    userId: 'YOUR_USER_ID'
  }
});

// Send message
socket.emit('send_message', {
  receiverId: 'receiver-uuid',
  content: 'Hello!'
});

// Listen for new messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Listen for read receipts
socket.on('message_read', (data) => {
  console.log('Message read:', data);
});

// Typing indicators
socket.emit('typing_start', { receiverId: 'receiver-uuid' });
socket.emit('typing_stop', { receiverId: 'receiver-uuid' });

socket.on('user_typing', ({ userId, typing }) => {
  console.log(`${userId} is ${typing ? 'typing' : 'not typing'}`);
});
```

---

### 5. Meetings

#### POST /api/meetings

Schedule a new meeting.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Request Body:**
```json
{
  "participant1Id": "550e8400-e29b-41d4-a716-446655440000",
  "participant2Id": "550e8400-e29b-41d4-a716-446655440003",
  "eventId": "550e8400-e29b-41d4-a716-446655440001",
  "scheduledTime": "2025-11-16T14:00:00.000Z",
  "location": "Starbucks, Maslak",
  "notes": "Discuss potential partnership opportunities"
}
```

**Success Response (201):**
```json
{
  "id": "meeting-uuid",
  "participant1Id": "550e8400-e29b-41d4-a716-446655440000",
  "participant2Id": "550e8400-e29b-41d4-a716-446655440003",
  "eventId": "550e8400-e29b-41d4-a716-446655440001",
  "scheduledTime": "2025-11-16T14:00:00.000Z",
  "location": "Starbucks, Maslak",
  "notes": "Discuss potential partnership opportunities",
  "status": "pending",
  "createdAt": "2025-10-17T15:00:00.000Z",
  "updatedAt": "2025-10-17T15:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Meeting already exists / Not a participant
- `404 Not Found`: User or event not found

---

#### POST /api/meetings/:id/accept

Accept a meeting request.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "id": "meeting-uuid",
  "status": "confirmed",
  "participant1": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "participant2": {
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "scheduledTime": "2025-11-16T14:00:00.000Z"
}
```

---

### 6. Analytics

#### GET /api/analytics/user/:userId

Get comprehensive analytics for a user.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "eventsAttended": 5,
  "totalMatches": 23,
  "totalMeetings": 12,
  "messagesSent": 45,
  "messagesReceived": 38,
  "networkGrowth": 23
}
```

---

#### GET /api/analytics/event/:eventId

Get analytics for a specific event.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440001",
  "totalParticipants": 85,
  "checkInRate": 78.5,
  "matchingRate": 65.2,
  "meetingRate": 42.3,
  "totalMatches": 156,
  "totalMeetings": 66
}
```

**Metrics Explained:**
- `checkInRate`: Percentage of registered users who checked in
- `matchingRate`: Average matches per participant
- `meetingRate`: Percentage of matches that led to meetings

---

## 🧪 Testing the API

### Using cURL

```bash
# 1. Register
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}' \
  | jq -r '.access_token')

# 2. Get profile
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 3. Get events
curl -X GET http://localhost:3001/api/events?page=1&limit=10

# 4. Join event
curl -X POST http://localhost:3001/api/events/EVENT_ID/join \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Excited to join!"}'
```

### Using Swagger UI

1. Navigate to http://localhost:3001/api/docs
2. Click "Authorize" button
3. Enter your JWT token
4. Try any endpoint with pre-filled examples
5. See real-time responses

### Using Postman

Import the Swagger JSON:
```bash
http://localhost:3001/api/docs-json
```

Or use our Postman collection (coming soon).

---

## 📊 Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |

---

## 🔄 Workflow Examples

### Complete Event Participation Flow

```bash
# 1. Login
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.user.id')

# 2. Browse events
curl -X GET "http://localhost:3001/api/events?page=1&limit=10"

# 3. Join an event
EVENT_ID="your-event-uuid"
curl -X POST "http://localhost:3001/api/events/$EVENT_ID/join" \
  -H "Authorization: Bearer $TOKEN"

# 4. Generate matches for event
curl -X POST http://localhost:3001/api/matches/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"eventId\":\"$EVENT_ID\"}"

# 5. Get your matches
curl -X GET "http://localhost:3001/api/matches/user/$USER_ID" \
  -H "Authorization: Bearer $TOKEN"

# 6. Send message to a match
curl -X POST http://localhost:3001/api/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"receiverId":"match-user-uuid","content":"Hi! Nice to meet you!"}'

# 7. Schedule meeting
curl -X POST http://localhost:3001/api/meetings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participant1Id":"'$USER_ID'",
    "participant2Id":"match-user-uuid",
    "eventId":"'$EVENT_ID'",
    "scheduledTime":"2025-11-16T14:00:00.000Z",
    "location":"Coffee shop",
    "notes":"Discuss collaboration"
  }'

# 8. Check-in to event
curl -X POST "http://localhost:3001/api/events/$EVENT_ID/check-in" \
  -H "Authorization: Bearer $TOKEN"

# 9. Get analytics
curl -X GET "http://localhost:3001/api/analytics/user/$USER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔌 WebSocket Connection

### Messaging WebSocket

**Namespace:** `/messages`

**Connection:**
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/messages', {
  auth: {
    token: 'YOUR_JWT_TOKEN',
    userId: 'YOUR_USER_ID'
  }
});
```

**Events:**

| Event Name | Direction | Payload | Description |
|------------|-----------|---------|-------------|
| `connected` | Server → Client | `{ userId }` | Connection confirmed |
| `send_message` | Client → Server | `{ receiverId, content, eventId? }` | Send a message |
| `new_message` | Server → Client | `Message` | Receive new message |
| `message_sent` | Server → Client | `Message` | Confirmation of sent message |
| `mark_as_read` | Client → Server | `{ messageId }` | Mark message as read |
| `message_read` | Server → Client | `{ messageId, readBy }` | Message was read |
| `typing_start` | Client → Server | `{ receiverId }` | Start typing indicator |
| `typing_stop` | Client → Server | `{ receiverId }` | Stop typing indicator |
| `user_typing` | Server → Client | `{ userId, typing }` | User typing status |
| `error` | Server → Client | `{ message }` | Error occurred |

---

## 💡 Best Practices

### API Usage

1. **Always handle errors**: Check response status codes
2. **Use pagination**: For listing endpoints, use page/limit
3. **Cache responses**: Use ETags or local caching
4. **Rate limiting**: Be mindful of API rate limits (coming soon)
5. **WebSocket reconnection**: Implement reconnection logic

### Security

1. **Store JWT securely**: Use httpOnly cookies in production
2. **Validate input**: Always validate on frontend before sending
3. **Use HTTPS**: Never send credentials over HTTP in production
4. **Token expiration**: Handle token refresh (7 days default)
5. **Logout**: Clear tokens on logout

---

## 📞 Support

For API questions or issues:
- Check **[Swagger Documentation](http://localhost:3001/api/docs)**
- Review **[Getting Started Guide](GETTING_STARTED.md)**
- Contact development team

---

**Last Updated:** October 17, 2025  
**API Version:** 1.0.0  
**Swagger:** http://localhost:3001/api/docs

