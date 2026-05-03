# 🔄 SSE Logic Flow Visualization

## How JWT Authentication Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    JWT Authentication Flow                       │
└─────────────────────────────────────────────────────────────────┘

1️⃣  USER REGISTRATION/LOGIN
    │
    ├─ POST /auth/register
    │  └─ Username, Email, Password
    │
    ├─ AuthService.register()
    │  ├─ UserService.create() → Save to DB
    │  └─ generateToken() → Create JWT
    │
    └─ Response:
       ├─ access_token: "eyJhbGc..."
       └─ user: { id, username, email, role }

2️⃣  AUTHENTICATED REQUEST
    │
    ├─ Client sends:
    │  POST /cv
    │  Authorization: Bearer eyJhbGc...
    │
    ├─ JwtAuthGuard validates token
    │  ├─ Extract from Authorization header
    │  ├─ Verify signature with secret
    │  └─ Check expiration
    │
    ├─ JwtStrategy.validate() decodes payload
    │  └─ Returns user object: { userId, username, email, role }
    │
    └─ CurrentUser decorator injects user into route handler
       └─ CvController receives user context
```

## How SSE Persistence & Streaming Works

```
┌─────────────────────────────────────────────────────────────────┐
│              CV Operation Flow with Persistence                  │
└─────────────────────────────────────────────────────────────────┘

CREATE CV REQUEST
    │
    ├─ JwtAuthGuard validates JWT
    │  └─ Extract user: { userId: 2, username: "john", role: "user" }
    │
    ├─ CvController.create()
    │  └─ Call CvService.create(createCvDto, actor)
    │
    ├─ CvService.create()
    │  ├─ Create CV in database
    │  ├─ Call logOperation('CREATE', cv, actor, details)
    │  │
    │  └─ logOperation():
    │     ├─ Save to CvOperation table:
    │     │  ├─ operationType: 'CREATE'
    │     │  ├─ occurredAt: 2026-05-03 14:35:22
    │     │  ├─ actorId: 2
    │     │  ├─ actorUsername: 'john'
    │     │  ├─ actorRole: 'user'
    │     │  ├─ cvId: 45
    │     │  ├─ cvOwnerId: 2
    │     │  └─ details: { createdData: {...} }
    │     │
    │     └─ persistenceEvents.next(event)
    │        └─ Emit to all subscribed SSE clients
    │
    └─ Return CV to client

SSE STREAM FILTERING
    │
    ├─ Client A (Admin, userId: 1, role: 'admin')
    │  ├─ Subscribed to /cv/events
    │  ├─ Receives emitted event
    │  ├─ canAccessEvent(admin, event):
    │  │  ├─ Check: actor.role === 'admin' → TRUE
    │  │  └─ Return: TRUE (allow)
    │  └─ Sends to client A ✅
    │
    ├─ Client B (User 2, userId: 2, role: 'user')
    │  ├─ Subscribed to /cv/events
    │  ├─ Receives emitted event
    │  ├─ canAccessEvent(user2, event):
    │  │  ├─ Check: actor.role === 'admin' → FALSE
    │  │  ├─ Check: actor.userId === null → FALSE
    │  │  ├─ Check: event.cvOwnerId (2) === actor.userId (2) → TRUE
    │  │  └─ Return: TRUE (allow)
    │  └─ Sends to client B ✅
    │
    └─ Client C (User 3, userId: 3, role: 'user')
       ├─ Subscribed to /cv/events
       ├─ Receives emitted event
       ├─ canAccessEvent(user3, event):
       │  ├─ Check: actor.role === 'admin' → FALSE
       │  ├─ Check: actor.userId === null → FALSE
       │  ├─ Check: event.cvOwnerId (2) === actor.userId (3) → FALSE
       │  └─ Return: FALSE (filter out)
       └─ Does NOT send to client C ❌
```

## Real-Time Scenario Timeline

```
TIME    ACTION                          ADMIN SSE    USER2 SSE    USER3 SSE
────    ──────────────────────────────  ────────     ────────     ────────
00:00   Admin opens SSE stream          [listening]
00:05   User2 opens SSE stream                                     
00:10   User3 opens SSE stream                                     [listening]
00:15   User2 creates CV                [event ✅]   [event ✅]   [none ❌]
00:20   User2 updates CV                [event ✅]   [event ✅]   [none ❌]
00:25   User3 creates CV                [event ✅]   [none ❌]    [event ✅]
00:30   Admin deletes User2's CV        [event ✅]   [event ✅]   [none ❌]
00:35   Admin deletes User3's CV        [event ✅]   [none ❌]    [event ✅]
```

## GET /cv/:id Response Filtering

```
GET /cv/:id returns CV details (no filtering applied)
## Real-Time SSE Stream Filtering

```
SSE stream emits all operations to persistenceEvents Subject

## Data Flow: From Request to Event

```
┌──────────────────────────────────────────────────────────────────┐
│                   Complete Data Flow                              │
└──────────────────────────────────────────────────────────────────┘

HTTP Request Layer
└─ POST /cv
   ├─ Header: Authorization: Bearer JWT_TOKEN
   └─ Body: { name, firstname, age, Cin, Job, path, skillIds, userId }

