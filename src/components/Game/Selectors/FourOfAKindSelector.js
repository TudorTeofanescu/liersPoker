import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CARD_RANKS, CARD_SUITS } from "../../../utils/constants";
import "./Selectors.css";

/**
 * Selector for choosing a four of a kind hand
 */
const FourOfAKindSelector = ({ onSelect }) => {
  const [selectedRank, setSelectedRank] = useState(CARD_RANKS[CARD_RANKS.length - 1]); // Default to Ace

  // Notify parent component when selection changes
  useEffect(() => {
    // For four of a kind, we always use all four suits
    const cards = CARD_SUITS.map((suit) => ({
      id: `${selectedRank}_${suit.id}_${Math.random().toString(36).substring(2, 8)}`,
      rank: selectedRank,
      suit: suit.id,
      value: getCardValue(selectedRank),
    }));

    onSelect(cards);
  }, [selectedRank, onSelect]);

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

  return (
    <div className="card-selector four-of-kind-selector">
      <h4 className="selector-title">Select four of a kind:</h4>

      <div className="selector-form">
        <div className="form-group">
          <label htmlFor="quads-rank">Rank:</label>
          <select id="quads-rank" value={selectedRank} onChange={handleRankChange} className="rank-select">
            {CARD_RANKS.map((rank) => (
              <option key={rank} value={rank}>
                {rank}
              </option>
            ))}
          </select>
        </div>

        <div className="suits-display">
          <div className="suits-label">Four of a kind uses all four suits:</div>
          <div className="suits-list">
            {CARD_SUITS.map((suit) => (
              <div key={suit.id} className={`suit-item ${suit.color}`}>
                {suit.symbol} {suit.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-preview">
        <h4 className="preview-title">Preview:</h4>
        <div className="preview-cards">
          {CARD_SUITS.map((suit) => (
            <div key={suit.id} className={`preview-card ${suit.color}`}>
              {selectedRank}
              {suit.symbol}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

FourOfAKindSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default FourOfAKindSelector;
