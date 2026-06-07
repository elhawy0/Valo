# Valo - Enterprise AI Video Generation Platform

🎬 Professional-grade AI video generation service with multi-modal capabilities

## ✨ Features

### Video Generation
- **Text to Video** - Generate high-quality videos from text prompts
- **Image to Video** - Animate still images with AI-powered motion
- **Multiple Images to Video** - Create seamless video sequences from image collections

### Enterprise Features
- 🔐 **Authentication & Authorization** - JWT-based user management
- 📊 **Analytics Dashboard** - Track video generation metrics and performance
- 🚀 **Job Queue System** - Asynchronous processing with Bull + Redis
- 💾 **Database Persistence** - PostgreSQL with Prisma ORM
- ⚡ **Caching Layer** - Redis-powered caching for optimal performance
- 📝 **Structured Logging** - Winston-based comprehensive logging
- 🛡️ **Error Handling** - Centralized error management
- 📈 **Rate Limiting** - Request throttling to prevent abuse
- 🔄 **Retry Logic** - Automatic job retry with exponential backoff

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Replicate API Token

### Setup

```bash
# Clone repository
git clone https://github.com/elhawy0/Valo.git
cd Valo

# Configure environment
cp .env.example .env
# Edit .env and add your REPLICATE_API_TOKEN

# Start with Docker
docker-compose up -d

# Run database migrations
docker exec valo-app npm run prisma:migrate

# Check health
curl http://localhost:3000/health
```

### Local Development

```bash
npm install
cp .env.example .env
# Configure .env

npm run dev
```

## 📚 API Documentation

### Authentication

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "secure-password"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGc...",
    "apiKey": "valo_key_..."
  }
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGc..."
  }
}
```

### Video Generation

All video endpoints require authentication:
```
Header: Authorization: Bearer <token>
```

#### Text to Video
```bash
POST /api/videos/text-to-video
Content-Type: application/json
Authorization: Bearer <token>

{
  "textPrompt": "A serene sunset over mountains",
  "style": "cinematic",
  "duration": 8,
  "fps": 30,
  "resolution": "1080p"
}

Response:
{
  "success": true,
  "data": {
    "id": "video_123",
    "jobId": "job_456",
    "status": "pending",
    "type": "text-to-video",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Image to Video
```bash
POST /api/videos/image-to-video
Content-Type: application/json
Authorization: Bearer <token>

{
  "imageUrl": "https://example.com/image.jpg",
  "textPrompt": "Make it move gracefully",
  "duration": 8,
  "fps": 30,
  "resolution": "720p"
}
```

#### Multiple Images to Video
```bash
POST /api/videos/multiple-images-to-video
Content-Type: application/json
Authorization: Bearer <token>

{
  "imageUrls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg"
  ],
  "duration": 8,
  "fps": 30,
  "resolution": "1080p"
}
```

#### Get Video Status
```bash
GET /api/videos/:videoId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": "video_123",
    "status": "completed",
    "videoUrl": "https://storage.example.com/video.mp4",
    "processingTime": 45000,
    "createdAt": "2024-01-01T00:00:00Z",
    "completedAt": "2024-01-01T00:00:45Z"
  }
}
```

#### List User Videos
```bash
GET /api/videos?limit=20&offset=0
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "videos": [ ... ],
    "total": 42,
    "limit": 20,
    "offset": 0
  }
}
```

#### Delete Video
```bash
DELETE /api/videos/:videoId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Video deleted successfully"
}
```

### Analytics

#### Get Summary
```bash
GET /api/analytics/summary?days=30
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "period": "Last 30 days",
    "totalVideos": 15,
    "successRate": "93.33",
    "averageProcessingTime": "32500.00",
    "videosByType": {
      "text-to-video": 8,
      "image-to-video": 5,
      "multiple-images-to-video": 2
    },
    "videosByResolution": {
      "720p": 10,
      "1080p": 5
    }
  }
}
```

## 🏗️ Project Structure

```
Valo/
├── src/
│   ├── index.ts                 # Application entry point
│   ├── config/
│   │   ├── database.ts          # Prisma connection
│   │   ├── redis.ts             # Redis setup
│   │   └── queue.ts             # Bull queue initialization
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication
│   │   ├── errorHandler.ts      # Error handling
│   │   ├── requestLogger.ts     # Request logging
│   │   └── rateLimiter.ts       # Rate limiting
│   ├── routes/
│   │   ├── videoRoutes.ts       # Video generation endpoints
│   │   ├── authRoutes.ts        # Authentication endpoints
│   │   └── analyticsRoutes.ts   # Analytics endpoints
│   ├── services/
│   │   ├── videoService.ts      # Video business logic
│   │   ├── videoProcessingService.ts  # Job processing
│   │   ├── authService.ts       # Authentication logic
│   │   ├── analyticsService.ts  # Analytics logic
│   │   └── cacheService.ts      # Caching utilities
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   └── utils/
│       └── logger.ts            # Winston logger setup
├── prisma/
│   └── schema.prisma            # Database schema
├── Dockerfile
├── docker-compose.yml
├── tsconfig.json
├── package.json
└── README.md
```

## 🛠️ Available Commands

```bash
# Development
npm run dev                 # Start development server with hot reload
npm run build              # Build TypeScript
npm start                  # Production mode

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio UI

# Docker
docker-compose up -d       # Start all services
docker-compose down        # Stop all services
docker-compose logs -f app # View app logs
```

## 🔧 Configuration

Key environment variables in `.env`:

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@host:5432/valo

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key

# Replicate API
REPLICATE_API_TOKEN=your-token
REPLICATE_TEXT_TO_VIDEO_MODEL=openai/text-to-video
```

## 📊 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Rate Limited
- `500` - Server Error

## 🚀 Performance Features

- **Async Processing** - Non-blocking video generation
- **Job Queuing** - Bull + Redis for reliable job management
- **Caching** - Redis-based response caching
- **Rate Limiting** - Prevent abuse with per-user rate limits
- **Database Indexing** - Optimized query performance
- **Connection Pooling** - Efficient resource management

## 🔐 Security

- JWT-based authentication
- Password hashing
- CORS protection
- Rate limiting
- Input validation
- Error message sanitization

## 📝 Logging

- Winston-based structured logging
- Separate error and combined logs
- Console output with colors
- Configurable log levels

## 📈 Monitoring

Watch job progress and queue status:

```bash
# View Redis data
docker exec valo-redis redis-cli

# View database
docker exec valo-app npm run prisma:studio

# View logs
docker compose logs -f app
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

Made with ❤️ by [Elhawy](https://github.com/elhawy0)

## 📧 Support

For issues, questions, and support contact: **bebom0736@gmail.com**

---

**Latest Update**: January 2024 - Enterprise Edition v2.0
