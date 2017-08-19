FROM iromu/weplay-common:latest

# Create app directory
RUN mkdir -p /usr/src/app/babel
WORKDIR /usr/src/app/babel

COPY . .

# Install app dependencies
RUN yarn --production
RUN yarn link weplay-common

# Setup environment
ENV NODE_ENV production
ENV WEPLAY_REDIS_URI "redis:6379"
ENV WEPLAY_IO_URL "http://io:8081"
ENV WEPLAY_LOGSTASH_URI "logstash:5001"

# Run
CMD [ "node", "index.js" ]
