# Use Node.js LTS version
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

# Install dependencies
RUN npm cache clean --force && \
    npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 5000

# Start the app
CMD [ "npm", "start" ] 