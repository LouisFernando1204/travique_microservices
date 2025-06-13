# Dockerfile 
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port (gunakan port 3000)
EXPOSE 3002

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3002

# Start the app
CMD ["node", "server.js"]