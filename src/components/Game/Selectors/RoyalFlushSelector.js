import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CARD_SUITS } from "../../../utils/constants";
import "./Selectors.css";

/**
 * Selector for choosing a royal flush hand
 */
const RoyalFlushSelector = ({ onSelect }) => {
  // Selected suit for the royal flush
  const [selectedSuit, setSelectedSuit] = useState(CARD_SUITS[0].id); // Default to hearts

  // For royal flush, the ranks are fixed: 10, J, Q, K, A
  const royalRanks = ["10", "J", "Q", "K", "A"];

  // Notify parent component when selection changes
  useEffect(() => {
    // Create cards for the royal flush
    const cards = royalRanks.map((rank) => ({
      id: `${rank}_${selectedSuit}_${Math.random().toString(36).substring(2, 8)}`,
      rank: rank,
      suit: selectedSuit,
      value: getCardValue(rank),
    }));

    onSelect(cards);
  }, [selectedSuit, onSelect]);

  const getCardValue = (rank) => {
    const values = {
      10: 10,
      J: 11,
      Q: 12,
      K: 13,
      A: 14,
    };
    return values[rank] || 0;
  };

  const handleSuitChange = (e) => {
    setSelectedSuit(e.target.value);
  };

  // Get suit details for preview
  const getSuitDetails = (suitId) => {
    return CARD_SUITS.find((suit) => suit.id === suitId) || CARD_SUITS[0];
  };

  const suitDetails = getSuitDetails(selectedSuit);

  return (
    <div className="card-selector royal-flush-selector">
      <h4 className="selector-title">Select a royal flush (10, J, Q, K, A of the same suit):</h4>

      <div className="selector-form">
        <div className="form-group">
          <label htmlFor="royal-flush-suit">Suit:</label>
          <select id="royal-flush-suit" value={selectedSuit} onChange={handleSuitChange} className="suit-select">
            {CARD_SUITS.map((suit) => (
              <option key={suit.id} value={suit.id}>
                {suit.name} {suit.symbol}
              </option>
            ))}
          </select>
        </div>

        <div className="royal-flush-description">
          <p>A royal flush is the highest possible hand in poker, consisting of 10, Jack, Queen, King, and Ace all of the same suit.</p>
        </div>
      </div>

      <div className="card-preview">
        <h4 className="preview-title">Preview:</h4>
        <div className="preview-cards">
          {royalRanks.map((rank, index) => (
            <div key={index} className={`preview-card ${suitDetails.color}`}>
              {rank}
              {suitDetails.symbol}
            </div>
          ))}
        </div>
        <p className="preview-desc">Royal Flush in {suitDetails.name}</p>
      </div>
    </div>
  );
};

RoyalFlushSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default RoyalFlushSelector;
