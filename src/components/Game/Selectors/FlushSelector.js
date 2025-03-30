import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CARD_RANKS, CARD_SUITS } from "../../../utils/constants";
import "./Selectors.css";

/**
 * Selector for choosing a flush hand
 */
const FlushSelector = ({ onSelect }) => {
  // Selected suit for the flush
  const [selectedSuit, setSelectedSuit] = useState(CARD_SUITS[0].id); // Default to hearts

  // Selected ranks for the flush
  const [selectedRanks, setSelectedRanks] = useState([
    "A",
    "K",
    "Q",
    "J",
    "10", // Default to high flush
  ]);

  const [error, setError] = useState("");

  // Notify parent component when selection changes
  useEffect(() => {
    // Validate we have 5 unique ranks
    const uniqueRanks = new Set(selectedRanks);
    if (uniqueRanks.size !== 5) {
      setError("A flush must have 5 different ranks");
      return;
    } else {
      setError("");
    }

    // Create cards for the flush
    const cards = selectedRanks.map((rank) => ({
      id: `${rank}_${selectedSuit}_${Math.random().toString(36).substring(2, 8)}`,
      rank: rank,
      suit: selectedSuit,
      value: getCardValue(rank),
    }));

    onSelect(cards);
  }, [selectedSuit, selectedRanks, onSelect]);

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

  const handleSuitChange = (e) => {
    setSelectedSuit(e.target.value);
  };

  const handleRankChange = (index, e) => {
    const newRanks = [...selectedRanks];
    newRanks[index] = e.target.value;
    setSelectedRanks(newRanks);
  };

  // Get suit details for preview
  const getSuitDetails = (suitId) => {
    return CARD_SUITS.find((suit) => suit.id === suitId) || CARD_SUITS[0];
  };

  // Sort ranks by card value for display
  const sortedRanks = [...selectedRanks].sort((a, b) => getCardValue(b) - getCardValue(a));

  const suitDetails = getSuitDetails(selectedSuit);

  return (
    <div className="card-selector flush-selector">
      <h4 className="selector-title">Select a flush (5 cards of the same suit):</h4>

      <div className="selector-form">
        <div className="form-group">
          <label htmlFor="flush-suit">Suit:</label>
          <select id="flush-suit" value={selectedSuit} onChange={handleSuitChange} className="suit-select">
            {CARD_SUITS.map((suit) => (
              <option key={suit.id} value={suit.id}>
                {suit.name} {suit.symbol}
              </option>
            ))}
          </select>
        </div>

        <div className="cards-ranks-container">
          <div className="ranks-label">Select five different ranks:</div>

          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} className="form-group">
              <label htmlFor={`flush-rank-${index}`}>Card {index + 1}:</label>
              <select id={`flush-rank-${index}`} value={selectedRanks[index]} onChange={(e) => handleRankChange(index, e)} className="rank-select">
                {CARD_RANKS.map((rank) => (
                  <option key={rank} value={rank}>
                    {rank}
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
          {sortedRanks.map((rank, index) => (
            <div key={index} className={`preview-card ${suitDetails.color}`}>
              {rank}
              {suitDetails.symbol}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

FlushSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default FlushSelector;
