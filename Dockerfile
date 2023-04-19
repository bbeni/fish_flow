# Use the official Node.js image as the base image
FROM node:14

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json into the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application files into the working directory
COPY . .

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["node", "app.js"]
