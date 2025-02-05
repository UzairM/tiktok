FROM node:18-alpine

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

EXPOSE 3000

CMD ["npm", "run", "dev"] 