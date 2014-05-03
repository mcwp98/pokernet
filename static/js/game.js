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
/*

   
    var tableId    = '{{ table }}';
    var playerName = '{{ username }}';
    var moneyToUse = '{{ amountPlay}}';
    var tableLimit = '{{tableLimit}};'
    var tableBlind = '{{tableBlind}}';
    */
var socket = io.connect('127.0.0.1:8081');
socket.on('connect', function() {
    socket.emit('connectToServer', {name: playerName, money: moneyToUse,table: tableId,tableLimit:tableLimit,tableBlind:tableBlind});
    viewControl = new viewControl();
    viewControl.setBank(pot);
    /**** game control *****/
    // use this to push game along, only one will do this

    /**** send events *****/
    // start the game!
    $('#startGame').click(function() {
    
        // double check that the board is clear
        viewControl.setPot(0);
        handPot = 0;
        
        myCards = [];
        tableCards = [];;
        viewControl.hideCards();
        tableCurrentBet = 0;
        myCurrentBet = 0;
        for (player in players) viewControl.updateOpponent(player, players[player].bank, 0, false);
        
        // emit the signal to start
        socket.emit('start', {table:tableId});
    });

    // submit a bet
    $('#betSend').click(function() {
    
        if (!allowBet) {
            viewControl.showMessage('System', "Not your turn");
        	return;
        }
        var betTemp = parseFloat($('#betAmt').val());
        var betAmt = betTemp + parseFloat(myCurrentBet);
        
        // were checking, if possible
        
        // bad bet, try again
        console.log("bet : "+ betAmt + " | " +  "smallblind " + blind/2+ "   " +(betAmt % (blind/2)));
        if  (isNaN(betTemp) || (betAmt % (blind/2))  > .001 || betAmt < blind || betAmt < tableCurrentBet) {
            viewControl.showMessage('System', 'Invalid bet');
            return;
        }
        
        // this will put you under
        
        // set my bet and pot, display them
        myCurrentBet = betAmt;
        pot -= betTemp;
        handPot += Number(betTemp)
        viewControl.setPot(handPot);
        viewControl.setBank(pot);
        viewControl.setMyBet(myCurrentBet);
        
        // hide betting, show we've bet
        viewControl.hideBet();
        viewControl.showMessage('Bet', "You have bet: " + betAmt);
        
        socket.emit('bet', {table: tableId, player: myId, amount:betAmt, fold: false, check: false});
  
    });
    
    // submit a fold
    $('#foldSend').click(function() {
    
        if (!allowBet) {
            viewControl.showMessage('System', "Not your turn");
        	return;
        }
        socket.emit('bet', {table: tableId,player: myId, amount: 0, fold: true, check:false});
        myCurrentBet = 0;
        viewControl.setMyBet(myCurrentBet);
        viewControl.showMessage('Fold', "You have folded from this hand");
        viewControl.hideBet();
    });
    
    // submit a check
    $('#checkSend').click(function() {
        // make sure that it is allowed
        if (!allowBet) {
            viewControl.showMessage('System', "Not your turn");
        	return;
        }
        
        if (myCurrentBet != tableCurrentBet ) {
            viewControl.showMessage('System', "You cannot check at this time- you must bet higher");
        } else {
        socket.emit('bet', {table: tableId,player: myId, amount: myCurrentBet, fold: false, check: true});
        viewControl.showMessage('Check', 'You have checked');
        viewControl.hideBet();
        }
    });

    /*** listen events ****/
    
    // we have a winner, display all cards and the winner
    socket.on('winner', function(data) {
        if (data.pid == myId) {
            pot += Number(handPot);
            viewControl.setBank(pot);
            viewControl.showMessage('Winner', 'You have won the pot of ' + handPot);
        } else {
            viewControl.showMessage('Winner', 'You have lost the pot of ' + handPot);
        }
            
        // double check that the board is clear
        viewControl.setPot(0);
        handPot = 0;
        
        myCards = [];
        tableCards = [];
        viewControl.hideCards();
        
        tableCurrentBet = 0;
        myCurrentBet = 0;
        for (player in players) viewControl.updateOpponent(player, players[player].bank, 0, false);
        
        // emit the signal to start
        socket.emit('start', {table:tableId});
        
        
    });
    
    // set my player id
    socket.on('pid', function(data) {
    	if(tableId != data.table)
    		return;
        myId = data.pid;
        blind = data.blind;
    });
    
    
    // get a new opponent, add to array by playerID
    socket.on('getPlayer', function(data) {
        // make sure you aren't getting yourself
        if (data.id == myId) return;
        
        for(var i=0;i<numPlayers;i++)
        	if (players[i].name==data.name) {
					players.splice(i, 1);
					numPlayers--;
				}
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
            allowBet=true;
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
        var bet;
        
        if (data.fold == true || data.check == true) {
            if (data.player == myId) return;
        } else {
            tableCurrentBet = data.amount;
        }

        for (var i = 1; i < numPlayers+1; i++) {
            if (players[i].id == data.player) {
                players[i].setBet(data.amount);
                players[i].betting = false;
                viewControl.oppNotBetting(i);
                if (data.check) {
                    viewControl.showMessage('Bet', players[i].name + " has bet: " + data.amount);
                } else {
                    handPot += Number(data.amount) - Number(players[i].bet);
                    viewControl.showMessage('Bet', players[i].name + " has checked.");
                }
            }
        }
        
        viewControl.setPot(handPot);
        viewControl.setTableBet(tableCurrentBet);

    });
    
    socket.on('blind', function(data) {
        
        // set the pot and current bet, display them
        handPot += Number(data.amount);
        tableCurrentBet = data.amount;
        viewControl.setPot(handPot);
        viewControl.setTableBet(tableCurrentBet);
        
        // if its us, also modify us
        if (data.player == myId) {
            myCurrentBet = tableCurrentBet;
            pot -= Number(data.amount);
            viewControl.setBank(pot);
            viewControl.setMyBet(myCurrentBet);
            viewControl.hideBet();
            viewControl.showMessage('Bet', "You have posted blind: " + data.amount);
            return;
        }
        
        // set their bet
        for (var i = 1; i < numPlayers+1; i++) {
            if (players[i].id == data.player) {
                players[i].setBet(data.amount);
                players[i].betting = false;
                viewControl.oppNotBetting(i);
                viewControl.showMessage('Blind', players[i].name + " posted blind: " + data.amount);
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



