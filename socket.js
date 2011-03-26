(function() {
  var blinky, counter, ghosts, http, io, pacman, pinky, redis, redisClient, server, socket;
  http = require('http');
  io = require('socket.io');
  redis = require('redis');
  redisClient = redis.createClient();
  redisClient.on('error', function(err) {
    return console.log('Error' + err);
  });
  server = http.createServer();
  server.listen(8080);
  socket = io.listen(server);
  pacman = {
    type: 'location',
    x: 450,
    y: 150,
    sprite: 'pacman'
  };
  blinky = {
    x: 10,
    y: 60
  };
  pinky = {
    x: 10,
    y: 30
  };
  ghosts = ['clyde', 'inky', 'blinky', 'pinky'];
  counter = 0;
  socket.on('connection', function(client) {
    var getSprite, ghost;
    getSprite = function(name) {
      return redisClient.get(name, function(error, data) {
        if (!data) {
          return;
        }
        console.log(error);
        console.log(JSON.parse(data));
        data = JSON.parse(data);
        return client.send({
          type: 'location',
          sprite: name,
          x: data.x,
          y: data.y
        });
      });
    };
    ghost = ghosts.pop();
    console.log(ghost);
    client.send({
      type: 'ghost',
      name: ghost
    });
    client.broadcast({
      type: 'newghost'
    });
    client.on('message', function(message) {
      console.log(message);
      switch (message.type) {
        case 'location':
          redisClient.set(message.ghost, JSON.stringify({
            x: message.x,
            y: message.y
          }));
          return client.broadcast({
            type: 'location',
            sprite: message.ghost,
            x: message.x,
            y: message.y
          });
        case 'win':
          client.broadcast({
            type: 'win',
            ghost: ghost
          });
          return client.send({
            type: 'win',
            ghost: ghost
          });
      }
    });
    return client.on('disconnect', function() {
      console.log('disconnected');
      ghosts.push(ghost);
      console.log('resetting' + ghost);
      return client.broadcast({
        type: 'location',
        sprite: ghost,
        x: -100,
        y: -100
      });
    });
  });
}).call(this);
