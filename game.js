(function() {
  var blinky, canvas, checkCollision, checkWin, clear, clyde, ctx, direction, draw, ghost, i, inky, maze, movePac, mover, newGhost, newpac, pacLoc, pacman, pinky, randDir, reset, resetPac, socket;
  socket = new io.Socket(document.domain, {
    port: 8080
  });
  socket.connect();
  socket.on('connect', function() {
    return console.log('socket connected');
  });
  canvas = document.getElementById('board');
  ctx = canvas.getContext('2d');
  blinky = new Image();
  pacman = new Image();
  pinky = new Image();
  clyde = new Image();
  clyde.src = 'clyde.png';
  clyde.X = -100;
  clyde.Y = -100;
  clyde.name = 'clyde';
  inky = new Image();
  maze = new Image();
  maze.src = 'board.png';
  pacman.src = 'pacman.png';
  pacman.X = -100;
  pacman.Y = -200;
  inky.src = 'inky.png';
  inky.X = -100;
  inky.Y = -100;
  inky.name = 'inky';
  pinky.src = 'pinky.png';
  pinky.X = -100;
  pinky.Y = -100;
  pinky.name = 'pinky';
  console.log(pinky.X);
  blinky.src = 'blinky.gif';
  blinky.X = -100;
  blinky.Y = -100;
  blinky.name = 'blinky';
  direction = 'up';
  ghost = null;
  reset = function(ghost) {
    switch (ghost.name) {
      case 'blinky':
        ghost.X = 430;
        break;
      case 'pinky':
        ghost.X = 400;
        break;
      case 'inky':
        ghost.X = 460;
        break;
      case 'clyde':
        ghost.X = 490;
    }
    ghost.Y = 220;
    return socket.send({
      type: 'location',
      ghost: ghost.name,
      x: ghost.X,
      y: ghost.Y
    });
  };
  socket.on('message', function(message) {
    var banner, full, sprite;
    switch (message.type) {
      case 'location':
        sprite = eval(message.sprite);
        sprite.X = message.x;
        return sprite.Y = message.y;
      case 'ghost':
        ghost = eval(message.name);
        console.log(ghost);
        reset(ghost);
        if (ghost === pinky) {
          resetPac();
          setInterval(pacLoc, 10);
          setInterval(randDir, 500);
          return setInterval(movePac, 10);
        }
        break;
      case 'win':
        reset(ghost);
        if (ghost === pinky) {
          resetPac();
        }
        banner = $('#message');
        banner.html(message.ghost + ' wins!').show();
        return setTimeout((function() {
          return banner.hide();
        }), 5000);
      case 'full':
        full = $('#full');
        return full.html('Sorry, all ghosts are in use<br>Enjoy the show').show();
      case 'newghost':
        return socket.send({
          type: 'location',
          ghost: ghost.name,
          x: ghost.X,
          y: ghost.Y
        });
    }
  });
  resetPac = function() {
    pacman.X = 500;
    return pacman.Y = 300;
  };
  newpac = function() {
    var blah, foo, height, i, imgd, pix, val, width, _i, _len;
    console.log('newpac!');
    foo = null;
    blah = null;
    while (foo !== 1) {
      width = Math.floor(Math.random() * 1099) + 1;
      height = Math.floor(Math.random() * 373) + 1;
      imgd = ctx.getImageData(width, height, 30, 30);
      pix = imgd.data;
      i = 0;
      for (_i = 0, _len = pix.length; _i < _len; _i++) {
        val = pix[_i];
        if (pix[i] === 0) {
          foo = 1;
        }
        i += 4;
      }
    }
    pacman.X = width;
    pacman.Y = height;
    return [width, height];
  };
  newGhost = function(ghost) {
    var blah, foo, height, i, imgd, pix, val, width, _i, _len;
    foo = null;
    blah = null;
    while (foo !== 1) {
      width = Math.floor(Math.random() * 1099) + 1;
      height = Math.floor(Math.random() * 373) + 1;
      imgd = ctx.getImageData(width, height, 30, 30);
      pix = imgd.data;
      i = 0;
      for (_i = 0, _len = pix.length; _i < _len; _i++) {
        val = pix[_i];
        if (pix[i] === 0) {
          foo = 1;
        }
        i += 4;
      }
    }
    ghost.X = width;
    ghost.Y = height;
    return [width, height];
  };
  mover = function(event, ghost) {
    switch (event.keyCode) {
      case 39:
        if (checkCollision('right', ghost) !== true) {
          ghost.X += 10;
        }
        break;
      case 38:
        if (checkCollision('up', ghost) !== true) {
          ghost.Y -= 10;
        }
        break;
      case 37:
        if (checkCollision('left', ghost) !== true) {
          ghost.X -= 10;
        }
        break;
      case 40:
        if (checkCollision('down', ghost) !== true) {
          ghost.Y += 10;
        }
        break;
      case 87:
        ghost.Y -= 10;
        break;
      case 83:
        ghost.Y += 10;
        break;
      case 68:
        ghost.X += 10;
        break;
      case 65:
        ghost.X -= 10;
    }
    return socket.send({
      type: 'location',
      ghost: ghost.name,
      x: ghost.X,
      y: ghost.Y
    });
  };
  randDir = function() {
    switch (Math.floor(Math.random() * 4)) {
      case 0:
        return direction = 'left';
      case 1:
        return direction = 'right';
      case 2:
        return direction = 'up';
      case 3:
        return direction = 'down';
    }
  };
  movePac = function() {
    if (checkCollision(direction, pacman) === true) {
      return randDir();
    } else {
      switch (direction) {
        case 'left':
          return pacman.X -= 10;
        case 'right':
          return pacman.X += 10;
        case 'up':
          return pacman.Y -= 10;
        case 'down':
          return pacman.Y += 10;
      }
    }
  };
  pacLoc = function() {
    var ghosts;
    socket.send({
      type: 'location',
      ghost: 'pacman',
      x: pacman.X,
      y: pacman.Y
    });
    return ghosts = [blinky, pinky, inky, clyde];
  };
  checkWin = function() {
    if (Math.abs(ghost.X - pacman.X) < 35 && Math.abs(pacman.Y - ghost.Y) < 35) {
      return socket.send({
        type: 'win'
      });
    }
  };
  clear = function() {
    return canvas.width = canvas.width;
  };
  draw = function() {
    clear();
    if (ghost != null) {
      checkWin();
    }
    ctx.drawImage(maze, 0, 0);
    ctx.drawImage(pacman, pacman.X, pacman.Y, 30, 30);
    ctx.drawImage(blinky, blinky.X, blinky.Y, 30, 30);
    ctx.drawImage(pinky, pinky.X, pinky.Y, 30, 30);
    ctx.drawImage(inky, inky.X, inky.Y, 30, 30);
    return ctx.drawImage(clyde, clyde.X, clyde.Y, 30, 30);
  };
  checkCollision = function(direction, sprite) {
    var i, imgd, pix, val, x, y, _i, _len;
    switch (direction) {
      case 'up':
        x = sprite.X;
        y = sprite.Y - 10;
        break;
      case 'down':
        x = sprite.X;
        y = sprite.Y + 30;
        break;
      case 'left':
        x = sprite.X - 10;
        y = sprite.Y;
        break;
      case 'right':
        x = sprite.X + 30;
        y = sprite.Y;
    }
    imgd = ctx.getImageData(x, y, 10, 10);
    pix = imgd.data;
    i = 0;
    for (_i = 0, _len = pix.length; _i < _len; _i++) {
      val = pix[_i];
      if (pix[i] === 0) {
        return true;
      }
      i += 4;
    }
    return false;
  };
  setInterval(draw, 1);
  i = Math.floor(Math.random() * 2);
  window.addEventListener('keydown', (function(event) {
    return mover(event, ghost);
  }), false);
}).call(this);
