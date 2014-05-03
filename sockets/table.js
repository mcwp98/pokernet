var Deck = require('./deck.js');
var Ranker = require('handranker');

function Table(blind, limit, buyIn, io) {
  this.maxPlayers = 7;
  this.blind = blind;
  this.limit = limit;
  this.players = [];
  this.cards = [];
  this.currentBet = blind;
  this.betQueue = [];
  this.io = io;
  this.pot = 0;
  this.numPlayers = 0;
  this.curPlayer;
  this.dealer = 0;
  this.numBets = 0;
}



// Start a game
Table.prototype.startGame = function() {
	if (this.numPlayers>1) {
	
    this.io.sockets.emit('alert', {text: "Game has begun"});
    // activate players
    this.activatePlayers();
    
    // announce dealer
    
    // set the deck
    this.deck = new Deck();
    
    // deal some hands
    this.dealPlayers();
    
    // set up bet queue
    this.constructQueue(this.dealer);
    
    // auto bet for the first two - small, then big blind - requeue small blind
    this.issueBlind(1);
    this.issueBlind(2);
    
    // now that this is done, we shift to bet phase
    this.getBet();
    } else {
    this.io.sockets.emit('alert', {text: "NOT ENOGUH PLAYERS"});
    }
}

// show the latest player
Table.prototype.showPlayer = function(pid) {
    for (player in this.players) {
        if (this.players[player].id == pid) {
            this.io.sockets.emit('getPlayer', 
                            { id: this.players[player].id
                            , bank: this.players[player].bank
                            , name: this.players[player].name });
        }
    }
}

// alert someone to players in the table
Table.prototype.showPlayers = function(pid) {
    for (i = 0; i < this.numPlayers; i++) { 
        this.io.sockets.socket(pid).emit('getPlayer', 
                                    { id: this.players[i].id
                                    , bank: this.players[i].bank
                                    , name: this.players[i].name });
    }
}


// deal a round of cards to a table
Table.prototype.dealPlayers = function() {

    //draw cards for all players
    for (i = 0; i < this.players.length; i++) {
        for (player in this.players) {
            this.players[player].setHand(this.deck.drawCard());
        }
    }
    
    // Send the hands, add to betting queue
    for (player in this.players) {
        var hand = this.players[player].getHand()
        this.io.sockets.socket(this.players[player].id).emit('getHand', hand);
        console.log("HERERERERE");
    }
}

// set up a queue to track bets
Table.prototype.constructQueue = function() {
    var i = (this.dealer+1)%this.numPlayers;

    // push all but the dealer
    while (i != this.dealer) {
        if (this.players[i].getActive()) this.betQueue.push(i);
        i = (i+1)%this.numPlayers;
    }
    
    // push dealer last
    if (this.players[this.dealer].getActive()) this.betQueue.push(this.dealer);
 
}

// set all player statuses to active
Table.prototype.activatePlayers = function() {
    for (player in this.players) {
        this.players[player].setActive(true);
    }
}

// Function to handle posting a blind
Table.prototype.issueBlind = function(type) {
    var player = this.betQueue.shift();
    var bet;
    this.io.sockets.emit('betting', {pid: this.players[player].id});
    if (type == 1) bet = this.blind/2;
    else bet = this.blind;
    this.players[player].setBet(bet);
    this.players[player].setBank(bet);
    this.pot += bet;
    this.io.sockets.emit('blind', { amount: bet, player: this.players[player].id });
    this.betQueue.push(player);
    this.numBets++;
    console.log('Number of bets' + this.numBets);
}

// ask for the next bet from player
Table.prototype.getBet = function() {
    this.curPlayer = this.betQueue.shift();
    this.io.sockets.emit('betting', {pid: this.players[this.curPlayer].id});
    this.io.sockets.socket(this.players[this.curPlayer].id).emit('alert', {text: 'It is your turn to bet'});
}
        
