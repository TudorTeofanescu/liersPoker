// Core game logic for LiersPoker
import { Card, Deck } from "./cardDeck";

// Game phases
export const PHASES = {
  WAITING: "waiting", // Waiting for players
  DEALING: "dealing", // Dealing initial cards
  DECLARATION: "declaration", // Player making a declaration
  CHALLENGE: "challenge", // Others deciding to challenge
  REVEAL: "reveal", // Revealing cards after challenge
  RESULT: "result", // Showing round result
  GAME_OVER: "gameOver", // Game is finished
};

// Hand types and rankings
export const HAND_RANKINGS = {
  HIGH_CARD: 1,
  ONE_PAIR: 2,
  TWO_PAIR: 3,
  THREE_OF_A_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_OF_A_KIND: 8,
  STRAIGHT_FLUSH: 9,
  ROYAL_FLUSH: 10,
};

// Display names for hand types
export const HAND_NAMES = {
  1: "High Card",
  2: "One Pair",
  3: "Two Pair",
  4: "Three of a Kind",
  5: "Straight",
  6: "Flush",
  7: "Full House",
  8: "Four of a Kind",
  9: "Straight Flush",
  10: "Royal Flush",
};

/**
 * Class representing the LiersPoker game logic
 */
export class LiersPokerGame {
  /**
   * Create a new LiersPoker game
   * @param {string[]} playerIds - Array of player IDs
   */
  constructor(playerIds) {
    this.playerIds = [...playerIds];
    this.players = playerIds.map((id) => ({
      id,
      cards: [],
      inGame: true,
      lastAction: null,
      handSize: 0,
    }));

    this.deck = new Deck();
    this.phase = PHASES.WAITING;
    this.currentPlayerIndex = 0;
    this.dealerIndex = 0;
    this.logs = [];
    this.currentDeclaration = null;
    this.lastChallenger = null;
    this.roundNumber = 1;
    this.remainingPlayers = this.players.length;
  }

  /**
   * Start the game
   * @returns {Object} The public game state
   */
  start() {
    this.logs = [];
    this.addLog("Game started");
    this.deck.shuffle();
    this.dealInitialCards();
    return this.getPublicGameState();
  }

  /**
   * Deal initial cards to players
   */
  dealInitialCards() {
    this.phase = PHASES.DEALING;
    this.addLog("Dealing initial cards");

    // Each player starts with 2 cards
    this.players.forEach((player) => {
      player.cards = this.deck.draw(2);
      player.handSize = 2;
    });

    // Move to declaration phase
    this.phase = PHASES.DECLARATION;
    this.currentPlayerIndex = (this.dealerIndex + 1) % this.players.length;
    this.ensureCurrentPlayerInGame();

    this.addLog(`Round ${this.roundNumber} begins`);
    this.addLog(`${this.getCurrentPlayer().id}'s turn to declare`);
  }

  /**
   * Handle player actions
   * @param {string} playerId - ID of the player taking action
   * @param {string} action - The action type ('declaration', 'challenge', 'pass')
   * @param {string} declarationType - Type of hand being declared (for declarations)
   * @param {Array} declaredCards - Cards being declared (for declarations)
   * @returns {Object} The updated game state
   */
  handleAction(playerId, action, declarationType = null, declaredCards = []) {
    // Verify it's the player's turn
    if (this.getCurrentPlayer().id !== playerId && action !== "challenge" && action !== "pass") {
      throw new Error("Not your turn");
    }

    switch (action) {
      case "declaration":
        return this.makeDeclaration(playerId, declarationType, declaredCards);
      case "challenge":
        return this.makeChallenge(playerId);
      case "pass":
        return this.skipChallenge(playerId);
      default:
        throw new Error("Invalid action");
    }
  }

  /**
   * Make a declaration
   * @param {string} playerId - ID of the player making the declaration
   * @param {string} declarationType - The type of hand being declared
   * @param {Array} declaredCards - The cards being declared
   * @returns {Object} The updated game state
   */
  makeDeclaration(playerId, declarationType, declaredCards) {
    // Verify it's the player's turn
    if (this.getCurrentPlayer().id !== playerId) {
      throw new Error("Not your turn to declare");
    }

    // Verify we're in declaration phase
    if (this.phase !== PHASES.DECLARATION) {
      throw new Error("Not in declaration phase");
    }

    const declaration = {
      type: declarationType,
      cards: declaredCards,
    };

    // Validate the declaration
    this.validateDeclaration(declaration);

    // Set the current declaration
    this.currentDeclaration = declaration;

    // Log the declaration
    this.addLog(`${playerId} declares: ${this.formatDeclaration(declaration)}`);

    // Update player's last action
    const player = this.getPlayerById(playerId);
    player.lastAction = {
      type: "declaration",
      declaration: declaration,
    };

    // Move to challenge phase
    this.phase = PHASES.CHALLENGE;

    return this.getPublicGameState();
  }

