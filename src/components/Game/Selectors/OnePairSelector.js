import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CARD_RANKS, CARD_SUITS } from "../../../utils/constants";
import "./Selectors.css";

/**
 * Selector for choosing a one pair hand
 */
const OnePairSelector = ({ onSelect }) => {
  const [selectedRank, setSelectedRank] = useState(CARD_RANKS[CARD_RANKS.length - 1]); // Default to Ace
  const [selectedSuits, setSelectedSuits] = useState([
    CARD_SUITS[0].id, // Default to hearts
    CARD_SUITS[1].id, // Default to diamonds
  ]);

  const [error, setError] = useState("");

  // Notify parent component when selection changes
  useEffect(() => {
    // Validate suits are different
    if (selectedSuits[0] === selectedSuits[1]) {
      setError("A pair must use two different suits");
      return;
    } else {
      setError("");
    }

    // Create cards for the pair
    const cards = selectedSuits.map((suit) => ({
      id: `${selectedRank}_${suit}_${Math.random().toString(36).substring(2, 8)}`,
      rank: selectedRank,
      suit: suit,
      value: getCardValue(selectedRank),
    }));

    onSelect(cards);
  }, [selectedRank, selectedSuits, onSelect]);

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

  const handleSuitChange = (index, e) => {
    const newSuits = [...selectedSuits];
    newSuits[index] = e.target.value;
    setSelectedSuits(newSuits);
  };

  // Get suit details for preview
  const getSuitDetails = (suitId) => {
    return CARD_SUITS.find((suit) => suit.id === suitId) || CARD_SUITS[0];
  };

  return (
    <div className="card-selector one-pair-selector">
      <h4 className="selector-title">Select a pair:</h4>

      <div className="selector-form">
        <div className="form-group">
          <label htmlFor="pair-rank">Rank:</label>
          <select id="pair-rank" value={selectedRank} onChange={handleRankChange} className="rank-select">
            {CARD_RANKS.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
        </div>

        <div className="suits-container">
          <div className="suits-label">Select two different suits:</div>

          {[0, 1].map((index) => (
            <div key={index} className="form-group">
              <label htmlFor={`pair-suit-${index}`}>Suit {index + 1}:</label>
              <select id={`pair-suit-${index}`} value={selectedSuits[index]} onChange={(e) => handleSuitChange(index, e)} className="suit-select">
                {CARD_SUITS.map((suit) => (
                  <option key={suit.id} value={suit.id}>
                    {suit.name} {suit.symbol}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="card-preview">
        <h4 className="preview-title">Preview:</h4>
        <div className="preview-cards">
          {selectedSuits.map((suitId, index) => {
            const suitDetails = getSuitDetails(suitId);
            return (
              <div key={index} className={`preview-card ${suitDetails.color}`}>
                {selectedRank}
                {suitDetails.symbol}
              </div>
            );
          })}
        </div>
        <p className="preview-desc">Pair of {selectedRank}s</p>
      </div>

      <div className="selector-explanation">
        <p>A pair consists of two cards of the same rank with different suits.</p>
      </div>
    </div>
  );
};

OnePairSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default OnePairSelector;
