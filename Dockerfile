FROM node:7

# Create app directory
RUN mkdir -p /usr/src/app/babel
WORKDIR /usr/src/app/babel

COPY . .

# Install app dependencies
RUN npm install --production

# Setup environment
ENV NODE_ENV production
ENV WEPLAY_REDIS_URI "redis:6379"
ENV WEPLAY_IO_URL "http://io:$IO_PORT_8081_TCP_PORT"

# Run
CMD [ "node", "index.js" ]