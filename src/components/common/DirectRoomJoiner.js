// src/components/Common/DirectRoomJoiner.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../contexts/GameContext";
import { useSettings } from "../../contexts/SettingsContext";
import { formatRoomCode, validateRoomCodeEnhanced } from "../../utils/validation";

/**
 * A component that provides a simple way to join a specific room by ID
 * Can be used anywhere in the app
 */
const DirectRoomJoiner = ({ defaultRoomId = "", buttonText = "Join Room", className = "", autoJoin = false }) => {
  const navigate = useNavigate();
  const { actions } = useGame();
  const { soundEnabled, playSoundEffect } = useSettings();

  const [roomId, setRoomId] = useState(defaultRoomId);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Effect to autoJoin if specified
  useEffect(() => {
    if (autoJoin && defaultRoomId) {
      handleJoinRoom();
    }
  }, [autoJoin, defaultRoomId]);

  const handleJoinRoom = async (e) => {
    if (e) e.preventDefault();

    if (soundEnabled) {
      playSoundEffect("button_click");
    }

    // Reset states
    setError("");
    setSuccess(false);

    // Validate room code
    const validation = validateRoomCodeEnhanced(roomId);
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    // Start joining process
    setIsJoining(true);

    try {
      const formattedRoomId = validation.roomCode;

      const result = await actions.joinRoom(formattedRoomId);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/lobby/${formattedRoomId}`);
        }, 300);
      } else {
        setError(result.error || "Failed to join room");
      }
    } catch (err) {
      console.error("Error joining room:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className={`direct-room-joiner ${className}`}>
      <form onSubmit={handleJoinRoom} className="join-form">
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          placeholder="Enter room code"
          className="room-code-input"
          maxLength={6}
          disabled={isJoining}
        />
        <button type="submit" className="join-button" disabled={isJoining || !roomId.trim()}>
          {isJoining ? "Joining..." : buttonText}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Successfully joined room!</div>}

      <style jsx>{`
        .direct-room-joiner {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .join-form {
          display: flex;
          gap: 0.5rem;
        }

        .room-code-input {
          padding: 0.75rem;
          background-color: rgba(45, 55, 72, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #e2e8f0;
          font-size: 1rem;
          flex: 1;
        }

        .room-code-input:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2);
        }

        .join-button {
          padding: 0.75rem 1rem;
          background-color: #4299e1;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: background-color 0.2s ease;
        }

        .join-button:hover {
          background-color: #3182ce;
        }

        .join-button:disabled {
          background-color: #718096;
          cursor: not-allowed;
        }

        .error-message {
          color: #fc8181;
          font-size: 0.875rem;
          padding: 0.5rem;
          background-color: rgba(229, 62, 62, 0.1);
          border-radius: 4px;
        }

        .success-message {
          color: #68d391;
          font-size: 0.875rem;
          padding: 0.5rem;
          background-color: rgba(72, 187, 120, 0.1);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default DirectRoomJoiner;
