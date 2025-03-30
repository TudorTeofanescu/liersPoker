import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CARD_RANKS, CARD_SUITS } from "../../../utils/constants";
import "./Selectors.css";

/**
 * Selector for choosing a full house hand
 */
const FullHouseSelector = ({ onSelect }) => {
  // For three of a kind component, default to Ace
  const [tripsRank, setTripsRank] = useState(CARD_RANKS[CARD_RANKS.length - 1]);
  const [tripsSuits, setTripsSuits] = useState([
    CARD_SUITS[0].id, // Default to hearts
    CARD_SUITS[1].id, // Default to diamonds
    CARD_SUITS[2].id, // Default to clubs
  ]);

  // For pair component, default to King
  const [pairRank, setPairRank] = useState(CARD_RANKS[CARD_RANKS.length - 2]);
  const [pairSuits, setPairSuits] = useState([
    CARD_SUITS[3].id, // Default to spades
    CARD_SUITS[0].id, // Default to hearts (this would create an error, to be caught by validation)
  ]);

  const [error, setError] = useState("");

  // Notify parent component when selection changes
  useEffect(() => {
    // Validate ranks are different
    if (tripsRank === pairRank) {
      setError("The three of a kind and pair must have different ranks");
      return;
    }

    // Validate suits within three of a kind are different
    const uniqueTripsSuits = new Set(tripsSuits);
    if (uniqueTripsSuits.size !== tripsSuits.length) {
      setError("Three of a kind must use three different suits");
      return;
    }

    // Validate suits within pair are different
    if (pairSuits[0] === pairSuits[1]) {
      setError("Pair must use two different suits");
      return;
    }

    // Validate there's no suit conflict between trips and pair
    const allSuits = [...tripsSuits, ...pairSuits];
    const uniqueSuits = new Set(allSuits);
    if (uniqueSuits.size !== allSuits.length) {
      setError("Each card must have a unique combination of rank and suit");
      return;
    }

    setError("");

    // Create cards for three of a kind
    const tripsCards = tripsSuits.map((suit) => ({
      id: `${tripsRank}_${suit}_${Math.random().toString(36).substring(2, 8)}`,
      rank: tripsRank,
      suit: suit,
      value: getCardValue(tripsRank),
    }));

    // Create cards for pair
    const pairCards = pairSuits.map((suit) => ({
      id: `${pairRank}_${suit}_${Math.random().toString(36).substring(2, 8)}`,
      rank: pairRank,
      suit: suit,
      value: getCardValue(pairRank),
    }));

    // Combine for full house
    const allCards = [...tripsCards, ...pairCards];

    onSelect(allCards);
  }, [tripsRank, tripsSuits, pairRank, pairSuits, onSelect]);

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

  const handleTripsRankChange = (e) => {
    const newRank = e.target.value;
    setTripsRank(newRank);

    // If the new rank matches the pair, adjust the pair
    if (newRank === pairRank) {
      // Find a different rank
      const rankIndex = CARD_RANKS.indexOf(newRank);
      const newPairRankIndex = (rankIndex + 1) % CARD_RANKS.length;
      setPairRank(CARD_RANKS[newPairRankIndex]);
    }
  };

  const handlePairRankChange = (e) => {
    const newRank = e.target.value;
    setPairRank(newRank);

    // If the new rank matches the trips, adjust the trips
    if (newRank === tripsRank) {
      // Find a different rank
      const rankIndex = CARD_RANKS.indexOf(newRank);
      const newTripsRankIndex = (rankIndex + 1) % CARD_RANKS.length;
      setTripsRank(CARD_RANKS[newTripsRankIndex]);
    }
  };

  const handleTripsSuitChange = (index, e) => {
    const newSuits = [...tripsSuits];
    newSuits[index] = e.target.value;
    setTripsSuits(newSuits);
  };

  const handlePairSuitChange = (index, e) => {
    const newSuits = [...pairSuits];
    newSuits[index] = e.target.value;
    setPairSuits(newSuits);
  };

  // Get suit details for preview
  const getSuitDetails = (suitId) => {
    return CARD_SUITS.find((suit) => suit.id === suitId) || CARD_SUITS[0];
  };

  return (
    <div className="card-selector full-house-selector">
      <h4 className="selector-title">Select a full house (three of a kind and a pair):</h4>

      <div className="selector-form">
        {/* Three of a kind section */}
        <div className="section">
          <h5 className="section-heading">Three of a kind:</h5>

          <div className="form-group">
            <label htmlFor="trips-rank">Rank:</label>
            <select id="trips-rank" value={tripsRank} onChange={handleTripsRankChange} className="rank-select">
              {CARD_RANKS.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
          </div>

          <div className="suits-container">
            <div className="suits-label">Select three different suits:</div>

            {[0, 1, 2].map((index) => (
              <div key={index} className="form-group">
                <label htmlFor={`trips-suit-${index}`}>Suit {index + 1}:</label>
                <select id={`trips-suit-${index}`} value={tripsSuits[index]} onChange={(e) => handleTripsSuitChange(index, e)} className="suit-select">
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

        {/* Pair section */}
        <div className="section">
          <h5 className="section-heading">Pair:</h5>

          <div className="form-group">
            <label htmlFor="pair-rank">Rank:</label>
            <select id="pair-rank" value={pairRank} onChange={handlePairRankChange} className="rank-select">
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
                <select id={`pair-suit-${index}`} value={pairSuits[index]} onChange={(e) => handlePairSuitChange(index, e)} className="suit-select">
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
          {/* Three of a kind preview */}
          {tripsSuits.map((suitId, index) => {
            const suitDetails = getSuitDetails(suitId);
            return (
              <div key={`trips-${index}`} className={`preview-card ${suitDetails.color}`}>
                {tripsRank}
                {suitDetails.symbol}
              </div>
            );
          })}

          {/* Pair preview */}
          {pairSuits.map((suitId, index) => {
            const suitDetails = getSuitDetails(suitId);
            return (
              <div key={`pair-${index}`} className={`preview-card ${suitDetails.color}`}>
                {pairRank}
                {suitDetails.symbol}
              </div>
            );
          })}
        </div>

        <div className="full-house-description">
          {!error && (
            <p className="preview-desc">
              {tripsRank}s full of {pairRank}s
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

FullHouseSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
};

export default FullHouseSelector;
