// src/components/Rooms/RoomJoiner.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../contexts/GameContext";
import { useSettings } from "../../contexts/SettingsContext";

/**
 * A component for joining a specific room by ID
 */
const RoomJoiner = ({ onSuccess, onError }) => {
  const navigate = useNavigate();
  const { actions } = useGame();
  const { soundEnabled, playSoundEffect } = useSettings();

  const [roomId, setRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  // Load rooms on mount and set refresh timer
  useEffect(() => {
    // Load saved rooms from storage first
    const recentRooms = storageService.getRecentRooms();
    if (recentRooms && recentRooms.length > 0) {
      setAvailableRooms((prev) => [...prev, ...recentRooms]);
    }

    // Then load from server
    loadRooms();

    // Set up auto-refresh every 15 seconds
    const timer = setInterval(() => {
      loadRooms();
    }, 15000);

    setRefreshTimer(timer);

    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, []);

  const handleJoinRoom = async (e) => {
    e.preventDefault();

    if (soundEnabled) {
      playSoundEffect("button_click");
    }

    if (!roomId.trim()) {
      setError("Please enter a room ID");
      if (onError) onError("Please enter a room ID");
      return;
    }

    setIsJoining(true);
    setError("");

    try {
      // Always convert to uppercase to ensure consistency
      const formattedRoomId = roomId.trim().toUpperCase();

      const result = await actions.joinRoomById(formattedRoomId);

      if (result.success) {
        if (onSuccess) onSuccess(formattedRoomId);
        navigate(`/lobby/${formattedRoomId}`);
      } else {
        setError(result.error || "Failed to join room");
        if (onError) onError(result.error || "Failed to join room");
      }
    } catch (err) {
      console.error("Error joining room:", err);
      const errorMessage = "An unexpected error occurred";
      setError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="room-joiner">
      <form onSubmit={handleJoinRoom} className="join-form">
        <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="Enter room code" className="room-code-input" maxLength={6} />
        <button type="submit" className="join-button" disabled={isJoining || !roomId.trim()}>
          {isJoining ? "Joining..." : "Join Room"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default RoomJoiner;
