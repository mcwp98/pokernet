

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
var Table = require('./table.js');
// let's create an initial table
//var testTable = new Table(10, 1000, 20000, io);
var MapofTables = {};
io.sockets.on('connection', function (socket) {
  
  /**** Connect to a table ******/
  // for now, connect to test table, only two players to start, no midgame join
  //blind, limit, buyIn, io)
  
  socket.on('connectToServer', function(data) {
    	console.log(data);
    if (data.table in MapofTables) {
    	console.log("TABLE EXISTS");
    } else {
    	console.log("TABLE DOES NOT EXIST- CREATE TABLE");
    	MapofTables[data.table] = new Table(data.tableBlind,data.tableLimit,data.moneyToUse,io);
    }
    	console.log(MapofTables);
    var curTable= MapofTables[data.table]
    // create a new player
    var player = new Player(socket.id, data.money);
    player.setName(data.name);
    player.setTableID(curTable);
    
    // add player to the table
    curTable.addPlayer(player);
    
    // send player their socket id and blind
    socket.emit('alert', {text: "Welcome, " + player.name});
    socket.emit('pid', {table: data.table, pname:player.name,pid: socket.id, blind: curTable.getBlind()});
    
    // show everyone we entered the table
    curTable.showPlayer(socket.id);
    // let me know who is in the table
    curTable.showPlayers(socket.id);
    
  });
  
  // start the game
  socket.on('start', function(data) {
    curTable=MapofTables[data.table];
    curTable.startGame();
  });
  
  // route bets into the table
  socket.on('bet', function(data) {
      MapofTables[data.table].takeBet(data);
  });
  
  // let's handle user messaging here for now
  socket.on('chat', function(data) {
      io.sockets.emit('chat', data);
  });
  
});


