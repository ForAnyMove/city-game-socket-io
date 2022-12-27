const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('../client/'));
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/../client/index.html');
});


io.sockets.on('connection', function(socket){
	socket.userData = { x:0, y:0, z:0, heading:0 };//Default values;
 
	console.log(`${socket.id} connected`);
	socket.emit('setId', { id:socket.id });
	
    socket.on('disconnect', function(){
		console.log(`Player ${socket.id} disconnected`)
		socket.broadcast.emit('deletePlayer', { id: socket.id });
    });	
	
	socket.on('init', function(data){
		console.log(`socket.init ${data.model}`);
		socket.userData.model = data.model;
		socket.userData.colour = data.colour;
		socket.userData.x = data.x;
		socket.userData.y = data.y;
		socket.userData.z = data.z;
		socket.userData.heading = data.h;
		socket.userData.pb = data.pb,
		socket.userData.action = "Idle";
	});
	
	socket.on('update', function(data){
    // console.log(io.sockets.sockets, 'neeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
		socket.userData.x = data.x;
		socket.userData.y = data.y;
		socket.userData.z = data.z;
		socket.userData.heading = data.h;
		socket.userData.pb = data.pb,
		socket.userData.action = data.action;
	});
	
	socket.on('chat message', function(data){
		console.log(`chat message:${data.id} ${data.message}`);
		io.to(data.id).emit('chat message', { id: socket.id, message: data.message });
	})
});

// io.sockets.on('connection', function(socket){
 
// 	socket.on('chat message', function(msg){
//     console.log(msg);
//     socket.broadcast.emit('chat message', msg)
//   })
	
//     socket.on('disconnect', function(){
// 		socket.broadcast.emit('deletePlayer', { id: socket.id });
//     });	
// });

http.listen(3000, function(){
  console.log('listening on *:3000');
});

setInterval(function(){
	const nsp = io.of('/');
    let pack = [];
    io.emit('remoteData', Array.from(io.sockets.sockets).map(el => {
      el[1].userData.id = el[0]
     return el[1].userData
    }))
    for(let id in io.sockets.sockets){
        const socket = nsp.connected[id];
		//Only push sockets that have been initialised
		if (socket.userData.model!==undefined){
			pack.push({
				id: socket.id,
				model: socket.userData.model,
				colour: socket.userData.colour,
				x: socket.userData.x,
				y: socket.userData.y,
				z: socket.userData.z,
				heading: socket.userData.heading,
				pb: socket.userData.pb,
				action: socket.userData.action
			});    
		}
    }
	if (pack.length>0) {
    io.emit('remoteData', pack);
    console.log(pack);
  }
}, 40);