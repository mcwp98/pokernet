var viewControl = require('./gameVieControl');
/*** Client side of the game ****/

var players = [];
var numPlayers = 0;
var myId = "";
var allowBet = false;
var myCurrentBet = 0;
var tableCurrentBet = 0;
var blind = 0;
var myCards = [];
var tableCards = [];
var pot = moneyToUse;
var handPot = 0;

var socket = io.connect('127.0.0.1:80');
socket.on('connect', function() {
    socket.emit('connectToServer', {name: playerName, money: pot});
    viewControl = new viewControl();
    /**** game control *****/
    // use this to push game along, only one will do this

    /**** send events *****/

    // submit a bet
    $('#betSend').click(function() {
        var betAmt = parseInt($('#betAmt').val());
        betAmt += myCurrentBet;
        // bad bet, try again
        if  ((betAmt % blind) != 0 || betAmt < blind || betAmt < tableCurrentBet) {
            $("#chatBox").append("<p style='color:red'>System: invalid bet. must be at least the blind, or the current highest bet. May only be in incriments of the blind.</p>");
            return;
        }
        
        // this will put you under
        
        myCurrentBet = betAmt;
        pot -= myCurrentBet;
        socket.emit('bet', {player: myId, amount:betAmt});
        
        
    });
    
    // submit a fold

    /*** listen events ****/
    // we have a winner
    socket.on('winner', function(data) {
        pot += handPot;
        console.log("I win");
    });
    
    // set my player id
    socket.on('pid', function(data) {
        myId = data.pid;
        blind = data.blind;
    });
    
    // get a new opponent, add to array by playerID
    socket.on('getPlayer', function(data) {
        // make sure you aren't getting yourself
        if (data.id == myId) return;
        numPlayers++;
        console.log("player id " + data.id);
        players[numPlayers] = new oppPlayer(data.id, data.bank, data.name, (numPlayers));
        players[numPlayers].updatePlayer();
    });

    // recieve the hand
    socket.on('getHand', function(data) {
        myCards = data;
        $("#handContainer").text(myCards);
    });
    
    // recieve a card, show it
    socket.on('card', function(data) {
        // if we're getting cards, reset bets
        tableCurrentBet = 0;
        myCurrentBet = 0;
        var i;
        for (player in players) {
            console.log(player);
            players[player].setBet2(0);
        }
        if (tableCards) {
            tableCards[tableCards.length] = data.card.toString();
            console.log(data.card.toString());
            $('#card' + tableCards.length).append("<p style='color:blue'>" + tableCards[tableCards.length-1] + "</p>");
        } else {
            tableCards[0] = data.card;
            $('#card' + tableCards.length).append("<p style='color:blue'>" + tableCards[0] + "</p>");
        }
        
    });
        
    
    // someone is betting
    socket.on('betting', function(data) {
        //its us, show the bet input
        if (data.pid == myId) {
            $('#betBox').show();
            return;
        }
        // its them, update bet status
        for (player in players) {
            if (players[player].id == data.pid) {
                players[player].betting = true;
                players[player].updatePlayer();
            }
        }
        
    });
    
    // someone sent their bet
    socket.on('bet', function(data) {
        //if its us, we know that
        handPot += data.amount;
        tableCurrentBet = data.amount;
        $('#potContainer').text(handPot);
        if (data.player == myId) {
            console.log("Here" + data.player);
            myCurrentBet = data.amount;
            $('#betBox').hide();
            $('#betContainer').text(tableCurrentBet);
            $('#tableBetContainer').text(tableCurrentBet);
            $("#chatBox").append("<p style='color:blue'>Bet: you bet " + data.amount + ".</p>");
            return;
        }
        // set their bet
        for (var i = 1; i < numPlayers+1; i++) {
            if (players[i].id == data.player) {
                players[i].setBet(data.amount);
                
                $("#chatBox").append("<p style='color:blue'>Bet: " + players[i].name + " bets " + data.amount + ".</p>");
            }
        }

    });

    /**** message board *****/
    socket.on('chat', function(data) {
        $("#chatBox").append("<p>" + data.name + ": " + data.text + "</p>");
    });

    $('#chatSend').click(function() {
        var string = $('#chatText').val();
        socket.emit('chat', {text: string, name: playerName});
    });
    
    socket.on('alert', function(data) {
        $("#chatBox").append("<p style='color:red'>System: " + data.text + "</p>");
    });
});


// let's define a structure for opponent players
function oppPlayer(playerID, money, name, label) {
    this.id = playerID;
    this.bank = money;
    this.name = name;
    this.bet = 0;
    this.total = 0;
    this.label = label;
    this.betting = false;
}

// update the player views
oppPlayer.prototype.updatePlayer = function() {
    if (this.betting) $('#op' + this.label).css("border:2px solid yellow");
    $('#op' + this.label + '-name').text(this.name);
    $('#op' + this.label + '-bank').text(this.bank);
    $('#op' + this.label + '-bet').text(this.bet);
    $('#op' + this.label + '-tot').text(this.total);
    $('#betContainer').text(myCurrentBet);
    $('#tableBetContainer').text(tableCurrentBet);
    
}

// update the player bet, total, bank
oppPlayer.prototype.setBet = function(amt) {
    tableCurrentBet = amt;
    this.bet = amt;
    this.total += amt;
    this.bank -= amt;
    this.updatePlayer();
    this.betting = false;
}

oppPlayer.prototype.setBet2 = function(amt) {
    this.bet = amt;
}


