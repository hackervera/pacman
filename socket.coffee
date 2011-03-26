http = require 'http'
io = require 'socket.io'
redis = require 'redis'
redisClient = redis.createClient()
redisClient.on 'error', (err)->
	console.log 'Error' + err
server = http.createServer()
server.listen 8080
socket = io.listen server



pacman =
	type: 'location'
	x: 450
	y: 150
	sprite: 'pacman'
blinky =
	x: 10
	y: 60
pinky =
	x: 10
	y: 30
	
ghosts = ['clyde','inky','blinky','pinky']
counter = 0
socket.on 'connection', (client)->
	getSprite = (name)->
		redisClient.get name, (error, data)->
			return if not data
			console.log error
			console.log JSON.parse data
			data = JSON.parse data
	
			client.send
				type:'location'
				sprite: name
				x: data.x
				y: data.y
	ghost = ghosts.pop()
	console.log ghost			
	client.send
		type: 'ghost'
		name: ghost
	client.broadcast
		type: 'newghost'
	

	
	client.on 'message', (message)->
		console.log message
		switch message.type
			when 'location'
				redisClient.set message.ghost, JSON.stringify
					x: message.x
					y: message.y
				client.broadcast
					type: 'location'
					sprite: message.ghost
					x: message.x
					y: message.y	
		
			when 'win'
				client.broadcast
					type: 'win'
					ghost: ghost
				client.send
					type: 'win'
					ghost: ghost
	
	client.on 'disconnect', ->
		console.log 'disconnected'
		ghosts.push ghost
		console.log 'resetting' + ghost
		client.broadcast
			type: 'location'
			sprite: ghost
			x: -100
			y: -100
		