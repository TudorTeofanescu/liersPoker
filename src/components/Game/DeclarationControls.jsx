import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import CardSelector from "./Selectors/CardSelector";
import { HAND_NAMES, HAND_RANKINGS } from "../../utils/constants";
import "./GameControls.css";

/**
 * Controls for making declarations in LiersPoker
 */
const DeclarationControls = ({ currentDeclaration, onDeclare }) => {
  // Selected hand type and cards
  const [selectedHandType, setSelectedHandType] = useState(null);
  const [selectedCards, setSelectedCards] = useState([]);

  // Validation state
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState(false);

  // Handle card selection from the CardSelector
  const handleCardSelection = (handType, cards) => {
    setSelectedHandType(handType);
    setSelectedCards(cards);

    // Validate the selection
    try {
      const isValidSelection = validateDeclaration(handType, cards, currentDeclaration);
      setIsValid(isValidSelection && cards.length > 0);
      setError("");
    } catch (validationError) {
      setIsValid(false);
      setError(validationError.message || "Invalid selection");
    }
  };

  // Inline validation function (replacing HandValidator)
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
      throw new Error(`A ${HAND_NAMES[HAND_RANKINGS[handType]]} requires ${requiredCards[handType]} cards`);
    }

    return true;
  };

  // Handle declaration button click
  const handleDeclare = () => {
    if (!isValid) return;

    onDeclare(selectedHandType, selectedCards);
  };

  // Format the current declaration for display
  const formatDeclaration = (declaration) => {
    if (!declaration) return "None";

    const handName = HAND_NAMES[HAND_RANKINGS[declaration.type]] || declaration.type;
    return handName;
  };

  return (
    <div className="declaration-controls">
      <h3 className="declaration-title">Make a Declaration</h3>

      {currentDeclaration && (
        <div className="current-declaration">
          <span className="label">Current Declaration:</span>
          <span className="value">{formatDeclaration(currentDeclaration)}</span>
        </div>
      )}

      <div className="declaration-explanation">
        <p>Declare a hand that you believe exists among all players' cards, or bluff!</p>
        <p>Your declaration must be higher than the current declaration.</p>
      </div>

      <div className="declaration-form">
        <CardSelector currentDeclaration={currentDeclaration} onSelect={handleCardSelection} />

        {error && <div className="error-message">{error}</div>}

        <button className="declare-button" onClick={handleDeclare} disabled={!isValid}>
          Make Declaration
        </button>
      </div>

      <div className="declaration-tips">
        <h4>Tips:</h4>
        <ul>
          <li>A successful bluff can force your opponents to take risks</li>
          <li>Higher hand types are less likely to exist, making them riskier to declare</li>
          <li>Consider what cards you've seen when deciding what to declare</li>
        </ul>
      </div>
    </div>
  );
};

DeclarationControls.propTypes = {
  currentDeclaration: PropTypes.shape({
    type: PropTypes.string.isRequired,
    cards: PropTypes.array.isRequired,
  }),
  onDeclare: PropTypes.func.isRequired,
};

export default DeclarationControls;
