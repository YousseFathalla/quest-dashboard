# Docker Development Setup with Hot Reload 🔥

This guide shows you how to run the application in Docker with **hot-reload** enabled, so you can see your code changes instantly without rebuilding containers.

## Quick Start

### 1. Start Development Containers

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### 2. Stop Development Containers
```bash
docker-compose -f docker-compose.dev.yml down
```

### 3. Restart Development Containers
```bash
docker-compose -f docker-compose.dev.yml restart frontend
```

This will:
- ✅ Mount your local code as volumes (changes reflect immediately)
- ✅ Run Angular dev server on port **4200** (with hot-reload)
- ✅ Run Node.js backend with **nodemon** (auto-restarts on changes)
- ✅ Watch for file changes automatically

### 2. Access the Application

- **Frontend**: http://localhost:4200 (Angular dev server with hot-reload)
- **Backend**: http://localhost:3000 (WebSocket server)

### 3. Make Changes

Simply edit your code in your IDE:
- **Frontend changes** → Angular dev server automatically reloads
- **Backend changes** → Nodemon automatically restarts the server

**No need to rebuild or restart containers!** 🎉

## How It Works

### Volume Mounting
```yaml
volumes:
  - ./frontend:/app          # Your local code → container
  - /app/node_modules         # Preserve node_modules in container
```

### Frontend Hot Reload
- Uses `ng serve` with `--host 0.0.0.0` for Docker networking
- Angular dev server watches for file changes
- Browser automatically refreshes on save

### Backend Hot Reload
- Uses `nodemon` to watch `server.js` and dependencies
- Automatically restarts Node.js on file changes
- WebSocket connections reconnect automatically

## Development vs Production

| Feature | Development (`docker-compose.dev.yml`) | Production (`docker-compose.yml`) |
|--------|--------------------------------------|-----------------------------------|
| **Hot Reload** | ✅ Yes | ❌ No |
| **Build** | Development build | Production build |
| **Port** | 4200 (dev server) | 80 (nginx) |
| **Volumes** | Mounted (live code) | Copied (static) |
| **Use Case** | Local development | Deployment |

## Troubleshooting

### Changes Not Reflecting?

1. **Check volume mounts**:
   ```bash
   docker-compose -f docker-compose.dev.yml ps
   ```

2. **Verify file permissions**:
   ```bash
   # On Windows, ensure WSL2 or Docker Desktop has file sharing enabled
   ```

3. **Restart containers**:
   ```bash
   docker-compose -f docker-compose.dev.yml restart
   ```

### Port Already in Use?

If port 4200 or 3000 is already in use:

```yaml
# Edit docker-compose.dev.yml
ports:
  - "4201:4200"  # Use different host port
```

### Clear Everything and Start Fresh

```bash
# Stop and remove containers
docker-compose -f docker-compose.dev.yml down

# Remove volumes (optional)
docker-compose -f docker-compose.dev.yml down -v

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build
```

## Useful Commands

```bash
# Start in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f frontend
docker-compose -f docker-compose.dev.yml logs -f backend

# Stop containers
docker-compose -f docker-compose.dev.yml down

# Rebuild specific service
docker-compose -f docker-compose.dev.yml build frontend
docker-compose -f docker-compose.dev.yml up frontend
```

## Production Build

For production deployment, use the original compose file:

```bash
docker-compose up --build
```

This builds optimized production images with Nginx serving static files.

