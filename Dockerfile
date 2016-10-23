FROM node:argon

# Create app directory
RUN mkdir -p /usr/src/app/babel
WORKDIR /usr/src/app/babel

COPY . .

# Install app dependencies
RUN npm install --production

# Setup environment
ENV WEPLAY_REDIS_URI "redis:$REDIS_PORT_6379_TCP_PORT"
ENV WEPLAY_IO_URL "http://io:$IO_PORT_8081_TCP_PORT"

# Run
CMD [ "node", "index.js" ]