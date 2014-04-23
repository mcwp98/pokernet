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
var limit;

var socket = io.connect('127.0.0.1:80');
socket.on('connect', function() {
    socket.emit('connectToServer', {name: playerName, money: pot});
    viewControl = new viewControl();
    /**** game control *****/
    // use this to push game along, only one will do this

    /**** send events *****/
    // start the game!
    $('#startGame').click(function() {
        socket.emit('start');
    });

    // submit a bet
    $('#betSend').click(function() {
        var betAmt = parseInt($('#betAmt').val());
        betAmt += myCurrentBet;
        
        // were checking
        if (betAmt == 0) {
            return;
        }
        
        // bad bet, try again
        if  ((betAmt % blind) != 0 || betAmt < blind || betAmt < tableCurrentBet) {
            viewControl.showMessage('System', 'Invalid bet');
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
        
        // add player and update views
        numPlayers++;
        players[numPlayers] = new oppPlayer(data.id, data.bank, data.name, (numPlayers));
        viewControl.addPlayer(numPlayers, data.name);
        viewControl.updateOpponent(numPlayers, data.bank, 0, 0);
    });

    // recieve the hand
    socket.on('getHand', function(data) {
        myCards = data;
        viewControl.showHand(myCards);
        viewControl.oppCardsHidden(numPlayers);
    });
    
    // recieve a card, show it
    socket.on('card', function(data) {
    
        // if we're getting cards, reset bets
        tableCurrentBet = 0;
        myCurrentBet = 0;
        viewControl.setTableBet(tableCurrentBet);
        viewControl.setMyBet(myCurrentBet);

        for (player in players) {
            players[player].setBet2(0);
            viewControl.updateOpponent(player, players[player].bank, 0, false);
        }

        tableCards[tableCards.length] = data.card.toString();
        viewControl.showCard(tableCards.length, tableCards[tableCards.length-1]);

    });
        
    
    // someone is betting
    socket.on('betting', function(data) {
        //its us, show the bet input
        if (data.pid == myId) {
            viewControl.showBet(handPot, tableCurrentBet, blind, limit);
            return;
        }
        // its them, update bet status
        for (player in players) {
            if (players[player].id == data.pid) {
                players[player].betting = true;
                viewControl.oppBetting(player);
                players[player].updatePlayer();
            }
        }
        
    });
    
    // someone sent their bet
    socket.on('bet', function(data) {

        // set the pot and current bet
        handPot += data.amount;
        tableCurrentBet = data.amount;
        
        // display them
        viewControl.setPot(handPot);
        viewControl.setTableBet(tableCurrentBet);
        
        // is it us?
        if (data.player == myId) {
            myCurrentBet = data.amount;
            viewControl.setMyBet(myCurrentBet);
            viewControl.hideBet();
            viewControl.showMessage('Bet', "you bet " + data.amount);
            return;
        }
        // set their bet
        for (var i = 1; i < numPlayers+1; i++) {
            if (players[i].id == data.player) {
                players[i].setBet(data.amount);
                players[i].betting = false;
                viewControl.oppNotBetting(i);
                viewControl.showMessage('Bet', players[i].name + " bets " + data.amount);
            }
        }

    });

    /**** message board *****/
    socket.on('chat', function(data) {
        viewControl.showMessage(data.name, data.text);
    });

    $('#chatSend').click(function() {
        var string = $('#chatText').val();
        socket.emit('chat', {text: string, name: playerName});
    });
    
    socket.on('alert', function(data) {
        viewControl.showMessage('System', data.text);
    });
});


// let's define a structure for opponent players