  /**
   * Challenge a declaration
   * @param {string} challengerId - ID of the player making the challenge
   * @returns {Object} The updated game state
   */
  makeChallenge(challengerId) {
    // Verify we're in challenge phase
    if (this.phase !== PHASES.CHALLENGE) {
      throw new Error("Not in challenge phase");
    }

    // Verify player can challenge (not the declarer)
    if (challengerId === this.getCurrentPlayer().id) {
      throw new Error("You cannot challenge your own declaration");
    }

    // Set challenger
    this.lastChallenger = challengerId;

    // Log the challenge
    this.addLog(`${challengerId} challenges with "Trombon"!`);

    // Move to reveal phase
    this.phase = PHASES.REVEAL;

    // Resolve the challenge
    this.resolveChallenge();

    return this.getPublicGameState();
  }

  /**
   * Skip challenging and pass to the next player
   * @param {string} playerId - ID of the player passing
   * @returns {Object} The updated game state
   */
  skipChallenge(playerId) {
    // Verify we're in challenge phase
    if (this.phase !== PHASES.CHALLENGE) {
      throw new Error("Not in challenge phase");
    }

    // Player chooses not to challenge
    this.addLog(`${playerId} passes`);

    // Move to the next player for declaration
    this.moveToNextPlayer();
    this.phase = PHASES.DECLARATION;

    this.addLog(`${this.getCurrentPlayer().id}'s turn to declare`);

    return this.getPublicGameState();
  }

  /**
   * Resolve a challenge
   * @returns {Object} The updated game state
   */
  resolveChallenge() {
    this.phase = PHASES.REVEAL;

    // Get all cards from all players
    const allCards = this.getAllPlayerCards();

    // Check if the declaration exists in the pool of all cards
    const declarationExists = this.checkDeclarationExists(allCards, this.currentDeclaration);

    // Determine the loser
    let loserId;
    if (declarationExists) {
      // Challenger loses
      loserId = this.lastChallenger;
      this.addLog(`Challenge failed! The declared ${this.formatDeclaration(this.currentDeclaration)} exists`);
      this.addLog(`${loserId} loses the challenge`);
    } else {
      // Declarer loses
      loserId = this.getCurrentPlayer().id;
      this.addLog(`Challenge succeeded! The declared ${this.formatDeclaration(this.currentDeclaration)} does not exist`);
      this.addLog(`${loserId} loses the challenge`);
    }

    // Loser gets an additional card
    this.punishLoser(loserId);

    // Move to next round
    this.prepareNextRound(loserId);

    return this.getPublicGameState();
  }

  /**
   * Check if a declaration exists in the pool of all cards
   * @param {Card[]} allCards - All available cards
   * @param {Object} declaration - The declaration to check
   * @returns {boolean} True if the declaration exists
   */
  checkDeclarationExists(allCards, declaration) {
    // This is a simplified implementation
    // A real implementation would need to check for specific hand combinations

    // For this simplified version, we'll just check if all declared cards exist
    // in the pool of cards from all players
    const declaredCards = declaration.cards;

    // Check each declared card
    for (const declaredCard of declaredCards) {
      // Try to find a matching card in the pool
      const foundCard = allCards.find((poolCard) => poolCard.rank === declaredCard.rank && poolCard.suit === declaredCard.suit);

      // If any card is not found, the declaration doesn't exist
      if (!foundCard) {
        return false;
      }

      // Remove the found card to prevent double-counting
      const index = allCards.indexOf(foundCard);
      allCards.splice(index, 1);
    }

    // If we get here, all cards were found
    return true;
  }

