import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SteamProvider } from "./contexts/SteamContext";
import { GameProvider } from "./contexts/GameContext";
import { SettingsProvider } from "./contexts/SettingsContext";

// Import socket service for connection handling
import socketService from "./services/socket";

// Import screen components
import LoginScreen from "./components/Login/LoginScreen";
import RoomsScreen from "./components/Rooms/RoomsScreen";
import LobbyScreen from "./components/Lobby/LobbyScreen";
import GameScreen from "./components/Game/GameScreen";

// Import common components
import AudioManager from "./components/common/AudioManager";
import ConnectionStatus from "./components/common/ConnectionStatus";

// Import styles
import "./styles/App.css";

function App() {
  // Check if the application is running in Electron/Steam
  // const [isSteamAvailable, setIsSteamAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Check if Steam is available via the preload script
        if (window.utilities && window.utilities.steam) {
          // setIsSteamAvailable(window.utilities.steam.isAvailable);
          console.log("Steam integration:", window.utilities.steam.isAvailable ? "Available" : "Not available");
        } else {
          console.log("Running in browser mode (no Steam)");
        }

        // Initialize socket connection
        await socketService.connect();
        setIsConnected(true);

        // Set up reconnection handlers
        socketService.on("disconnect", () => {
          console.log("Disconnected from server");
          setIsConnected(false);
        });

        socketService.on("reconnect", () => {
          console.log("Reconnected to server");
          setIsConnected(true);
        });

        socketService.on("error", (error) => {
          console.error("Socket error:", error);
          setConnectionError("Connection error: " + error.message);
        });
      } catch (error) {
        console.error("Failed to initialize services:", error);
        setConnectionError("Failed to connect to game server. Please try again later.");
      }
    };

    initializeServices();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <SettingsProvider>
      <SteamProvider>
        <Router>
          <GameProvider>
            <div className="app">
              {/* Connection status component */}
              {/* <ConnectionStatus isConnected={isConnected} error={connectionError} /> */}

              {/* Audio Manager - always present but invisible */}
              <AudioManager />

              {/* Routes for the application */}
              <Routes>
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/rooms" element={<RoomsScreen />} />
                <Route path="/lobby/:roomId" element={<LobbyScreen />} />
                <Route path="/game/:roomId" element={<GameScreen />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </div>
          </GameProvider>
        </Router>
      </SteamProvider>
    </SettingsProvider>
  );
}

export default App;
