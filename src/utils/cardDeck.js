// Card deck generation and manipulation utilities for LiersPoker

/**
 * Class representing a standard playing card
 */
class Card {
  /**
   * Create a playing card
   * @param {string} suit - The card suit ('hearts', 'diamonds', 'clubs', 'spades')
   * @param {string} rank - The card rank ('2', '3', ..., '10', 'J', 'Q', 'K', 'A')
   */
  constructor(suit, rank) {
    this.id = `${rank}_${suit}_${Math.random().toString(36).substring(2, 8)}`;
    this.suit = suit;
    this.rank = rank;

    // Display name for the card (e.g., "Ace of Spades")
    this.name = `${this.getFullRankName()} of ${this.getFullSuitName()}`;
  }

  /**
   * Get the full name of the rank
   * @returns {string} The full rank name
   */
  getFullRankName() {
    const rankNames = {
      2: "Two",
      3: "Three",
      4: "Four",
      5: "Five",
      6: "Six",
      7: "Seven",
      8: "Eight",
      9: "Nine",
      10: "Ten",
      J: "Jack",
      Q: "Queen",
      K: "King",
      A: "Ace",
    };
    return rankNames[this.rank] || this.rank;
  }

  /**
   * Get the full name of the suit
   * @returns {string} The full suit name, capitalized
   */
  getFullSuitName() {
    return this.suit.charAt(0).toUpperCase() + this.suit.slice(1);
  }

  /**
   * Get the color of the card (red or black)
   * @returns {string} The color ('red' or 'black')
   */
  getColor() {
    return ["hearts", "diamonds"].includes(this.suit) ? "red" : "black";
  }

  /**
   * Get the numeric value of the card (for comparisons)
   * @returns {number} The numeric value (2-14, with Ace high)
   */
  getValue() {
    const values = {
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      10: 10,
      J: 11,
      Q: 12,
      K: 13,
      A: 14,
    };
    return values[this.rank] || 0;
  }

  /**
   * Get the Unicode symbol for the suit
   * @returns {string} The Unicode symbol
   */
  getSuitSymbol() {
    const symbols = {
      hearts: "♥",
      diamonds: "♦",
      clubs: "♣",
      spades: "♠",
    };
    return symbols[this.suit] || "";
  }

  /**
   * Clone the card
   * @returns {Card} A new card with the same properties
   */
  clone() {
    return new Card(this.suit, this.rank);
  }

  /**
   * Compare with another card
   * @param {Card} otherCard - The card to compare with
   * @returns {boolean} True if the cards have the same rank and suit
   */
  equals(otherCard) {
    return this.suit === otherCard.suit && this.rank === otherCard.rank;
  }

  /**
   * Convert the card to a string representation
   * @returns {string} String representation (e.g., "A♠")
   */
  toString() {
    return `${this.rank}${this.getSuitSymbol()}`;
  }
}

/**
 * Class representing a deck of playing cards
 */
class Deck {
  /**
   * Create a deck of cards
   * @param {boolean} initialize - Whether to initialize with a standard 52-card deck
   */
  constructor(initialize = true) {
    this.cards = [];

    if (initialize) {
      this.initialize();
    }
  }

  /**
   * Initialize a standard 52-card deck
   */
  initialize() {
    const suits = ["hearts", "diamonds", "clubs", "spades"];
    const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

    this.cards = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        this.cards.push(new Card(suit, rank));
      }
    }
  }

  /**
   * Shuffle the deck using the Fisher-Yates algorithm
   * @returns {Deck} The deck instance (for chaining)
   */
  shuffle() {
    const cards = this.cards;

    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return this;
  }

  /**
   * Draw a specific number of cards from the deck
   * @param {number} count - Number of cards to draw
   * @returns {Card[]} Array of drawn cards
   */
  draw(count = 1) {
    if (count <= 0) return [];
    if (count > this.remaining()) {
      count = this.remaining();
    }

    const drawnCards = this.cards.splice(0, count);
    return drawnCards;
  }

  /**
   * Draw specific cards from the deck by rank and suit
   * @param {Array<{rank: string, suit: string}>} cardSpecs - Array of card specifications
   * @returns {Card[]} Array of drawn cards
   */
  drawSpecific(cardSpecs) {
    if (!Array.isArray(cardSpecs) || cardSpecs.length === 0) {
      return [];
    }

    const drawn = [];
    const remaining = [];

    for (const card of this.cards) {
      const matchIndex = cardSpecs.findIndex((spec) => card.rank === spec.rank && card.suit === spec.suit);

      if (matchIndex !== -1) {
        drawn.push(card);
        cardSpecs.splice(matchIndex, 1);
      } else {
        remaining.push(card);
      }

      if (cardSpecs.length === 0) break;
    }

    this.cards = remaining;
    return drawn;
  }

  /**
   * Add cards to the deck
   * @param {Card[]} cards - Cards to add
   * @param {string} position - Where to add ('top', 'bottom', 'random')
   * @returns {Deck} The deck instance (for chaining)
   */
  addCards(cards, position = "top") {
    if (!cards || cards.length === 0) {
      return this;
    }

    switch (position) {
      case "bottom":
        this.cards = this.cards.concat(cards);
        break;

      case "random":
        // Add cards at random positions
        for (const card of cards) {
          const randomPos = Math.floor(Math.random() * (this.cards.length + 1));
          this.cards.splice(randomPos, 0, card);
        }
        break;

      case "top":
      default:
        this.cards = cards.concat(this.cards);
        break;
    }

    return this;
  }

  /**
   * Get the number of remaining cards in the deck
   * @returns {number} The number of cards
   */
  remaining() {
    return this.cards.length;
  }

  /**
   * Reset the deck to a fresh, unshuffled state
   * @returns {Deck} The deck instance (for chaining)
   */
  reset() {
    this.initialize();
    return this;
  }

  /**
   * Create a new deck from specific cards
   * @param {Card[]} cards - Cards to include in the deck
   * @returns {Deck} A new deck with the specified cards
   */
  static fromCards(cards) {
    const deck = new Deck(false);
    deck.cards = [...cards];
    return deck;
  }

  /**
   * Create a deck for a specific game variant
   * @param {string} variant - Game variant ('standard', 'pinochle', 'euchre', etc.)
   * @returns {Deck} A new deck for the specified game variant
   */
  static forVariant(variant) {
    const deck = new Deck(false);

    switch (variant.toLowerCase()) {
      case "pinochle":
        // Two copies of 9, 10, J, Q, K, A in each suit
        for (let i = 0; i < 2; i++) {
          for (const suit of ["hearts", "diamonds", "clubs", "spades"]) {
            for (const rank of ["9", "10", "J", "Q", "K", "A"]) {
              deck.cards.push(new Card(suit, rank));
            }
          }
        }
        break;

      case "euchre":
        // 9, 10, J, Q, K, A in each suit
        for (const suit of ["hearts", "diamonds", "clubs", "spades"]) {
          for (const rank of ["9", "10", "J", "Q", "K", "A"]) {
            deck.cards.push(new Card(suit, rank));
          }
        }
        break;

      case "standard":
      default:
        deck.initialize();
        break;
    }

    return deck;
  }
}

export { Card, Deck };
