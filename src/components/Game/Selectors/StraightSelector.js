import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CARD_RANKS, CARD_SUITS } from "../../../utils/constants";
import "./Selectors.css";

/**
 * Selector for choosing a straight hand
 */
const StraightSelector = ({ onSelect }) => {
  // Start rank for the straight (this will be the lowest card)
  const [startRank, setStartRank] = useState(CARD_RANKS[CARD_RANKS.length - 5]); // Default to 10 (for a 10-J-Q-K-A straight)

  // Store a suit for each card in the straight
  const [selectedSuits, setSelectedSuits] = useState(
    // Default to different suits for variety
    Array(5)
      .fill()
      .map((_, index) => CARD_SUITS[index % CARD_SUITS.length].id)
  );

  const [error, setError] = useState("");

  // Validate start rank is valid for a straight
  useEffect(() => {
    const startIndex = CARD_RANKS.indexOf(startRank);
    if (startIndex === -1 || startIndex > CARD_RANKS.length - 5) {
      // Invalid start rank (not enough cards for a 5-card straight)
      setError("Invalid starting rank for a straight");
      return;
    } else {
      setError("");
    }

    // Create cards for the straight
    const cards = [];
    for (let i = 0; i < 5; i++) {
      const rankIndex = startIndex + i;
      if (rankIndex < CARD_RANKS.length) {
        cards.push({
          id: `${CARD_RANKS[rankIndex]}_${selectedSuits[i]}_${Math.random().toString(36).substring(2, 8)}`,
          rank: CARD_RANKS[rankIndex],
          suit: selectedSuits[i],
          value: getCardValue(CARD_RANKS[rankIndex]),
        });
      }
    }

    onSelect(cards);
  }, [startRank, selectedSuits, onSelect]);

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

  const handleStartRankChange = (e) => {
    setStartRank(e.target.value);
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

  // Get valid starting ranks for a straight (can't start higher than 10)
  const validStartRanks = CARD_RANKS.slice(0, CARD_RANKS.length - 4);

  // Get the sequence of ranks for the current straight
  const getStraightRanks = () => {
    const startIndex = CARD_RANKS.indexOf(startRank);
    if (startIndex === -1 || startIndex > CARD_RANKS.length - 5) {
      return [];
    }

    return Array(5)
      .fill()
      .map((_, i) => CARD_RANKS[startIndex + i]);
  };

  const straightRanks = getStraightRanks();

  return (
    <div className="card-selector straight-selector">
      <h4 className="selector-title">Select a straight (5 cards in sequence):</h4>

      <div className="selector-form">
        <div className="form-group">
          <label htmlFor="straight-start">Starting rank:</label>
          <select id="straight-start" value={startRank} onChange={handleStartRankChange} className="rank-select">
            {validStartRanks.map((rank) => (
              <option key={rank} value={rank}>
                {rank} ({rank} to {CARD_RANKS[CARD_RANKS.indexOf(rank) + 4]})
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="cards-suits-container">
            <div className="suits-label">Select suits for each card:</div>

            {straightRanks.map((rank, index) => (
              <div key={index} className="card-suit-selector">
                <div className="card-label">{rank}:</div>
                <select value={selectedSuits[index]} onChange={(e) => handleSuitChange(index, e)} className="suit-select">
                  {CARD_SUITS.map((suit) => (
                    <option key={suit.id} value={suit.id}>
                      {suit.name} {suit.symbol}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {!error && (
        <div className="card-preview">
          <h4 className="preview-title">Preview:</h4>
          <div className="preview-cards">
            {straightRanks.map((rank, index) => {
              const suitDetails = getSuitDetails(selectedSuits[index]);
              return (
                <div key={index} className={`preview-card ${suitDetails.color}`}>
                  {rank}
                  {suitDetails.symbol}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

StraightSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default StraightSelector;
