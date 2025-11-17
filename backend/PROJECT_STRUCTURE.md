# NoteHive Backend Project Structure

```
backend/
├── server.js                 # Main server file with Express & Socket.io setup
├── package.json              # Dependencies and scripts
├── .env                      # Environment variables (not in git)
├── .gitignore                # Git ignore rules
│
├── config/                   # Configuration files
│   ├── db.js                 # MongoDB connection
│   └── settings.js           # App settings and environment variables
│
├── models/                   # Mongoose models (MongoDB schemas)
│   ├── User.js               # User model with JWT methods
│   ├── Note.js               # Note model with text search indexes
│   ├── StudyGroup.js         # Study group model
│   ├── File.js               # File metadata model
│   └── CollaborationSession.js # Real-time collaboration sessions
│
├── controllers/              # Request handlers (business logic)
│   ├── userController.js     # User registration, login, profile
│   ├── noteController.js     # CRUD operations for notes
│   ├── groupController.js    # Study group management
│   ├── fileController.js     # File upload/download/delete
│   └── searchController.js   # Search functionality
│
├── routes/                   # API route definitions
│   ├── userRoutes.js         # /api/users endpoints
│   ├── noteRoutes.js         # /api/notes endpoints
│   ├── groupRoutes.js        # /api/groups endpoints
│   ├── fileRoutes.js         # /api/files endpoints
│   ├── searchRoutes.js       # /api/search endpoints
│   └── zoomRoutes.js         # /api/zoom endpoints
│
├── middleware/               # Custom middleware
│   ├── authMiddleware.js     # JWT authentication & authorization
│   └── uploadMiddleware.js   # File upload handling (multer)
│
├── services/                 # Business logic services
│   ├── collaborationService.js # Real-time collaboration logic
│   └── zoomService.js        # Zoom API integration
│
├── utils/                    # Utility functions (optional)
│   └── (helpers, validators, etc.)
│
├── uploads/                  # Uploaded files directory
│   └── (PDFs, images, etc.)
│
└── Documentation/
    ├── README.md
    ├── SETUP.md
    ├── QUICKSTART.md
    └── ZOOM_SETUP_GUIDE.md
```

## API Endpoints

### Authentication (`/api/users`)
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user (returns JWT)
- `GET /api/users/me` - Get current user (protected)
- `PUT /api/users/me` - Update profile (protected)

### Notes (`/api/notes`)
- `GET /api/notes` - Get all notes (with filters)
- `POST /api/notes` - Create new note (protected)
- `GET /api/notes/:id` - Get single note (protected)
- `PUT /api/notes/:id` - Update note (protected)
- `DELETE /api/notes/:id` - Delete note (protected)
- `POST /api/notes/:id/collaborators` - Add collaborator (protected)

### Study Groups (`/api/groups`)
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create group (protected)
- `GET /api/groups/:id` - Get single group (protected)
- `POST /api/groups/:id/join` - Join group (protected)
- `POST /api/groups/:id/invite` - Invite user (protected)

### Files (`/api/files`)
- `GET /api/files` - Get all files
- `POST /api/files/upload` - Upload file (protected)
- `GET /api/files/:id/download` - Download file (protected)
- `DELETE /api/files/:id` - Delete file (protected)

### Search (`/api/search`)
- `GET /api/search` - Global search (notes, files, groups)
- `GET /api/search/notes` - Search notes
- `GET /api/search/files` - Search files

### Zoom (`/api/zoom`)
- `POST /api/zoom/create-meeting` - Create Zoom meeting (protected)

## Real-time Collaboration (Socket.io)

### Events:
- `join-note` - Join a note for collaboration
- `note-edit` - Send note edits
- `cursor-move` - Update cursor position
- `leave-note` - Leave note room

### Server emits:
- `user-joined` - User joined note
- `note-updated` - Note content updated
- `cursor-updated` - Cursor position updated
- `user-left` - User left note

## Features Implemented

✅ **User Registration and Login (JWT)**
- Password hashing with bcrypt
- JWT token generation
- Protected routes with middleware

✅ **Create, Edit, and Organize Notes**
- Full CRUD operations
- Tags and subject organization
- Version history
- Edit tracking

✅ **Real-time Collaboration**
- Socket.io integration
- Multi-user editing
- Cursor tracking
- Active user management

✅ **Study Group Creation and Joining**
- Group management
- Member roles (admin/member)
- Invitation system
- Public/private groups

✅ **File/Resource Upload**
- PDF and image support
- File metadata storage
- Secure file serving
- Association with notes/groups

✅ **Search Notes**
- Text search with MongoDB indexes
- Tag-based filtering
- Subject filtering
- Global search across entities

✅ **Zoom Integration**
- Meeting creation
- Server-to-Server OAuth
- Meeting link generation

## Next Steps

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up MongoDB:**
   - Install MongoDB locally, or
   - Use MongoDB Atlas (cloud)
   - Update `MONGODB_URI` in `.env`

3. **Configure environment:**
   - Copy `.env.template` to `.env`
   - Add MongoDB URI
   - Add JWT secrets
   - Add Zoom credentials (optional)

4. **Start server:**
   ```bash
   npm start
   # or for development:
   npm run dev
   ```

5. **Test endpoints:**
   - Use Postman or curl
   - Test registration/login
   - Create notes, groups, upload files
   - Test real-time collaboration

## Database Indexes

The models include optimized indexes for:
- Fast email/username lookups (User)
- Text search (Note, File)
- Tag filtering (Note)
- Member lookups (StudyGroup)
- Collaboration sessions (TTL index)

## Security Features

- Password hashing (bcrypt)
- JWT authentication
- Helmet.js security headers
- Rate limiting
- File type validation
- File size limits
- CORS configuration

