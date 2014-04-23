function oppPlayer(playerID, money, name, label) {
    this.id = playerID;
    this.bank = money;
    this.name = name;
    this.bet = 0;
    this.label = label;
    this.betting = false;
}

// update the player views
oppPlayer.prototype.updatePlayer = function() {
    viewControl.updateOpponent(this.label, this.bank, this.bet, false);
}

// update the player bet, total, bank
oppPlayer.prototype.setBet = function(amt) {
    tableCurrentBet = amt;
    this.bet = amt;
    this.bank -= amt;
    this.updatePlayer();
    this.betting = false;
}

oppPlayer.prototype.setBet2 = function(amt) {
    this.bet = amt;
}
