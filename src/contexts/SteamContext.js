// src/contexts/SteamContext.js
import React, { createContext, useState, useEffect, useContext } from "react";

// Create the context
const SteamContext = createContext();

// Custom hook for using the Steam context
export const useSteam = () => useContext(SteamContext);

export const SteamProvider = ({ children }) => {
  // State management
  const [isAvailable, setIsAvailable] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [steamId, setSteamId] = useState(null);
  const [userName, setUserName] = useState("");
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLobby, setActiveLobby] = useState(null);
  const [invites, setInvites] = useState([]);

  // Initialize Steam status
  useEffect(() => {
    checkSteamAvailability();
  }, []);

  // Check if Steam is available in the current environment
  const checkSteamAvailability = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // If running in Electron with Steam
      if (window.utilities && window.utilities.steam) {
        setIsAvailable(window.utilities.steam.isAvailable);

        if (window.utilities.steam.isAvailable) {
          // Set Steam user information
          setSteamId(window.utilities.steam.getSteamId());
          setUserName(window.utilities.steam.getUsername());
          setIsConnected(true);

          // Load friends list
          await loadFriends();
        }
      } else {
        // Check with server for Steam status
        const response = await fetch("/api/steam-status");
        if (response.ok) {
          const data = await response.json();
          setIsAvailable(data.available);
        } else {
          setIsAvailable(false);
        }
      }
    } catch (err) {
      console.error("Failed to check Steam status:", err);
      setError("Failed to connect to Steam");
      setIsAvailable(false);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Load Steam friends
  const loadFriends = async () => {
    setIsLoading(true);
    try {
      if (!isAvailable) return;

      if (window.utilities && window.utilities.steam && window.utilities.steam.getFriends) {
        const friendsList = await window.utilities.steam.getFriends();
        setFriends(friendsList);
      } else if (window.socket) {
        // Use socket to request friends if not in Electron
        return new Promise((resolve, reject) => {
          window.socket.emit("steam:get-friends", {}, (response) => {
            if (response.success) {
              setFriends(response.friends);
              resolve(response.friends);
            } else {
              setError(response.error || "Failed to load friends");
              reject(new Error(response.error || "Failed to load friends"));
            }
          });
        });
      }
    } catch (err) {
      console.error("Failed to load Steam friends:", err);
      setError("Failed to load Steam friends");
    } finally {
      setIsLoading(false);
    }
  };

  // Invite a friend to play
  const inviteFriend = async (friendId) => {
    if (!isAvailable || !isConnected) {
      return { success: false, error: "Steam is not available" };
    }

    try {
      if (window.socket) {
        return new Promise((resolve) => {
          window.socket.emit("steam:invite-friend", { friendId }, (response) => {
            resolve(response);
          });
        });
      }
      return { success: false, error: "Cannot send invite" };
    } catch (err) {
      console.error("Failed to invite friend:", err);
      return { success: false, error: err.message };
    }
  };

  // Join a lobby by ID
  const joinLobby = async (lobbyId) => {
    if (!isAvailable || !isConnected) {
      return { success: false, error: "Steam is not available" };
    }

    try {
      if (window.socket) {
        return new Promise((resolve) => {
          window.socket.emit("steam:join-lobby", { lobbyId }, (response) => {
            if (response.success) {
              setActiveLobby(lobbyId);
            }
            resolve(response);
          });
        });
      }
      return { success: false, error: "Cannot join lobby" };
    } catch (err) {
      console.error("Failed to join lobby:", err);
      return { success: false, error: err.message };
    }
  };

  // Create a new lobby
  const createLobby = async (isPrivate = false) => {
    if (!isAvailable || !isConnected) {
      return { success: false, error: "Steam is not available" };
    }

    try {
      if (window.socket) {
        return new Promise((resolve) => {
          window.socket.emit("steam:create-lobby", { isPrivate }, (response) => {
            if (response.success) {
              setActiveLobby(response.lobbyId);
            }
            resolve(response);
          });
        });
      }
      return { success: false, error: "Cannot create lobby" };
    } catch (err) {
      console.error("Failed to create lobby:", err);
      return { success: false, error: err.message };
    }
  };

  // Leave current lobby
  const leaveLobby = async () => {
    if (!activeLobby) {
      return { success: true };
    }

    try {
      if (window.socket) {
        return new Promise((resolve) => {
          window.socket.emit("steam:leave-lobby", {}, (response) => {
            if (response.success) {
              setActiveLobby(null);
            }
            resolve(response);
          });
        });
      }
      return { success: false, error: "Cannot leave lobby" };
    } catch (err) {
      console.error("Failed to leave lobby:", err);
      return { success: false, error: err.message };
    }
  };

  // Unlock a Steam achievement
  const unlockAchievement = async (achievementName) => {
    if (!isAvailable || !isConnected) {
      return { success: false, error: "Steam is not available" };
    }

    try {
      if (window.utilities && window.utilities.steam && window.utilities.steam.activateAchievement) {
        const result = await window.utilities.steam.activateAchievement(achievementName);
        return { success: true, achievement: result };
      } else if (window.socket) {
        return new Promise((resolve) => {
          window.socket.emit("steam:unlock-achievement", { achievementName }, (response) => {
            resolve(response);
          });
        });
      }
      return { success: false, error: "Cannot unlock achievement" };
    } catch (err) {
      console.error("Failed to unlock achievement:", err);
      return { success: false, error: err.message };
    }
  };

  // Set up socket listeners for Steam events
  useEffect(() => {
    if (!window.socket) return;

    // Handle invite received
    const handleInviteReceived = (data) => {
      setInvites((prev) => [...prev, data]);
    };

    // Handle lobby joined
    const handleLobbyJoined = (lobbyId) => {
      setActiveLobby(lobbyId);
    };

    // Register event listeners
    window.socket.on("steam:invite-received", handleInviteReceived);
    window.socket.on("steam:lobby-joined", handleLobbyJoined);

    // Clean up listeners on unmount
    return () => {
      window.socket.off("steam:invite-received", handleInviteReceived);
      window.socket.off("steam:lobby-joined", handleLobbyJoined);
    };
  }, []);

  // Context value containing state and functions
  const contextValue = {
    isAvailable,
    isConnected,
    steamId,
    userName,
    friends,
    isLoading,
    error,
    activeLobby,
    invites,
    actions: {
      loadFriends,
      inviteFriend,
      joinLobby,
      createLobby,
      leaveLobby,
      unlockAchievement,
      checkSteamAvailability,
    },
  };

  return <SteamContext.Provider value={contextValue}>{children}</SteamContext.Provider>;
};

export default SteamContext;
