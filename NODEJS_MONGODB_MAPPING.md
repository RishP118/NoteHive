# Node.js + MongoDB Implementation Guide for NoteHive

## ✅ All Functionalities That Can Use Node.js + MongoDB

Based on your SRS, here's a comprehensive mapping of which features can be implemented with Node.js and MongoDB:

---

## 1. ✅ User Registration and Login (JWT-based authentication)

**Node.js Implementation:**
- ✅ Express.js for REST API endpoints
- ✅ `jsonwebtoken` package for JWT token generation/verification
- ✅ `bcrypt` for password hashing
- ✅ `express-validator` for input validation

**MongoDB Implementation:**
- ✅ Store user credentials in `users` collection
- ✅ Store JWT refresh tokens in `tokens` collection
- ✅ Index on `email` for fast login lookups
- ✅ Schema: `{ email, passwordHash, username, createdAt, role }`

**Example Collections:**
```javascript
// users collection
{
  _id: ObjectId,
  email: "user@example.com",
  passwordHash: "$2b$10$...",
  username: "john_doe",
  role: "user" | "admin",
  createdAt: ISODate,
  profile: { ... }
}

// refreshTokens collection
{
  _id: ObjectId,
  userId: ObjectId,
  token: "refresh_token_string",
  expiresAt: ISODate
}
```

---

## 2. ✅ Create, Edit, and Organize Notes

**Node.js Implementation:**
- ✅ Express.js REST API for CRUD operations
- ✅ Mongoose ODM for MongoDB schema modeling
- ✅ File upload handling with `multer`
- ✅ Rich text processing

**MongoDB Implementation:**
- ✅ `notes` collection for storing notes
- ✅ Embedded documents for tags, metadata
- ✅ Indexes on `userId`, `tags`, `title` for fast queries
- ✅ Version history in `noteVersions` collection (optional)

**Example Schema:**
```javascript
// notes collection
{
  _id: ObjectId,
  title: "Operating Systems - CPU Scheduling",
  content: "Rich text content...",
  userId: ObjectId("ref to users"),
  tags: ["OS", "Scheduling", "CS"],
  subject: "Operating Systems",
  createdAt: ISODate,
  updatedAt: ISODate,
  isPublic: false,
  attachments: [
    { filename: "diagram.pdf", url: "...", type: "pdf" }
  ],
  collaborators: [ObjectId("user1"), ObjectId("user2")]
}
```

---

## 3. ✅ Real-time Collaboration on Notes

**Node.js Implementation:**
- ✅ **Socket.io** (alternative to FastAPI WebSockets)
- ✅ Real-time document synchronization
- ✅ Operational Transform (OT) or CRDT algorithms
- ✅ Conflict resolution for concurrent edits

**MongoDB Implementation:**
- ✅ Store document state in `notes` collection
- ✅ `collaborationSessions` collection for active sessions
- ✅ `editHistory` collection for change tracking
- ✅ Atomic operations for conflict resolution

**Architecture:**
```javascript
// Using Socket.io for real-time
io.on('connection', (socket) => {
  socket.on('join-note', (noteId) => {
    socket.join(`note-${noteId}`);
  });
  
  socket.on('edit', (noteId, changes) => {
    // Apply changes to MongoDB
    // Broadcast to other users in room
    socket.to(`note-${noteId}`).emit('update', changes);
  });
});
```

**Collections:**
```javascript
// collaborationSessions collection
{
  _id: ObjectId,
  noteId: ObjectId,
  activeUsers: [ObjectId],
  lastActivity: ISODate
}

// editHistory collection (optional, for audit)
{
  _id: ObjectId,
  noteId: ObjectId,
  userId: ObjectId,
  changes: { ... },
  timestamp: ISODate
}
```

---

## 4. ✅ Study Group Creation and Joining

**Node.js Implementation:**
- ✅ Express.js REST API endpoints
- ✅ Group management logic
- ✅ Permission/role management
- ✅ Invitation system

**MongoDB Implementation:**
- ✅ `studyGroups` collection
- ✅ Embedded member list with roles
- ✅ `groupInvitations` collection
- ✅ Indexes on `members.userId` for fast lookups

**Example Schema:**
```javascript
// studyGroups collection
{
  _id: ObjectId,
  name: "CS301 Study Group",
  description: "Operating Systems study group",
  createdBy: ObjectId("ref to users"),
  members: [
    {
      userId: ObjectId,
      role: "admin" | "member",
      joinedAt: ISODate
    }
  ],
  notes: [ObjectId("ref to notes")],
  createdAt: ISODate,
  settings: {
    isPublic: false,
    allowInvites: true
  }
}

// groupInvitations collection
{
  _id: ObjectId,
  groupId: ObjectId,
  invitedBy: ObjectId,
  invitedUser: ObjectId,
  status: "pending" | "accepted" | "rejected",
  createdAt: ISODate,
  expiresAt: ISODate
}
```

---

## 5. ✅ File/Resource Upload (PDF/images)

**Node.js Implementation:**
- ✅ `multer` middleware for file uploads
- ✅ `sharp` for image processing/resizing
- ✅ File validation (type, size checks)
- ✅ Integration with cloud storage (AWS S3, Cloudinary) or local storage

**MongoDB Implementation:**
- ✅ Store file metadata in `files` collection
- ✅ Reference files in notes/groups
- ✅ GridFS for large files (>16MB) if needed
- ✅ Indexes on `uploadedBy`, `fileType`

