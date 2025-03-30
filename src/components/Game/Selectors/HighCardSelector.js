import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CARD_RANKS, CARD_SUITS } from "../../../utils/constants";
import "./Selectors.css";

/**
 * Selector for choosing a high card hand
 */
const HighCardSelector = ({ onSelect }) => {
  const [selectedRank, setSelectedRank] = useState(CARD_RANKS[CARD_RANKS.length - 1]); // Default to Ace
  const [selectedSuit, setSelectedSuit] = useState(CARD_SUITS[0].id); // Default to hearts
  const [hasInitialized, setHasInitialized] = useState(false);

  // Notify parent component when selection changes, but only after initial render or user changes
  useEffect(() => {
    // Skip the first render to avoid the infinite loop
    if (!hasInitialized) {
      setHasInitialized(true);

      // Call onSelect with initial values
      const card = {
        id: `${selectedRank}_${selectedSuit}_${Math.random().toString(36).substring(2, 8)}`,
        rank: selectedRank,
        suit: selectedSuit,
        value: getCardValue(selectedRank),
      };

      onSelect([card]);
      return;
    }

    const card = {
      id: `${selectedRank}_${selectedSuit}_${Math.random().toString(36).substring(2, 8)}`,
      rank: selectedRank,
      suit: selectedSuit,
      value: getCardValue(selectedRank),
    };

    onSelect([card]); // Pass as array to maintain consistency with other selectors
  }, [selectedRank, selectedSuit, hasInitialized]);

  const getCardValue = (rank) => {
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
    return values[rank] || 0;
  };

  const handleRankChange = (e) => {
    setSelectedRank(e.target.value);
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
    <div className="card-selector high-card-selector">
      <h4 className="selector-title">Select a high card:</h4>

      <div className="selector-form">
        <div className="form-group">
          <label htmlFor="high-card-rank">Rank:</label>
          <select id="high-card-rank" value={selectedRank} onChange={handleRankChange} className="rank-select">
            {CARD_RANKS.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="high-card-suit">Suit:</label>
          <select id="high-card-suit" value={selectedSuit} onChange={handleSuitChange} className="suit-select">
            {CARD_SUITS.map((suit) => (
              <option key={suit.id} value={suit.id}>
                {suit.name} {suit.symbol}
              </option>
            ))}
          </select>
        </div>

        <div className="high-card-description">
          <p>A high card is the most basic hand in poker, consisting of a single card with no other combinations.</p>
        </div>
      </div>

      <div className="card-preview">
        <h4 className="preview-title">Preview:</h4>
        <div className="preview-cards">
          <div className={`preview-card ${suitDetails.color}`}>
            {selectedRank}
            {suitDetails.symbol}
          </div>
        </div>
        <p className="preview-desc">{selectedRank} high</p>
      </div>
    </div>
  );
};

HighCardSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default HighCardSelector;
