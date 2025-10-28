# Use Node 20 base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your project
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port and start the server
EXPOSE 3000
CMD ["npm", "start"]
