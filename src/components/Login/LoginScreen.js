import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../contexts/GameContext";
import { useSettings } from "../../contexts/SettingsContext";
import { useSteam } from "../../contexts/SteamContext";
import { validateUsername } from "../../utils/validation";
import "./LoginScreen.css";

const LoginScreen = () => {
  const navigate = useNavigate();
  const { player, actions } = useGame();
  const { playerName, setPlayerName, soundEnabled, playSoundEffect } = useSettings();
  const { isAvailable: isSteamAvailable, userName: steamUserName, isLoading: steamLoading } = useSteam();

  const [username, setUsername] = useState(playerName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSteamOption, setShowSteamOption] = useState(false);
  const [useSteamName, setUseSteamName] = useState(true);

  // Check if already logged in
  useEffect(() => {
    if (player) {
      navigate("/rooms");
    }
  }, [player, navigate]);

  // Check for Steam availability
  useEffect(() => {
    if (!steamLoading) {
      setShowSteamOption(isSteamAvailable);
      // If Steam is available and we should use Steam name, update username field
      if (isSteamAvailable && useSteamName && steamUserName) {
        setUsername(steamUserName);
      }
    }
  }, [isSteamAvailable, steamUserName, steamLoading, useSteamName]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (soundEnabled) {
      playSoundEffect("button_click");
    }

    // Validate username
    const validation = validateUsername(username);
    if (!validation.success) {
      setError(validation.error);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Get Steam ID if available and selected
      const steamId = isSteamAvailable && useSteamName ? window.utilities?.steam?.getSteamId() : null;

      // Register player using the API service
      const result = await actions.registerPlayer(username, steamId);

      if (result.success) {
        // Navigate to rooms screen
        navigate("/rooms");
      } else {
        setError(result.error || "Failed to register. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSteamName = () => {
    setUseSteamName(!useSteamName);
    if (!useSteamName && steamUserName) {
      setUsername(steamUserName);
    } else if (useSteamName) {
      setUsername("");
    }
  };

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <h1 className="game-title">Liers Poker</h1>
          <div className="game-subtitle">A game of bluff and deception</div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Choose your display name:</label>
            <input
              type="text"
              id="username"
              className={`username-input ${error ? "input-error" : ""}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              disabled={isLoading || (useSteamName && isSteamAvailable)}
              maxLength={20}
            />
            {error && <div className="error-message">{error}</div>}
          </div>

          {showSteamOption && (
            <div className="steam-option">
              <label className="steam-checkbox-label">
                <input type="checkbox" checked={useSteamName} onChange={toggleSteamName} className="steam-checkbox" />
                Use Steam name ({steamUserName || "loading..."})
              </label>
            </div>
          )}

          <button type="submit" className="login-button" disabled={isLoading || !username.trim()}>
            {isLoading ? "Connecting..." : "Enter Game"}
          </button>
        </form>

        <div className="login-footer">
          <div className="game-version">Version 0.1.0</div>
          {isSteamAvailable && (
            <div className="steam-status connected">
              <span className="steam-icon">⚙️</span> Connected to Steam
            </div>
          )}
        </div>
      </div>

      <div className="background-decoration">
        <div className="card-decoration hearts"></div>
        <div className="card-decoration spades"></div>
        <div className="card-decoration diamonds"></div>
        <div className="card-decoration clubs"></div>
      </div>
    </div>
  );
};

export default LoginScreen;
