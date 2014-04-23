function Deck() {
    this.cards = this.createCards();
    var i = 0;
    
    // lets make it uber random
    while (i < 7) {
        this.shuffle();
        i++;
    }
}


// Create the entire deck
Deck.prototype.createCards = function() {
    var suits = ["h", "c", "s", "d"];
    var faces = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];
    var cards = [];
    cardCount = 0;
    for (i = 0; i < 13; i++) {
        for (j = 0; j < 4; j++) {
            cards[cardCount++] = faces[i] + suits[j];
        }
    }
    return cards;
}

// shuffle up the deck
Deck.prototype.shuffle = function() {
    var i = this.cards.length - 1;
    var j
        , temp1
        , temp2;
    
    while(i) {
        j = Math.floor(Math.random() * (i + 1));
        temp1 = this.cards[i]; 
        temp2 = this.cards[j]; 
        this.cards[i] = temp2;
        this.cards[j] = temp1;
        i--;
    }
}

// pop the top card
Deck.prototype.drawCard = function() {
    return this.cards.pop();
}

module.exports = Deck;
