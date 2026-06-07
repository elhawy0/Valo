# Valo - AI Video Generation Tool

🎬 Generate stunning videos using AI - Text to Video, Image to Video, and Multiple Images to Video

## Features

✨ Three powerful video generation modes:
- Text to Video - Generate videos from text prompts
- Image to Video - Animate still images into videos
- Multiple Images to Video - Create videos from image sequences

🚀 Technology Stack:
- Node.js + TypeScript + Express
- PostgreSQL + Prisma ORM
- Bull + Redis for job queues
- Replicate API integration
- Docker & Docker Compose

## Quick Start

```bash
# Clone repo
git clone https://github.com/elhawy0/Valo.git
cd Valo

# Setup
cp .env.example .env
# Edit .env and add REPLICATE_API_TOKEN

# Docker
docker-compose up -d
docker exec valo-app npm run prisma:migrate

# Visit http://localhost:3000/health
```

## API Endpoints

### Text to Video
```bash
POST /api/videos/text-to-video
{"textPrompt": "A beautiful sunset", "style": "cinematic"}
```

### Image to Video
```bash
POST /api/videos/image-to-video
{"imageUrl": "https://...", "textPrompt": "Make it move"}
```

### Multiple Images to Video
```bash
POST /api/videos/multiple-images-to-video
{"imageUrls": ["url1", "url2", "url3"]}
```

### Get Status
```bash
GET /api/videos/:jobId
```

### List Videos
```bash
GET /api/videos
```

## Project Structure

```
valo/
├── src/
│   ├── index.ts
│   ├── config/
│   ├── routes/
│   ├── services/
│   ├── types/
│   └── utils/
├── prisma/
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Commands

```bash
npm run dev              # Development
npm run build            # Build
npm start                # Production
npm run prisma:migrate   # Database
npm run prisma:studio    # Prisma UI
```

## License

MIT - Made with ❤️ by Elhawy