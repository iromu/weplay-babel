'use strict';

const logger = require('weplay-common').logger('weplay-babel');
const cio = require('socket.io-client');
const forwarded = require('forwarded-for');
process.title = 'weplay-babel';
let url = process.env.WEPLAY_IO_URL || 'http://localhost:3001';

if ( !url.split(':')[2]) {
    url = url + 8081;
}
logger.info('io connecting to ', url);
const io = cio.connect(url);

const regex = new RegExp(/^(up|down|left|right|a|b|select|start)$/i);
const throttle = process.env.WEPLAY_IP_THROTTLE || 100;

// redis queries instance
const redis = require('weplay-common').redis();

const keys = {
    right: 0,
    left: 1,
    up: 2,
    down: 3,
    a: 4,
    b: 5,
    select: 6,
    start: 7
};


io.on('message', (msg, sender) => {
    redis.get(`weplay:move-last:${sender}`, (err, last) => {
        if (last) {
            last = last.toString();
            if (Date.now() - last < throttle) {
                return;
            }
        }
        redis.set(`weplay:move-last:${sender}`, Date.now());
        parse(msg, sender);
    });
});

function parse(msg, sender) {
    msg.split(' ')
        .filter(command => {
                const result = regex.exec(command);
                return result ? result[1] : false;
            }
        )
        .map(command => {
            logger.info('command ', command.toLowerCase());
            return command.toLowerCase()
        })
        .forEach(key => {
            logger.info('key ', key);
            broadcastMove(key, sender);
        });
}

// broadcast events and persist them to redis
function broadcast(sender) {
    redis.lpush('weplay:log', JSON.stringify(sender));
    redis.ltrim('weplay:log', 0, 20);
}

function broadcastMove(key, sender) {
    if (null == keys[key]) return;

    redis.publish('weplay:move', keys[key]);
    broadcast(sender, 'move', key);
}