  /**
   * Punish the loser with an additional card
   * @param {string} loserId - ID of the player who lost
   */
  punishLoser(loserId) {
    const loser = this.getPlayerById(loserId);

    // Check if the deck has cards
    if (this.deck.remaining() > 0) {
      const newCard = this.deck.draw(1)[0];
      loser.cards.push(newCard);
      loser.handSize = loser.cards.length;
      this.addLog(`${loserId} receives an additional card`);

      // Check if player is eliminated (6 or more cards)
      if (loser.cards.length >= 6) {
        loser.inGame = false;
        this.remainingPlayers--;
        this.addLog(`${loserId} has ${loser.cards.length} cards and is eliminated!`);
      }
    } else {
      this.addLog("Deck is empty, no additional card given");
    }
  }

  /**
   * Prepare for the next round
   * @param {string} lastLoserId - ID of the player who lost the last round
   */
  prepareNextRound(lastLoserId) {
    // Check if game is over
    if (this.remainingPlayers <= 1) {
      this.endGame();
      return;
    }

    // Reset current declaration
    this.currentDeclaration = null;

    // Move dealer position if needed
    const loserIndex = this.players.findIndex((p) => p.id === lastLoserId);
    if (!this.players[loserIndex].inGame) {
      // If loser is eliminated, next player becomes dealer
      this.dealerIndex = this.getNextActivePlayerIndex(loserIndex);
    } else {
      // Otherwise, loser becomes dealer
      this.dealerIndex = loserIndex;
    }

    // Start new round with the player after the dealer
    this.currentPlayerIndex = this.getNextActivePlayerIndex(this.dealerIndex);
    this.phase = PHASES.DECLARATION;

    this.roundNumber++;
    this.addLog(`Round ${this.roundNumber} begins`);
    this.addLog(`${this.getCurrentPlayer().id}'s turn to declare`);
  }

  /**
   * End the game
   */
  endGame() {
    this.phase = PHASES.GAME_OVER;

    // Find the winner (last player in the game)
    const winner = this.players.find((p) => p.inGame);

    if (winner) {
      this.addLog(`Game over! ${winner.id} wins the game!`);
    } else {
      this.addLog("Game over! No players remaining.");
    }
  }

  /**
   * Get the next active player after the given index
   * @param {number} currentIndex - The current player index
   * @returns {number} The index of the next active player
   */
  getNextActivePlayerIndex(currentIndex) {
    let index = (currentIndex + 1) % this.players.length;

    // Keep looking until we find an active player
    while (!this.players[index].inGame) {
      index = (index + 1) % this.players.length;

      // Safety check to avoid infinite loop
      if (index === currentIndex) break;
    }

    return index;
  }

  /**
   * Ensure current player is still in the game
   */
  ensureCurrentPlayerInGame() {
    if (!this.getCurrentPlayer().inGame) {
      this.moveToNextPlayer();
    }
  }

  /**
   * Move to the next player
   */
  moveToNextPlayer() {
    const startIndex = this.currentPlayerIndex;
    let nextIndex = (this.currentPlayerIndex + 1) % this.players.length;

    // Find the next player who is still in the game
    while (!this.players[nextIndex].inGame) {
      nextIndex = (nextIndex + 1) % this.players.length;

      // If we've gone all the way around and found no active players
      if (nextIndex === startIndex) {
        this.endGame();
        return;
      }
    }

    this.currentPlayerIndex = nextIndex;
  }

  /**
   * Validate a declaration
   * @param {Object} declaration - The declaration to validate
   * @returns {boolean} True if valid
   */
  validateDeclaration(declaration) {
    // Check if declaration has required properties
    if (!declaration || !declaration.type || !declaration.cards) {
      throw new Error("Invalid declaration format");
    }

    // Check hand type is valid
    if (!HAND_RANKINGS[declaration.type]) {
      throw new Error("Invalid hand type");
    }

    // Check cards are valid
    if (!Array.isArray(declaration.cards) || declaration.cards.length === 0) {
      throw new Error("Declaration must include cards");
    }

    // If there's a previous declaration, check this one is higher
    if (this.currentDeclaration) {
      const prevRanking = HAND_RANKINGS[this.currentDeclaration.type];
      const newRanking = HAND_RANKINGS[declaration.type];

      // If declaring a higher hand type, it's always valid
      if (newRanking > prevRanking) {
        return true;
      }

      // Cannot declare the same hand type with lower or equal value
      if (newRanking === prevRanking) {
        // For same hand type, need to check value
        const prevHighCard = this.getHighCardValue(this.currentDeclaration);
        const newHighCard = this.getHighCardValue(declaration);

        if (newHighCard <= prevHighCard) {
          throw new Error("For same hand type, new declaration must have higher value");
        }
      } else {
        // Cannot declare a lower hand type
        throw new Error("New declaration must be a higher hand type or same type with higher value");
      }
    }

    return true;
  }

