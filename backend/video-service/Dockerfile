FROM node:18-alpine

# Install FFmpeg and other dependencies
RUN apk add --no-cache ffmpeg

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# Create config directory
RUN mkdir -p src/config

# Copy service account
COPY src/config/serviceAccount.json src/config/

# Ensure node_modules is preserved


EXPOSE 3000

CMD ["npm", "run", "dev"] 