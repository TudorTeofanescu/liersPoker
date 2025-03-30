// Hand Extractor utility for LiersPoker
// Extracts card data from UI elements

import { CARD_RANKS, CARD_SUITS, HAND_RANKINGS } from "./constants";

/**
 * Class to extract hand information from UI elements
 */
class HandExtractor {
  /**
   * Create a new HandExtractor
   * @param {string[]} ranks - Available card ranks
   * @param {Array} suits - Available card suits
   */
  constructor(ranks = CARD_RANKS, suits = CARD_SUITS) {
    this.ranks = ranks;
    this.suits = suits;
  }

  /**
   * Extract cards from interface based on hand type
   * @param {HTMLElement} container - The container element with card selectors
   * @returns {Array} Array of card objects
   */
  getSelectedCardsFromInterface(container) {
    if (!container) return [];

    const cards = [];
    const handTypeClass = container.querySelector("div.card-interface")?.classList[1];

    if (!handTypeClass) return cards;

    switch (handTypeClass) {
      case "HIGH_CARD":
        return this.extractHighCard(container);

      case "ONE_PAIR":
        return this.extractOnePair(container);

      case "TWO_PAIR":
        return this.extractTwoPair(container);

      case "THREE_OF_A_KIND":
        return this.extractThreeOfAKind(container);

      case "STRAIGHT":
        return this.extractStraight(container);

      case "FLUSH":
        return this.extractFlush(container);

      case "FULL_HOUSE":
        return this.extractFullHouse(container);

      case "FOUR_OF_A_KIND":
        return this.extractFourOfAKind(container);

      case "STRAIGHT_FLUSH":
        return this.extractStraightFlush(container);

      case "ROYAL_FLUSH":
        return this.extractRoyalFlush(container);

      default:
        // Generic approach for other hand types with multiple card selectors
        return this.extractGenericCards(container);
    }
  }

  /**
   * Extract a high card selection
   * @param {HTMLElement} container - The container element
   * @returns {Array} Array of card objects
   */
  extractHighCard(container) {
    const cards = [];

    const rankSelect = container.querySelector(".rank-select");
    const suitSelect = container.querySelector(".suit-select");

    if (rankSelect && suitSelect) {
      cards.push({
        rank: rankSelect.value,
        suit: suitSelect.value,
      });
    }

    return cards;
  }

  /**
   * Extract a one pair selection
   * @param {HTMLElement} container - The container element
   * @returns {Array} Array of card objects
   */
  extractOnePair(container) {
    const cards = [];

    const pairRank = container.querySelector(".pair-rank-select")?.value;
    const pairSuits = container.querySelectorAll(".pair-suit-select");

    if (pairRank && pairSuits.length >= 2) {
      for (let i = 0; i < 2; i++) {
        if (pairSuits[i]) {
          cards.push({
            rank: pairRank,
            suit: pairSuits[i].value,
          });
        }
      }
    }

    return cards;
  }

  /**
   * Extract a two pair selection
   * @param {HTMLElement} container - The container element
   * @returns {Array} Array of card objects
   */
  extractTwoPair(container) {
    const cards = [];

    // First pair
    const pair1Rank = container.querySelector(".pair1-rank-select")?.value;
    const pair1Suits = container.querySelectorAll(".pair1-suit-select");

    if (pair1Rank && pair1Suits.length >= 2) {
      for (let i = 0; i < 2; i++) {
        if (pair1Suits[i]) {
          cards.push({
            rank: pair1Rank,
            suit: pair1Suits[i].value,
          });
        }
      }
    }

    // Second pair
    const pair2Rank = container.querySelector(".pair2-rank-select")?.value;
    const pair2Suits = container.querySelectorAll(".pair2-suit-select");

    if (pair2Rank && pair2Suits.length >= 2) {
      for (let i = 0; i < 2; i++) {
        if (pair2Suits[i]) {
          cards.push({
            rank: pair2Rank,
            suit: pair2Suits[i].value,
          });
        }
      }
    }

    return cards;
  }

  /**
   * Extract a three of a kind selection
   * @param {HTMLElement} container - The container element
   * @returns {Array} Array of card objects
   */
  extractThreeOfAKind(container) {
    const cards = [];

    const tripsRank = container.querySelector(".trips-rank-select")?.value;
    const tripsSuits = container.querySelectorAll(".trips-suit-select");

    if (tripsRank && tripsSuits.length >= 3) {
      for (let i = 0; i < 3; i++) {
        if (tripsSuits[i]) {
          cards.push({
            rank: tripsRank,
            suit: tripsSuits[i].value,
          });
        }
      }
    }

    return cards;
  }

  /**
   * Extract a straight selection
   * @param {HTMLElement} container - The container element
   * @returns {Array} Array of card objects
   */
  extractStraight(container) {
    const cards = [];

    const startRank = container.querySelector(".straight-start-select")?.value;
    const straightSuits = container.querySelectorAll(".straight-suit-select");

    if (startRank && straightSuits.length >= 5) {
      const startIndex = this.ranks.indexOf(startRank);

      // If valid start rank found
      if (startIndex !== -1 && startIndex <= this.ranks.length - 5) {
        for (let i = 0; i < 5; i++) {
          cards.push({
            rank: this.ranks[startIndex + i],
            suit: straightSuits[i].value,
          });
        }
      }
    }

    return cards;
  }

