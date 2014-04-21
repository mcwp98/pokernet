

var express = require('express')
  , http = require('http')
  , app = express()
  , server = app.listen(80)
  , io = require('socket.io').listen(server)
  , Table = require('./table.js')
  , Player = require('./player.js');

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/test.html');
});

var tables = [];

// let's create an initial table
var testTable = new Table(10, 1000, 20000, io);

io.sockets.on('connection', function (socket) {
  
  /**** Connect to a table ******/
  // for now, connect to test table, only two players to start, no midgame join
  
  socket.on('connectToServer', function(data) {
    //console.log("Adding " + data.name + " to table " + testTable.blind);
  
    var player = new Player(socket.id, data.money);
    player.setName(data.name);
    player.setTableID(testTable);
    
    testTable.addPlayer(player);
    
    // welcome them, alert them to their balance, and current players
    socket.emit('alert', {text: "Welcome, " + player.name});
    socket.emit('pid', {pid: socket.id, blind: testTable.getBlind()});
        
    // Can't start yet, tell the man we're waiting
    if (testTable.numPlayers < 2) {
        socket.emit('alert', { text: 'we need more players'});
        console.log("waiting for more players");
    } 
    else {    // We've got at least 2, let's start the game
        testTable.startGame();
        // let every know the game has started
        io.sockets.emit('alert', {text: "Game started!!"});
    }
    
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


