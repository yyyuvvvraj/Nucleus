# Use Node.js 20 base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose the backend port
EXPOSE 5001

# Start the application
CMD ["npm", "start"]
