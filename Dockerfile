FROM node:22-alpine

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install all dependencies (including tsx for running typescript server directly)
RUN npm install

# Copy application source
COPY . .

# Run build for static assets
RUN npm run build

# Expose standard production port
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Start server using tsx
CMD ["npm", "start"]
