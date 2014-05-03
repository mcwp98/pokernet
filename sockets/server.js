

var express = require('express')
  , http = require('http')
  , app = express()
  , server = app.listen(8081)
  , io = require('socket.io').listen(server)
  , Table = require('./table.js')
  , Player = require('./player.js');

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/test.html');
});

var tables = [];

// let's create an initial table
var testTable = new Table(10, 1000, 20000, io);
var MapofTables = {};
io.sockets.on('connection', function (socket) {
  
  /**** Connect to a table ******/
  // for now, connect to test table, only two players to start, no midgame join
  //blind, limit, buyIn, io)
  
  socket.on('connectToServer', function(data) {
    	console.log(data);
    if (data.tableId in MapofTables) {
    	console.log("TABLE EXISTS");
    } else {
    	console.log("TABLE DOES NOT EXIST");
    	MapofTables[data.tableId] = new Table(data.tableBlind,data.tableLimit,data.moneyToUse,io);
    }
    
    // create a new player
    var player = new Player(socket.id, data.money);
    player.setName(data.name);
    player.setTableID(testTable);
    
    // add player to the table
    testTable.addPlayer(player);
    
    // send player their socket id and blind
    socket.emit('alert', {text: "Welcome, " + player.name});
    socket.emit('pid', {pid: socket.id, blind: testTable.getBlind()});
    
    // show everyone we entered the table
    testTable.showPlayer(socket.id);
    // let me know who is in the table
    testTable.showPlayers(socket.id);
    
  });
  
  // start the game
  socket.on('start', function() {
    io.sockets.emit('alert', {text: "Game has begun"});
    testTable.startGame();
  });
  
  // route bets into the table
  socket.on('bet', function(data) {
      testTable.takeBet(data);
  });
  
  // let's handle user messaging here for now
  socket.on('chat', function(data) {
      io.sockets.emit('chat', data);
  });
  
});