Controller Layer
└─ CvController.create(@Body() dto, @CurrentUser() user)
   ├─ user = { userId: 2, username: "john", email: "john@example.com", role: "user" }
   └─ userToActor(user) → CvActorContext { userId: 2, username: "john", role: "user" }

Service Layer
└─ CvService.create(dto, actor)
   ├─ Save CV to database (Cv table)
   └─ logOperation('CREATE', cv, actor, details)

Persistence Layer
└─ CvOperationRepository.save(operation)
   ├─ Insert into cv_operation table
   └─ persistenceEvents.next(event)

Real-Time Layer
├─ Observable<MessageEvent> from persistenceEvents
├─ Filter by: canAccessEvent(currentUser, event)
└─ Send to HTTP Client via SSE

HTTP Response Layer
└─ SSE Message: 
   data: {"type":"cv-operation","data":{operationType:"CREATE",...}}

Database Result
├─ cv_operation #N inserted
└─ All subscribed clients receive event (if allowed)
```

## Key Data Structures

### CvActorContext (From JWT)
```typescript
{
  userId: 1,              // From JWT sub claim
  username: "admin_user", // From JWT username claim
  role: "admin"           // From JWT role claim
}
```

### CvOperation (Database Record)
```typescript
{
  id: 123,
  operationType: "CREATE",
  occurredAt: "2026-05-03T14:35:22.000Z",
  actorId: 1,
  actorUsername: "admin_user",
  actorRole: "admin",
  cvId: 45,
  cvOwnerId: 2,           // CRITICAL for filtering
  details: {
    createdData: {...},
    skillIds: [1, 2, 3],
    assignedUserId: 2
  }
}
```

### SSE Event Message
```json
{
  "type": "message",
  "data": {
    "type": "cv-operation",
    "data": {
      "id": 123,
      "operationType": "CREATE",
      "occurredAt": "2026-05-03T14:35:22.000Z",
      "actorId": 1,
      "actorUsername": "admin_user",
      "actorRole": "admin",
      "cvId": 45,
      "cvOwnerId": 2,
      "details": {...}
    }
  }
}
```

## Filtering Logic Flowchart

```
                    Event Emitted
                         │
                         ▼
         ┌──────────────────────────────┐
         │  canAccessEvent(actor, event) │
         └──────────────────────────────┘
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
    Is actor admin?             Is actor.userId null?
         │ YES                        │ YES
         ▼                            ▼
    ✅ ALLOW                     ❌ DENY
     (return true)               (return false)
                                     │ NO
                                     ▼
                    Does event.cvOwnerId === actor.userId?
                         │ YES           │ NO
                         ▼              ▼
                    ✅ ALLOW        ❌ DENY
                   (return true)   (return false)
```

## Testing Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│              Test Scenario Matrix                                │
└─────────────────────────────────────────────────────────────────┘

Scenario 1: Admin performs operation
├─ Admin creates CV owned by User2
├─ Admin SSE: ✅ Receives (role=admin)
└─ User2 SSE: ✅ Receives (cvOwnerId=2, userId=2)

Scenario 2: User performs own operation
├─ User2 creates CV owned by User2
├─ Admin SSE: ✅ Receives (role=admin)
├─ User2 SSE: ✅ Receives (cvOwnerId=2, userId=2)
└─ User3 SSE: ❌ Blocked (cvOwnerId=2 ≠ userId=3)

Scenario 3: User performs operation on other's CV
├─ User2 updates CV owned by User1
├─ Admin SSE: ✅ Receives (role=admin)
├─ User1 SSE: ✅ Receives (cvOwnerId=1, userId=1)
├─ User2 SSE: ❌ Blocked (cvOwnerId=1 ≠ userId=2)
└─ User3 SSE: ❌ Blocked (cvOwnerId=1 ≠ userId=3)
```

## Error Handling

```
Invalid JWT Token
└─ JwtAuthGuard rejects request
   └─ Response: 401 Unauthorized
      └─ User cannot access /cv/events
      └─ User cannot create/update/delete CV

Expired Token (> 24 hours)
└─ JwtStrategy.validate() fails
   └─ Response: 401 Unauthorized
      └─ User must login again

Missing Authorization Header
└─ JwtAuthGuard finds no token
   └─ Response: 401 Unauthorized
      └─ User must provide Bearer token

Malformed Token
└─ JwtService.verify() fails
   └─ Response: 401 Unauthorized
      └─ Token must be valid JWT format
```

## Performance Considerations

```
Database Indexes (Recommended)
├─ cv_operation(cvOwnerId) ← Fast filtering by user
├─ cv_operation(cvId) ← Fast lookup by CV
├─ cv_operation(occurredAt DESC) ← Fast sorting by time
└─ cv_operation(operationType) ← Fast filtering by type

Memory Usage (SSE)
├─ Each subscription holds reference in persistenceEvents Subject
├─ Filter logic runs for EVERY event
├─ Recommend: ~1000 concurrent subscriptions max
└─ Consider Redis pub/sub for horizontal scaling

Message Size
├─ Average event: ~500 bytes
├─ 1000 ops/day × 500 bytes = 500 KB/day
├─ Retention: ~30 days = ~15 MB/month
└─ Recommended: Archive to S3 after 90 days
```