// take a bet
Table.prototype.takeBet = function(data) {

    this.betQueue.push(this.curPlayer);

    // set their bet and bank
    var bet = data.amount;
    this.numBets++;
    
    if (data.check) {       // if this is a check 
        this.io.sockets.emit('bet', {player: data.player, amount: data.amount, fold: false, check: true });
    } else {                // if this is a bet/fold
            this.players[this.curPlayer].setBank(bet);
            this.players[this.curPlayer].setBet(bet);
            this.pot += bet - this.currentBet;
        if (data.fold) { // we need to fold in this bet
            this.io.sockets.emit('bet', {player: data.player, amount: data.amount, fold: true, check: false });
            this.players[this.curPlayer].setActive(false);
            if (this.returnActive().length == 1) {
                this.endGame();
                return;
            }
            // set bet to last bet to see if its the end
            bet = this.currentBet;
        } else { // alert to bet, and set it
            this.currentBet = bet;
            this.io.sockets.emit('bet', {player: data.player, amount: data.amount, fold: false, check:false});
        }
    }
    
    // if this bet = next and weve all bet once
    if (bet == this.players[this.betQueue[0]].getBet() && this.numBets >= this.betQueue.length) {
        // reset the bet queue
        // reset current bet and player bets
        this.numBets = 0;
        this.currentBet = 0;
        this.betQueue = [];
        for (player in this.players) {
            this.players[player].setBetZero();
        }
        if (this.cards.length!=0) {
             if (this.cards.length == 3) { // deal turn
                this.showTurn();
                this.constructQueue();
                this.getBet()
            } else if (this.cards.length == 4) { // deal river
                this.showRiver();
                this.constructQueue();
                this.getBet();
            } else { // end of game
                this.endGame();
            }
            
        } else { // we deal flop
            this.showFlop();
            this.constructQueue();
            this.getBet();
        }
        
    } else {
        // repush to end, set bet, move on
        this.currentBet = data.amount;
        this.getBet();
    }
    
}

/****Player management*****/



// add a player to a table
Table.prototype.addPlayer = function(player) {
	console.log(this.numPlayers);
    this.players[this.numPlayers] = player;
    this.numPlayers= this.numPlayers +1;
	console.log(this.numPlayers);
}




// get player index by id
Table.prototype.getPlayer = function(pid) {
    for (var i = 0; i < this.numPlayers; i++) {
        if (this.players[i].id = pid) {
            return i;
        }
    }
}

// Aww, they give up
Table.prototype.fold = function() {
    
}

// get blind
Table.prototype.getBlind = function() {
    return this.blind;
}



// Card management

Table.prototype.showFlop = function() {
    this.cards[0] = this.deck.drawCard();
    this.io.sockets.emit('card', {card:this.cards[0]});
    this.cards[1] = this.deck.drawCard();
    this.io.sockets.emit('card', {card:this.cards[1]});
    this.cards[2] = this.deck.drawCard();
    this.io.sockets.emit('card', {card:this.cards[2]});
}

Table.prototype.showTurn = function() {
    this.cards[3] = this.deck.drawCard();
    this.io.sockets.emit('card', {card:this.cards[3]});
}

Table.prototype.showRiver = function() {
    this.cards[4] = this.deck.drawCard();
    this.io.sockets.emit('card', {card:this.cards[4]});

}

// end game mechanics
// 1. find the winner
// 2. reset players current bids, table bids, table cards, player cards
// 3. alert the table to the winner
Table.prototype.endGame = function() {
    var winner;
    var active = this.returnActive();
    
    // Find winner
    // winner by folds
    if (active.length == 1) winner = active[0];
    else winner = this.findWinner(active);    // else find the winner

    var winIndex = this.getPlayer(winner);
    
    // let the table know of the winner
    this.io.sockets.emit('winner', {pid: winner});
    this.io.sockets.emit('alert', {text: 'The winner is ' + this.players[winIndex].getName()});
    
    // add the current pot to the winner's pot
    this.players[winIndex].addBank(this.pot);
    
    // reset the player cards and bets
    for (player in this.players) {
        this.players[player].setBetZero();
        this.players[player].clearHand('');
        
    }
    
    // clear the table current bet, pots, cards, and iterate dealer
    this.pot = 0;
    this.cards = [];
    this.currentBet = this.blind;
    this.dealer = this.dealer+1%this.numPlayers;
}

Table.prototype.findWinner = function(active) {
    
    var hands = [];
    var temp;
    for (player in active) {
        temp = this.getPlayer(active[player]);
        hands[player] = {id: this.players[temp].id, cards: this.players[temp].getHand()};
    }
    var ranking = Ranker.orderHands(hands, this.cards);
    return ranking[0][0].id;
}

// returns an array of active player indexes in the table
Table.prototype.returnActive = function() {
    var active = [];
    var count = 0;
    for (player in this.players) {
        if (this.players[player].getActive() == true) {
            active[count++] = this.players[player].id;
        }
    }
    console.log("HERERERERERERERERERERE " + active[0] + " HERERE " + active[1]);
    //lol
    return active;
}
        
module.exports = Table;