  /**
   * Extract a flush selection
   * @param {HTMLElement} container - The container element
   * @returns {Array} Array of card objects
   */
  extractFlush(container) {
    const cards = [];

    const flushSuit = container.querySelector(".flush-suit-select")?.value;
    const flushRanks = container.querySelectorAll(".flush-rank-select");

    if (flushSuit && flushRanks.length >= 5) {
      for (let i = 0; i < 5; i++) {
        if (flushRanks[i]) {
          cards.push({
            rank: flushRanks[i].value,
            suit: flushSuit,
          });
        }
      }
    }

    return cards;
  }

  /**
   * Extract a full house selection
   * @param {HTMLElement} container - The container element
   * @returns {Array} Array of card objects
   */
  extractFullHouse(container) {
    const cards = [];

    // Three of a kind part
    const fhTripsRank = container.querySelector(".trips-rank-select")?.value;
    const fhTripsSuits = container.querySelectorAll(".trips-suit-select");

    if (fhTripsRank && fhTripsSuits.length >= 3) {
      for (let i = 0; i < 3; i++) {
        if (fhTripsSuits[i]) {
          cards.push({
            rank: fhTripsRank,
            suit: fhTripsSuits[i].value,
          });
        }
      }
    }

    // Pair part
    const fhPairRank = container.querySelector(".pair-rank-select")?.value;
    const fhPairSuits = container.querySelectorAll(".pair-suit-select");

    if (fhPairRank && fhPairSuits.length >= 2) {
      for (let i = 0; i < 2; i++) {
        if (fhPairSuits[i]) {
          cards.push({
            rank: fhPairRank,
            suit: fhPairSuits[i].value,
          });
        }
      }
    }

    return cards;
  }

  /**
   * Extract a four of a kind selection
   * @param {HTMLElement} container - The container element
   * @returns {Array} Array of card objects
   */
  extractFourOfAKind(container) {
    const cards = [];

    const quadsRank = container.querySelector(".quads-rank-select")?.value;

    if (quadsRank) {
      // For four of a kind, we use all four suits
      this.suits.forEach((suit) => {
        cards.push({
          rank: quadsRank,
          suit: suit.id,
        });
      });
    }

    return cards;
  }

  /**
   * Extract a straight flush selection
   * @param {HTMLElement} container - The container element
   * @returns {Array} Array of card objects
   */
  extractStraightFlush(container) {
    const cards = [];

    const startRank = container.querySelector(".straight-flush-start-select")?.value;
    const selectedSuit = container.querySelector(".straight-flush-suit-select")?.value;

    if (startRank && selectedSuit) {
      const startIndex = this.ranks.indexOf(startRank);

      // If valid start rank found
      if (startIndex !== -1 && startIndex <= this.ranks.length - 5) {
        // Add 5 consecutive cards of the same suit
        for (let i = 0; i < 5; i++) {
          cards.push({
            rank: this.ranks[startIndex + i],
            suit: selectedSuit,
          });
        }
      }
    }

    return cards;
  }

  /**
   * Extract a royal flush selection
   * @param {HTMLElement} container - The container element
   * @returns {Array} Array of card objects
   */
  extractRoyalFlush(container) {
    const cards = [];

    const selectedSuit = container.querySelector(".royal-flush-suit-select")?.value;

    if (selectedSuit) {
      // Royal flush is always 10, J, Q, K, A of the same suit
      const royalRanks = ["10", "J", "Q", "K", "A"];

      royalRanks.forEach((rank) => {
        cards.push({
          rank: rank,
          suit: selectedSuit,
        });
      });
    }

    return cards;
  }

  /**
   * Extract generic cards from multiple card selectors
   * @param {HTMLElement} container - The container element
   * @returns {Array} Array of card objects
   */
  extractGenericCards(container) {
    const cards = [];

    // Generic approach with multiple card selectors
    const cardSelectors = container.querySelectorAll(".card-selector");

    cardSelectors.forEach((selector) => {
      const rankSelect = selector.querySelector(".rank-select");
      const suitSelect = selector.querySelector(".suit-select");

      if (rankSelect && suitSelect) {
        cards.push({
          rank: rankSelect.value,
          suit: suitSelect.value,
        });
      }
    });

    return cards;
  }

  /**
   * Extract cards from a checkbox group (used for high flush)
   * @param {HTMLElement} container - The container element
   * @returns {Array} Array of card objects
   */
  extractHighFlush(container) {
    const cards = [];

    const selectedSuit = container.querySelector(".high-flush-suit-select")?.value;
    const checkedBoxes = container.querySelectorAll(".high-card-checkbox:checked");

    if (selectedSuit && checkedBoxes.length > 0) {
      checkedBoxes.forEach((checkbox) => {
        cards.push({
          rank: checkbox.value,
          suit: selectedSuit,
        });
      });
    }

    return cards;
  }

  /**
   * Extract and validate a complete hand declaration
   * @param {HTMLElement} container - The container element
   * @returns {Object|null} Declaration object or null if invalid
   */
  extractDeclaration(container) {
    const handTypeSelect = container.querySelector("#hand-type-select");
    if (!handTypeSelect) return null;

    const handType = handTypeSelect.value;
    const cards = this.getSelectedCardsFromInterface(container);

    // Basic validation: check if we have any cards
    if (!cards.length) return null;

    return {
      type: handType,
      cards: cards,
    };
  }
}

export default HandExtractor;
