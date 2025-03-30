import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { HAND_RANKINGS } from "../../../utils/constants";
import HighCardSelector from "./HighCardSelector";
import OnePairSelector from "./OnePairSelector";
import TwoPairSelector from "./TwoPairSelector";
import ThreeOfAKindSelector from "./ThreeOfAKindSelector";
import StraightSelector from "./StraightSelector";
import FlushSelector from "./FlushSelector";
import FullHouseSelector from "./FullHouseSelector";
import FourOfAKindSelector from "./FourOfAKindSelector";
import StraightFlushSelector from "./StraightFlushSelector";
import RoyalFlushSelector from "./RoyalFlushSelector";
import "../GameControls.css";

/**
 * Main component for selecting cards for a declaration
 */
const CardSelector = ({ currentDeclaration, onSelect }) => {
  // Selected hand type
  const [handType, setHandType] = useState(currentDeclaration ? currentDeclaration.type : "HIGH_CARD");

  // Selected cards from the child selector
  const [selectedCards, setSelectedCards] = useState([]);

  // Error state
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);

  // Available hand types - filter based on current declaration
  const getAvailableHandTypes = () => {
    const allHandTypes = [
      { id: "HIGH_CARD", name: "High Card" },
      { id: "ONE_PAIR", name: "One Pair" },
      { id: "TWO_PAIR", name: "Two Pair" },
      { id: "THREE_OF_A_KIND", name: "Three of a Kind" },
      { id: "STRAIGHT", name: "Straight" },
      { id: "FLUSH", name: "Flush" },
      { id: "FULL_HOUSE", name: "Full House" },
      { id: "FOUR_OF_A_KIND", name: "Four of a Kind" },
      { id: "STRAIGHT_FLUSH", name: "Straight Flush" },
      { id: "ROYAL_FLUSH", name: "Royal Flush" },
    ];

    if (!currentDeclaration) {
      return allHandTypes;
    }

    // Filter hand types based on ranking compared to current declaration
    const currentRanking = HAND_RANKINGS[currentDeclaration.type] || 0;
    return allHandTypes.filter((type) => {
      const typeRanking = HAND_RANKINGS[type.id] || 0;
      return typeRanking >= currentRanking;
    });
  };

  // Handle selecting different hand types
  const handleHandTypeChange = (e) => {
    setHandType(e.target.value);
    setSelectedCards([]); // Clear selected cards when changing hand type
    setError(""); // Clear any previous error
    setIsValid(false); // Reset validation
  };

  // Handle cards selected by child selector
  const handleCardsSelected = (cards) => {
    setSelectedCards(cards);

    // Validate the selection
    try {
      validateDeclaration(handType, cards, currentDeclaration);
      setIsValid(cards.length > 0);
      setError("");
    } catch (validationError) {
      setIsValid(false);
      setError(validationError.message || "Invalid selection");
    }

    // Call the parent onSelect to pass the handType and cards
    if (onSelect && cards.length > 0) {
      onSelect(handType, cards);
    }
  };

  // Inline validation function
  const validateDeclaration = (handType, cards, currentDeclaration) => {
    // Basic validation
    if (!handType || !cards || cards.length === 0) {
      throw new Error("Invalid hand selection");
    }

    // Check if selected hand type is higher than current declaration
    if (currentDeclaration) {
      const currentRanking = HAND_RANKINGS[currentDeclaration.type] || 0;
      const newRanking = HAND_RANKINGS[handType] || 0;

      if (newRanking < currentRanking) {
        throw new Error("Your declaration must be of equal or higher rank");
      }
    }

    // Check for correct number of cards based on hand type
    const requiredCards = {
      HIGH_CARD: 1,
      ONE_PAIR: 2,
      TWO_PAIR: 4,
      THREE_OF_A_KIND: 3,
      STRAIGHT: 5,
      FLUSH: 5,
      FULL_HOUSE: 5,
      FOUR_OF_A_KIND: 4,
      STRAIGHT_FLUSH: 5,
      ROYAL_FLUSH: 5,
    };

    if (cards.length !== requiredCards[handType]) {
      throw new Error(`A ${getHandTypeName(handType)} requires ${requiredCards[handType]} cards`);
    }

    return true;
  };

  // Get display name for a hand type
  const getHandTypeName = (type) => {
    const handNames = {
      HIGH_CARD: "High Card",
      ONE_PAIR: "One Pair",
      TWO_PAIR: "Two Pair",
      THREE_OF_A_KIND: "Three of a Kind",
      STRAIGHT: "Straight",
      FLUSH: "Flush",
      FULL_HOUSE: "Full House",
      FOUR_OF_A_KIND: "Four of a Kind",
      STRAIGHT_FLUSH: "Straight Flush",
      ROYAL_FLUSH: "Royal Flush",
    };
    return handNames[type] || type;
  };

  // Handle current declaration changes
  useEffect(() => {
    if (currentDeclaration) {
      // Set hand type to at least the current declaration's type
      const currentRanking = HAND_RANKINGS[currentDeclaration.type] || 0;
      const selectedRanking = HAND_RANKINGS[handType] || 0;

      if (selectedRanking < currentRanking) {
        setHandType(currentDeclaration.type);
      }
    }
  }, [currentDeclaration]);

  // Render the appropriate selector based on hand type
  const renderSelector = () => {
    switch (handType) {
      case "HIGH_CARD":
        return <HighCardSelector onSelect={handleCardsSelected} />;
      case "ONE_PAIR":
        return <OnePairSelector onSelect={handleCardsSelected} />;
      case "TWO_PAIR":
        return <TwoPairSelector onSelect={handleCardsSelected} />;
      case "THREE_OF_A_KIND":
        return <ThreeOfAKindSelector onSelect={handleCardsSelected} />;
      case "STRAIGHT":
        return <StraightSelector onSelect={handleCardsSelected} />;
      case "FLUSH":
        return <FlushSelector onSelect={handleCardsSelected} />;
      case "FULL_HOUSE":
        return <FullHouseSelector onSelect={handleCardsSelected} />;
      case "FOUR_OF_A_KIND":
        return <FourOfAKindSelector onSelect={handleCardsSelected} />;
      case "STRAIGHT_FLUSH":
        return <StraightFlushSelector onSelect={handleCardsSelected} />;
      case "ROYAL_FLUSH":
        return <RoyalFlushSelector onSelect={handleCardsSelected} />;
      default:
        return <HighCardSelector onSelect={handleCardsSelected} />;
    }
  };

  const availableHandTypes = getAvailableHandTypes();

  return (
    <div className="card-selector-component">
      <div className="hand-type-selection">
        <label htmlFor="hand-type-select">Select hand type:</label>
        <select id="hand-type-select" value={handType} onChange={handleHandTypeChange} className="hand-type-select">
          {availableHandTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {currentDeclaration && (
        <div className="current-declaration-info">
          <p>
            Current declaration: <strong>{availableHandTypes.find((t) => t.id === currentDeclaration.type)?.name}</strong>
          </p>
          <p className="declaration-guidance">Your declaration must be of equal or higher rank.</p>
        </div>
      )}

      <div className="selector-container">{renderSelector()}</div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

CardSelector.propTypes = {
  currentDeclaration: PropTypes.shape({
    type: PropTypes.string.isRequired,
    cards: PropTypes.array.isRequired,
  }),
  onSelect: PropTypes.func.isRequired,
};

export default CardSelector;
