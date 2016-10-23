
# weplay-babel

Small script that parses client chat messages to emulator commands and broadcasts it.

## How to install

```bash
$ npm install
```

And run it with the following ENV vars:

- `WEPLAY_REDIS` - redis uri (`localhost:6379`)
- `WEPLAY_IO_URL` - io server url (`http://localhost:3001`)
- `WEPLAY_IP_THROTTLE` - the least amount of time in ms that need to
  pass between moves from the same IP address (`100`)


```bash
$ node index
```

## License

MIT