**Example Schema:**
```javascript
// files collection
{
  _id: ObjectId,
  filename: "lecture_notes.pdf",
  originalName: "OS_Lecture_1.pdf",
  mimeType: "application/pdf",
  size: 2048576, // bytes
  url: "https://storage.../file.pdf",
  uploadedBy: ObjectId("ref to users"),
  uploadedAt: ISODate,
  associatedNote: ObjectId("ref to notes"), // optional
  associatedGroup: ObjectId("ref to studyGroups"), // optional
  tags: ["OS", "Lecture"]
}
```

---

## 6. ✅ Search Notes by Title, Tag, or Keyword

**Node.js Implementation:**
- ✅ Express.js search endpoints
- ✅ MongoDB text search queries
- ✅ Aggregation pipelines for complex searches
- ✅ Full-text search with MongoDB Atlas Search (optional)

**MongoDB Implementation:**
- ✅ Text indexes on `title`, `content`, `tags`
- ✅ Compound indexes for multi-field searches
- ✅ Aggregation framework for advanced queries
- ✅ MongoDB Atlas Search for full-text search (if using Atlas)

**Example Queries:**
```javascript
// Text search index
db.notes.createIndex({ 
  title: "text", 
  content: "text", 
  tags: "text" 
});

// Search query
db.notes.find({
  $text: { $search: "CPU scheduling" },
  userId: ObjectId("...")
});

// Tag-based search
db.notes.find({
  tags: { $in: ["OS", "Scheduling"] }
});

// Aggregation for complex search
db.notes.aggregate([
  { $match: { title: /scheduling/i } },
  { $lookup: { from: "users", ... } },
  { $sort: { updatedAt: -1 } }
]);
```

---

## 7. ✅ Additional Features from SRS

### Security Requirements
**Node.js:**
- ✅ `bcrypt` for password hashing
- ✅ `helmet` for security headers
- ✅ `express-rate-limit` for rate limiting
- ✅ JWT token expiration and refresh
- ✅ Input sanitization with `express-validator`

**MongoDB:**
- ✅ Encrypted connections (TLS/SSL)
- ✅ Role-based access control
- ✅ Field-level encryption (MongoDB Enterprise)
- ✅ Audit logging

### Performance Requirements
**Node.js:**
- ✅ Cluster mode for multi-core utilization
- ✅ Caching with Redis (optional)
- ✅ Connection pooling for MongoDB
- ✅ Async/await for non-blocking operations

**MongoDB:**
- ✅ Proper indexing strategy
- ✅ Sharding for horizontal scaling
- ✅ Replica sets for high availability
- ✅ Aggregation pipeline optimization

### Scalability
**Node.js:**
- ✅ Microservices architecture (optional)
- ✅ Load balancing with PM2 or Nginx
- ✅ Horizontal scaling

**MongoDB:**
- ✅ Sharding for distributed data
- ✅ Replica sets for read scaling
- ✅ Connection pooling

---

## 📊 Summary Table

| Functionality | Node.js | MongoDB | Implementation Complexity |
|--------------|---------|---------|----------------------------|
| User Auth (JWT) | ✅ Excellent | ✅ Excellent | Low |
| CRUD Notes | ✅ Excellent | ✅ Excellent | Low |
| Real-time Collaboration | ✅ Excellent (Socket.io) | ✅ Good | Medium-High |
| Study Groups | ✅ Excellent | ✅ Excellent | Medium |
| File Uploads | ✅ Excellent | ✅ Good (GridFS for large) | Medium |
| Search | ✅ Excellent | ✅ Excellent (Text indexes) | Medium |
| Security | ✅ Excellent | ✅ Good | Medium |
| Scalability | ✅ Excellent | ✅ Excellent | Medium-High |

---

## 🚀 Recommended Tech Stack

### Backend
- **Runtime:** Node.js (v16+)
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Real-time:** Socket.io
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer
- **Validation:** express-validator
- **Security:** helmet, bcrypt, express-rate-limit

### Database
- **Primary DB:** MongoDB
- **Caching (optional):** Redis
- **File Storage:** AWS S3 / Cloudinary / Local storage

### Deployment
- **Hosting:** AWS / Google Cloud / Heroku
- **Process Manager:** PM2
- **Database:** MongoDB Atlas (cloud) or self-hosted

---

## ⚠️ Note on FastAPI vs Node.js

Your SRS mentions **FastAPI** for real-time collaboration, but **Node.js with Socket.io** is equally capable and often preferred for:
- ✅ JavaScript/TypeScript consistency (if frontend is JS)
- ✅ Large ecosystem and community
- ✅ Excellent WebSocket support
- ✅ Better integration with MongoDB (native JS)

**Both are viable options**, but Node.js + MongoDB is a proven, scalable stack for this use case.

---

## 📝 Next Steps

1. Set up MongoDB database (local or Atlas)
2. Create Mongoose schemas for all collections
3. Implement Express.js API endpoints
4. Add Socket.io for real-time features
5. Implement file upload handling
6. Add search functionality with MongoDB indexes
7. Set up authentication middleware
8. Deploy and scale

---

## 🎯 Conclusion

**ALL functionalities in your SRS can be implemented with Node.js + MongoDB!**

This stack is:
- ✅ Production-ready
- ✅ Scalable
- ✅ Well-documented
- ✅ Has large community support
- ✅ Perfect for real-time collaboration
- ✅ Excellent for document-based data (notes)

You can build your entire NoteHive platform using Node.js and MongoDB!

