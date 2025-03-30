import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CARD_RANKS, CARD_SUITS } from "../../../utils/constants";
import "./Selectors.css";

/**
 * Selector for choosing a two pair hand
 */
const TwoPairSelector = ({ onSelect }) => {
  // For first pair, default to Ace
  const [firstPairRank, setFirstPairRank] = useState(CARD_RANKS[CARD_RANKS.length - 1]);
  const [firstPairSuits, setFirstPairSuits] = useState([
    CARD_SUITS[0].id, // Default to hearts
    CARD_SUITS[1].id, // Default to diamonds
  ]);

  // For second pair, default to King
  const [secondPairRank, setSecondPairRank] = useState(CARD_RANKS[CARD_RANKS.length - 2]);
  const [secondPairSuits, setSecondPairSuits] = useState([
    CARD_SUITS[2].id, // Default to clubs
    CARD_SUITS[3].id, // Default to spades
  ]);

  const [error, setError] = useState("");

  // Notify parent component when selection changes
  useEffect(() => {
    // Validate ranks are different
    if (firstPairRank === secondPairRank) {
      setError("The two pairs must have different ranks");
      return;
    }

    // Validate suits within each pair are different
    if (firstPairSuits[0] === firstPairSuits[1]) {
      setError("First pair must use two different suits");
      return;
    }

    if (secondPairSuits[0] === secondPairSuits[1]) {
      setError("Second pair must use two different suits");
      return;
    }

    setError("");

    // Create cards for first pair
    const firstPairCards = firstPairSuits.map((suit) => ({
      id: `${firstPairRank}_${suit}_${Math.random().toString(36).substring(2, 8)}`,
      rank: firstPairRank,
      suit: suit,
      value: getCardValue(firstPairRank),
    }));

    // Create cards for second pair
    const secondPairCards = secondPairSuits.map((suit) => ({
      id: `${secondPairRank}_${suit}_${Math.random().toString(36).substring(2, 8)}`,
      rank: secondPairRank,
      suit: suit,
      value: getCardValue(secondPairRank),
    }));

    // Combine both pairs
    const allCards = [...firstPairCards, ...secondPairCards];

    onSelect(allCards);
  }, [firstPairRank, firstPairSuits, secondPairRank, secondPairSuits, onSelect]);

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

  const handleFirstPairRankChange = (e) => {
    const newRank = e.target.value;
    setFirstPairRank(newRank);

    // If the new rank matches the second pair, adjust the second pair
    if (newRank === secondPairRank) {
      // Find a different rank
      const rankIndex = CARD_RANKS.indexOf(newRank);
      const newSecondRankIndex = (rankIndex + 1) % CARD_RANKS.length;
      setSecondPairRank(CARD_RANKS[newSecondRankIndex]);
    }
  };

  const handleSecondPairRankChange = (e) => {
    const newRank = e.target.value;
    setSecondPairRank(newRank);

    // If the new rank matches the first pair, adjust the first pair
    if (newRank === firstPairRank) {
      // Find a different rank
      const rankIndex = CARD_RANKS.indexOf(newRank);
      const newFirstRankIndex = (rankIndex + 1) % CARD_RANKS.length;
      setFirstPairRank(CARD_RANKS[newFirstRankIndex]);
    }
  };

  const handleFirstPairSuitChange = (index, e) => {
    const newSuits = [...firstPairSuits];
    newSuits[index] = e.target.value;
    setFirstPairSuits(newSuits);
  };

  const handleSecondPairSuitChange = (index, e) => {
    const newSuits = [...secondPairSuits];
    newSuits[index] = e.target.value;
    setSecondPairSuits(newSuits);
  };

  // Get suit details for preview
  const getSuitDetails = (suitId) => {
    return CARD_SUITS.find((suit) => suit.id === suitId) || CARD_SUITS[0];
  };

  return (
    <div className="card-selector two-pair-selector">
      <h4 className="selector-title">Select two pairs:</h4>

      <div className="selector-form">
        {/* First pair section */}
        <div className="pair-section">
          <h5 className="pair-heading">First pair:</h5>

          <div className="form-group">
            <label htmlFor="first-pair-rank">Rank:</label>
            <select id="first-pair-rank" value={firstPairRank} onChange={handleFirstPairRankChange} className="rank-select">
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
                <label htmlFor={`first-pair-suit-${index}`}>Suit {index + 1}:</label>
                <select
                  id={`first-pair-suit-${index}`}
                  value={firstPairSuits[index]}
                  onChange={(e) => handleFirstPairSuitChange(index, e)}
                  className="suit-select"
                >
                  {CARD_SUITS.map((suit) => (
                    <option key={suit.id} value={suit.id}>
                      {suit.name} {suit.symbol}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Second pair section */}
        <div className="pair-section">
          <h5 className="pair-heading">Second pair:</h5>

          <div className="form-group">
            <label htmlFor="second-pair-rank">Rank:</label>
            <select id="second-pair-rank" value={secondPairRank} onChange={handleSecondPairRankChange} className="rank-select">
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
                <label htmlFor={`second-pair-suit-${index}`}>Suit {index + 1}:</label>
                <select
                  id={`second-pair-suit-${index}`}
                  value={secondPairSuits[index]}
                  onChange={(e) => handleSecondPairSuitChange(index, e)}
                  className="suit-select"
                >
                  {CARD_SUITS.map((suit) => (
                    <option key={suit.id} value={suit.id}>
                      {suit.name} {suit.symbol}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="card-preview">
        <h4 className="preview-title">Preview:</h4>
        <div className="preview-cards">
          {/* First pair preview */}
          {firstPairSuits.map((suitId, index) => {
            const suitDetails = getSuitDetails(suitId);
            return (
              <div key={`first-${index}`} className={`preview-card ${suitDetails.color}`}>
                {firstPairRank}
                {suitDetails.symbol}
              </div>
            );
          })}

          {/* Second pair preview */}
          {secondPairSuits.map((suitId, index) => {
            const suitDetails = getSuitDetails(suitId);
            return (
              <div key={`second-${index}`} className={`preview-card ${suitDetails.color}`}>
                {secondPairRank}
                {suitDetails.symbol}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

TwoPairSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default TwoPairSelector;
