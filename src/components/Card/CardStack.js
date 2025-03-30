import React from "react";
import PropTypes from "prop-types";
import "./Card.css"; // We'll create this CSS file separately

/**
 * Playing card component for LiersPoker
 */
const Card = ({ card, faceUp = true, selectable = false, selected = false, onClick }) => {
  const isRed = card.suit === "hearts" || card.suit === "diamonds";

  const getSuitSymbol = () => {
    const symbols = {
      hearts: "♥",
      diamonds: "♦",
      clubs: "♣",
      spades: "♠",
    };
    return symbols[card.suit] || "";
  };

  const handleClick = () => {
    if (selectable && onClick) {
      onClick(card);
    }
  };

  const getCardContent = () => {
    if (!faceUp) {
      return <div className="card-back-pattern">{/* Card back pattern */}</div>;
    }

    const symbol = getSuitSymbol();
    const color = isRed ? "red" : "black";

    return (
      <>
        <div className={`card-corner top-left ${color}`}>
          {card.rank}
          <br />
          {symbol}
        </div>
        <div className={`card-center ${color}`}>{renderCardCenter(card.rank, symbol, color)}</div>
        <div className={`card-corner bottom-right ${color}`}>
          {card.rank}
          <br />
          {symbol}
        </div>
      </>
    );
  };

  const renderCardCenter = (rank, symbol, color) => {
    // For face cards (J, Q, K), render an image or symbol
    if (["J", "Q", "K"].includes(rank)) {
      return <div className="face-card">{symbol}</div>;
    }

    // For Aces, render a large centered symbol
    if (rank === "A") {
      return <div className="ace">{symbol}</div>;
    }

    // For number cards, render a pattern of symbols
    const value = parseInt(rank);
    if (!isNaN(value)) {
      return renderCardPattern(value, symbol);
    }

    // Fallback
    return symbol;
  };

  const renderCardPattern = (value, symbol) => {
    const positions = getSymbolPositions(value);

    return (
      <div className="card-pattern">
        {positions.map((position, index) => (
          <div key={index} className={`symbol ${position}`}>
            {symbol}
          </div>
        ))}
      </div>
    );
  };

  const getSymbolPositions = (value) => {
    switch (value) {
      case 2:
        return ["top", "bottom"];
      case 3:
        return ["top", "middle", "bottom"];
      case 4:
        return ["top-left", "top-right", "bottom-left", "bottom-right"];
      case 5:
        return ["top-left", "top-right", "middle", "bottom-left", "bottom-right"];
      case 6:
        return ["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"];
      case 7:
        return ["top-left", "top-right", "middle-left", "middle", "middle-right", "bottom-left", "bottom-right"];
      case 8:
        return ["top-left", "top-right", "middle-top-left", "middle-top-right", "middle-bottom-left", "middle-bottom-right", "bottom-left", "bottom-right"];
      case 9:
        return [
          "top-left",
          "top-right",
          "middle-top-left",
          "middle-top-right",
          "middle",
          "middle-bottom-left",
          "middle-bottom-right",
          "bottom-left",
          "bottom-right",
        ];
      case 10:
        return [
          "top-left",
          "top-right",
          "middle-top-left",
          "middle-top-right",
          "middle-top",
          "middle-bottom",
          "middle-bottom-left",
          "middle-bottom-right",
          "bottom-left",
          "bottom-right",
        ];
      default:
        return [];
    }
  };

  const cardClasses = ["card", !faceUp ? "face-down" : "face-up", isRed && faceUp ? "red" : "", selectable ? "selectable" : "", selected ? "selected" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses} onClick={handleClick} data-rank={card.rank} data-suit={card.suit} data-card-id={card.id}>
      {getCardContent()}
    </div>
  );
};

Card.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string.isRequired,
    suit: PropTypes.string.isRequired,
    rank: PropTypes.string.isRequired,
    name: PropTypes.string,
  }).isRequired,
  faceUp: PropTypes.bool,
  selectable: PropTypes.bool,
  selected: PropTypes.bool,
  onClick: PropTypes.func,
};

export default Card;
