'use strict';

var cio = require('socket.io-client');
var forwarded = require('forwarded-for');
process.title = 'weplay-babel';
var url = process.env.WEPLAY_IO_URL || 'http://localhost:3001';

if ( !url.split(':')[2]) {
    url = url + 8081;
}
console.log('io connecting to ', url);
var io = cio.connect(url);

const regex = new RegExp(/^(up|down|left|right|a|b|select|start)$/i);
var throttle = process.env.WEPLAY_IP_THROTTLE || 100;

// redis queries instance
var redis = require('./redis')();

var keys = {
    right: 0,
    left: 1,
    up: 2,
    down: 3,
    a: 4,
    b: 5,
    select: 6,
    start: 7
};


// send chat mesages
io.on('message', function (msg, sender) {
    redis.get('weplay:move-last:' + sender, function (err, last) {
        if (last) {
            last = last.toString();
            if (Date.now() - last < throttle) {
                return;
            }
        }
        redis.set('weplay:move-last:' + sender, Date.now());
        parse(msg, sender);
    });
});

function parse(msg, sender) {
    msg.split(' ')
        .filter(function (command) {
                var result = regex.exec(command);
                return result ? result[1] : false;
            }
        )
        .map(function (command) {
            console.log('command ', command.toLowerCase());
            return command.toLowerCase()
        })
        .forEach(function (key) {
            console.log('key ', key);
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