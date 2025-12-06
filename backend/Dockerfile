# Use a lightweight Node image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose the port
EXPOSE 3000

# Start the server
CMD ["node", "src/server.js"]