# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies first (better for caching)
COPY package*.json ./

# Install dependencies
RUN npm install next@latest react@latest react-dom@latest

# Copy all files from the host to the working directory in the container
COPY . .

# Build the application
RUN npm run build

# Expose the default port used by Next.js
EXPOSE 3000

# Command to run the application in development mode
CMD ["npm", "run", "dev"]
