# Use the official Node.js image from Docker Hub
FROM node:22

# Create a directory for the application
WORKDIR /app

# Copy package.json and package-lock.json to the app directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
