import React from "react";
import PropTypes from "prop-types";
import { HAND_RANKINGS, HAND_NAMES } from "../../utils/constants";
import "./ChallengeControls.css";

/**
 * Controls for challenging declarations in LiersPoker
 */
const ChallengeControls = ({ currentDeclaration, declaringPlayerId, declaringPlayerName, onChallenge, onPass }) => {
  // Format the declaration nicely
  const formatDeclaration = () => {
    if (!currentDeclaration) return "No declaration";

    const handType = HAND_NAMES[HAND_RANKINGS[currentDeclaration.type]];

    // Show additional details based on hand type
    let details = "";

    if (currentDeclaration.cards && currentDeclaration.cards.length > 0) {
      // For high card declarations, show the rank
      if (currentDeclaration.type === "HIGH_CARD") {
        details = ` (${currentDeclaration.cards[0].rank} high)`;
      }
      // For pair-based declarations, show the rank of the pair
      else if (["ONE_PAIR", "TWO_PAIR", "THREE_OF_A_KIND", "FULL_HOUSE", "FOUR_OF_A_KIND"].includes(currentDeclaration.type)) {
        details = ` of ${currentDeclaration.cards[0].rank}s`;
      }
    }

    return `${handType}${details}`;
  };

  // Get probability hint for the current declaration
  const getProbabilityHint = () => {
    if (!currentDeclaration) return "";

    const hints = {
      HIGH_CARD: "High cards are very common.",
      ONE_PAIR: "Pairs are quite common.",
      TWO_PAIR: "Two pairs are somewhat common.",
      THREE_OF_A_KIND: "Three of a kind is uncommon.",
      STRAIGHT: "Straights are relatively rare.",
      FLUSH: "Flushes are quite rare.",
      FULL_HOUSE: "Full houses are very rare.",
      FOUR_OF_A_KIND: "Four of a kind is extremely rare.",
      STRAIGHT_FLUSH: "Straight flushes are exceptionally rare.",
      ROYAL_FLUSH: "Royal flushes are the rarest possible hand.",
    };

    return hints[currentDeclaration.type] || "Consider the likelihood of this hand.";
  };

  return (
    <div className="challenge-controls">
      <h3 className="challenge-title">Challenge Decision</h3>

      <div className="declaration-display">
        <h4 className="display-heading">Current Declaration</h4>

        <div className="declaration-details">
          <p className="declarer-info">
            <strong>{declaringPlayerName}</strong> declared:
          </p>
          <p className="declared-hand">
            <strong>{formatDeclaration()}</strong>
          </p>

          {currentDeclaration && currentDeclaration.cards && (
            <div className="declaration-preview">
              {currentDeclaration.cards.map((card) => {
                const isRed = card.suit === "hearts" || card.suit === "diamonds";
                const suitSymbol =
                  {
                    hearts: "♥",
                    diamonds: "♦",
                    clubs: "♣",
                    spades: "♠",
                  }[card.suit] || "";

                return (
                  <div key={card.id} className={`preview-card ${isRed ? "red" : "black"}`}>
                    {card.rank}
                    {suitSymbol}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="challenge-decision">
        <div className="decision-explanation">
          <p>Do you believe this declaration is a bluff?</p>
          <p>If you challenge and are correct, {declaringPlayerName} receives a card.</p>
          <p>If you challenge and are wrong, you receive a card.</p>
          <p className="probability-hint">
            <em>Hint: {getProbabilityHint()}</em>
          </p>
        </div>

        <div className="decision-buttons">
          <button className="challenge-button" onClick={onChallenge}>
            TROMBON! (Challenge)
          </button>

          <button className="pass-button" onClick={onPass}>
            Pass (Accept Declaration)
          </button>
        </div>
      </div>
    </div>
  );
};

ChallengeControls.propTypes = {
  currentDeclaration: PropTypes.shape({
    type: PropTypes.string.isRequired,
    cards: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        suit: PropTypes.string.isRequired,
        rank: PropTypes.string.isRequired,
      })
    ).isRequired,
  }),
  declaringPlayerId: PropTypes.string.isRequired,
  declaringPlayerName: PropTypes.string,
  onChallenge: PropTypes.func.isRequired,
  onPass: PropTypes.func.isRequired,
};

export default ChallengeControls;
