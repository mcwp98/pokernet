function viewControl() {}

/****** Client **********/
/****** Opponents *******/
/****** Table ***********/
// shows the cards
viewControl.prototype.showCard = function(position, card) {
    $('#card' + position).attr('src', "/static/assets/img/cards/" + card + '.png');
}

// shows the hand
viewControl.prototype.showHand = function(cards) {
    $("#myCard1").attr('src', '/static/assets/img/cards/' + cards[0] + '.png');
    $("#myCard2").attr('src', '/static/assets/img/cards/' + cards[1] + '.png');
}

// shows an opponents hand
viewControl.prototype.showOppHand = function(label, cards) {
    $('#op' + i + '-card1').attr('src','/static/assets/img/cards/' + cards[0] + '.png');
    $('#op' + i + '-card2').attr('src','/static/assets/img/cards/' + cards[1] + '.png');
}

// hides all cards on the board
viewControl.prototype.hideCards = function(size) {

    // hide mine
    $("#myCard1").attr('src', '');
    $("#myCard2").attr('src', '');
    
    // hide the opponent
    for (var i = 1; i <= size; i++) {
        $('#op' + i + '-card1').attr('src','');
        $('#op' + i + '-card2').attr('src', '');
    }
    
    // hide the board
    for (i=1; i <= 5; i++) {
        $('#card' + i).attr('src', '');
    }
    
}

// adds a player to the table
viewControl.prototype.addPlayer = function(label, name) {
	console.log('#op' + label + '-name');
    $('#op' + (label+1) + '-name').text(name);
}

viewControl.prototype.oppCardsHidden = function(size) {
    for (var i = 1; i <= size; i++) {
        $('#op' + i + '-card1').attr('src','/static/assets/img/cards/b1fv.png');
        $('#op' + i + '-card2').attr('src','/static/assets/img/cards/b1fv.png');
    }
}

// the opponent is betting
viewControl.prototype.oppBetting = function(label) {
    $('#op' + label + '-betting').show();
}

// the opponent is done betting
viewControl.prototype.oppNotBetting = function(label) {
    $('#op' + label + '-betting').hide();
}

// updates the opponents player info
viewControl.prototype.updateOpponent = function(label, bank, bet, betting) {
    $('#op' + label + '-bank').text(bank);
    $('#op' + label + '-bet').text(bet);
}

// set the table's pot
viewControl.prototype.setPot = function(amt) {
    $('#potContainer').text(amt);
}

viewControl.prototype.setBank = function(amt) {
    $('#myBank').text(amt);
}

// set the table's current bet
viewControl.prototype.setTableBet = function(amt) {
    $('#tableBetContainer').text(amt);
}

// allow betting
viewControl.prototype.showBet = function(pot, currentBet, blind, limit) {
    $('#betBox').show();
    $('#betting').show();
    
	$('#foldSend').show();
	$('#checkSend').show();
	$('#betSend').show();
	$('#betAmt').show();
}

// close betting
viewControl.prototype.hideBet = function() {
    $('#betBox').hide();
    $('#betting').hide();
	$('#foldSend').hide();
	$('#checkSend').hide();
	$('#betSend').hide();
	$('#betAmt').hide();
}

// set the my current bet
viewControl.prototype.setMyBet = function(amt) {
    $('#betContainer').text(myCurrentBet);
}

// displays dealer, small blind, big bling
viewControl.prototype.showRoles = function() {}

// displays a chat message
viewControl.prototype.showMessage = function(from, message) {
    var color = 'black';
    if (from == 'System') color = 'red';
    else if (from == 'Bet') color = 'blue';
    $("#chatBox").append("<p style='color:" + color + "'>" + from + ": " + message + "</p>");
    return;
}