  /**
   * Get value of high card for comparing same hand types
   * @param {Object} declaration - The declaration to check
   * @returns {number} The high card value
   */
  getHighCardValue(declaration) {
    // For different types of hands, the high card is determined differently
    switch (declaration.type) {
      case "HIGH_CARD":
        // For high card, it's just the highest value card
        return Math.max(...declaration.cards.map((card) => this.getCardValue(card)));

      case "ONE_PAIR":
        // For one pair, it's the value of the paired cards
        const valueCounts = this.countCardValues(declaration.cards);
        for (const [value, count] of Object.entries(valueCounts)) {
          if (count === 2) return parseInt(value);
        }
        return 0;

      case "TWO_PAIR":
        // For two pair, it's the value of the higher pair
        const counts = this.countCardValues(declaration.cards);
        const pairs = Object.entries(counts)
          .filter(([_, count]) => count === 2)
          .map(([value, _]) => parseInt(value))
          .sort((a, b) => b - a);
        return pairs[0] || 0;

      case "THREE_OF_A_KIND":
      case "FULL_HOUSE":
        // For three of a kind or full house, it's the value of the three cards
        const valCounts = this.countCardValues(declaration.cards);
        for (const [value, count] of Object.entries(valCounts)) {
          if (count === 3) return parseInt(value);
        }
        return 0;

      case "STRAIGHT":
      case "FLUSH":
      case "STRAIGHT_FLUSH":
      case "ROYAL_FLUSH":
        // For straights and flushes, it's the highest card value
        return Math.max(...declaration.cards.map((card) => this.getCardValue(card)));

      case "FOUR_OF_A_KIND":
        // For four of a kind, it's the value of the four cards
        const cardCounts = this.countCardValues(declaration.cards);
        for (const [value, count] of Object.entries(cardCounts)) {
          if (count === 4) return parseInt(value);
        }
        return 0;

      default:
        // Fallback to highest card
        return Math.max(...declaration.cards.map((card) => this.getCardValue(card)));
    }
  }

  /**
   * Count occurrences of each card value
   * @param {Card[]} cards - The cards to count
   * @returns {Object} Counts of each value
   */
  countCardValues(cards) {
    const counts = {};
    for (const card of cards) {
      const value = this.getCardValue(card);
      counts[value] = (counts[value] || 0) + 1;
    }
    return counts;
  }

  /**
   * Get numeric value of a card
   * @param {Card} card - The card to get value for
   * @returns {number} Numeric value
   */
  getCardValue(card) {
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
    return values[card.rank] || 0;
  }

  /**
   * Format a declaration for logging
   * @param {Object} declaration - The declaration to format
   * @returns {string} Formatted string
   */
  formatDeclaration(declaration) {
    if (!declaration) return "nothing";

    const handName = HAND_NAMES[HAND_RANKINGS[declaration.type]];
    let valueDescription = "";

    // Add more specific information about the hand
    switch (declaration.type) {
      case "HIGH_CARD":
        const highCardRank = declaration.cards[0].rank;
        valueDescription = ` (${highCardRank} high)`;
        break;

      case "ONE_PAIR":
        // Find the pair
        const pairRank = this.findPairRank(declaration.cards);
        valueDescription = ` of ${pairRank}s`;
        break;

      case "TWO_PAIR":
        // Find the two pairs
        const pairs = this.findPairRanks(declaration.cards);
        if (pairs.length >= 2) {
          valueDescription = ` of ${pairs[0]}s and ${pairs[1]}s`;
        }
        break;

      case "THREE_OF_A_KIND":
        // Find the triplet
        const tripletRank = this.findTripletRank(declaration.cards);
        valueDescription = ` of ${tripletRank}s`;
        break;

      case "STRAIGHT":
        // Describe the straight by its highest card
        const highCard = [...declaration.cards].sort((a, b) => this.getCardValue(b) - this.getCardValue(a))[0];
        valueDescription = ` to ${highCard.rank}`;
        break;

      case "FLUSH":
        const suit = declaration.cards[0].suit;
        valueDescription = ` (${suit})`;
        break;

      case "FULL_HOUSE":
        const threeKindRank = this.findTripletRank(declaration.cards);
        const pairInFullHouse = this.findPairRank(declaration.cards);
        valueDescription = ` (${threeKindRank}s over ${pairInFullHouse}s)`;
        break;

      case "FOUR_OF_A_KIND":
        const quadRank = this.findQuadRank(declaration.cards);
        valueDescription = ` of ${quadRank}s`;
        break;
    }

    return `${handName}${valueDescription}`;
  }

  /**
   * Find the rank of a pair in the cards
   * @param {Card[]} cards - The cards to check
   * @returns {string} The rank of the pair
   */
  findPairRank(cards) {
    const valueCounts = this.countCardValues(cards);
    for (const [value, count] of Object.entries(valueCounts)) {
      if (count === 2) {
        // Convert numeric value back to rank
        return this.valueToRank(parseInt(value));
      }
    }
    return "Unknown";
  }

  /**
   * Find the ranks of pairs in the cards
   * @param {Card[]} cards - The cards to check
   * @returns {string[]} The ranks of the pairs
   */
  findPairRanks(cards) {
    const valueCounts = this.countCardValues(cards);
    const pairs = [];

    for (const [value, count] of Object.entries(valueCounts)) {
      if (count === 2) {
        pairs.push(this.valueToRank(parseInt(value)));
      }
    }

    // Sort pairs by value, highest first
    return pairs.sort((a, b) => this.getCardValue({ rank: b }) - this.getCardValue({ rank: a }));
  }

  /**
   * Find the rank of a triplet in the cards
   * @param {Card[]} cards - The cards to check
   * @returns {string} The rank of the triplet
   */
  findTripletRank(cards) {
    const valueCounts = this.countCardValues(cards);
    for (const [value, count] of Object.entries(valueCounts)) {
      if (count === 3) {
        return this.valueToRank(parseInt(value));
      }
    }
    return "Unknown";
  }

  /**
   * Find the rank of a quad in the cards
   * @param {Card[]} cards - The cards to check
   * @returns {string} The rank of the quad
   */
  findQuadRank(cards) {
    const valueCounts = this.countCardValues(cards);
    for (const [value, count] of Object.entries(valueCounts)) {
      if (count === 4) {
        return this.valueToRank(parseInt(value));
      }
    }
    return "Unknown";
  }

  /**
   * Convert a numeric value to a card rank
   * @param {number} value - The value to convert
   * @returns {string} The card rank
   */
  valueToRank(value) {
    const rankMap = {
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      10: "10",
      11: "J",
      12: "Q",
      13: "K",
      14: "A",
    };
    return rankMap[value] || value.toString();
  }

  /**
   * Get all cards from all players
   * @returns {Card[]} All cards in play
   */
  getAllPlayerCards() {
    // Flatten all player cards into a single array
    return this.players.reduce((cards, player) => {
      return cards.concat(player.cards);
    }, []);
  }

  /**
   * Get the current player
   * @returns {Object} The current player
   */
  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  /**
   * Get a player by ID
   * @param {string} id - The player ID
   * @returns {Object} The player
   */
  getPlayerById(id) {
    const player = this.players.find((p) => p.id === id);
    if (!player) {
      throw new Error(`Player not found: ${id}`);
    }
    return player;
  }

  /**
   * Add an entry to the game log
   * @param {string} message - The log message
   */
  addLog(message) {
    this.logs.push({
      timestamp: Date.now(),
      message: message,
    });
  }

  /**
   * Get the current game state for public view
   * @returns {Object} The public game state
   */
  getPublicGameState() {
    return {
      phase: this.phase,
      currentPlayerId: this.getCurrentPlayer().id,
      dealerPlayerId: this.players[this.dealerIndex].id,
      players: this.players.map((p) => ({
        id: p.id,
        handSize: p.handSize,
        lastAction: p.lastAction,
        inGame: p.inGame,
      })),
      currentDeclaration: this.currentDeclaration,
      lastChallenger: this.lastChallenger,
      roundNumber: this.roundNumber,
      logs: [...this.logs], // Copy logs to avoid modification
      remainingPlayers: this.remainingPlayers,
    };
  }

  /**
   * Get a player-specific view of the game state
   * @param {string} playerId - ID of the player
   * @returns {Object} Player-specific game state
   */
  getPlayerGameState(playerId) {
    const gameState = this.getPublicGameState();

    // Add the player's cards
    const player = this.getPlayerById(playerId);
    if (player.cards) {
      gameState.hand = [...player.cards]; // Copy cards to avoid modification
    }

    return gameState;
  }
}
