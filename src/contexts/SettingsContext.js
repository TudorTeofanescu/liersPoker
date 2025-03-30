import React, { createContext, useState, useEffect, useContext } from "react";
import storageService from "../services/storage";

// Create the context
const SettingsContext = createContext();

// Custom hook for using the Settings context
export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  // Visual settings
  const [theme, setTheme] = useState("dark");
  const [cardStyle, setCardStyle] = useState("classic");
  const [showAnimations, setShowAnimations] = useState(true);
  const [tableColor, setTableColor] = useState("#2c5282"); // Default blue felt

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.7);
  const [musicVolume, setMusicVolume] = useState(0.5);

  // Game preferences
  const [autoShowHand, setAutoShowHand] = useState(true);
  const [confirmActions, setConfirmActions] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const [allowFriendInvites, setAllowFriendInvites] = useState(true);
  const [challengeShortcut, setChallengeShortcut] = useState("T");

  // Display settings
  const [showTimer, setShowTimer] = useState(true);
  const [showHints, setShowHints] = useState(true);

  // Account settings
  const [playerName, setPlayerName] = useState("");
  const [avatar, setAvatar] = useState(1); // Avatar index/ID
  const [playerColor, setPlayerColor] = useState("#4299e1");

  // Load settings from storage on startup
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings to storage when they change
  useEffect(() => {
    saveSettings();
  }, [
    theme,
    cardStyle,
    showAnimations,
    tableColor,
    soundEnabled,
    musicEnabled,
    soundVolume,
    musicVolume,
    autoShowHand,
    confirmActions,
    chatEnabled,
    privateProfile,
    allowFriendInvites,
    showTimer,
    showHints,
    playerName,
    avatar,
    playerColor,
    challengeShortcut,
  ]);

  // Load settings from storage
  const loadSettings = () => {
    try {
      const userPrefs = storageService.getUserPreferences();

      // Apply settings from storage
      if (userPrefs) {
        // Visual settings
        setTheme(userPrefs.theme || "dark");
        setCardStyle(userPrefs.cardTheme || "classic");
        setShowAnimations(userPrefs.showAnimations !== undefined ? userPrefs.showAnimations : true);
        setTableColor(userPrefs.tableColor || "#2c5282");

        // Sound settings
        setSoundEnabled(userPrefs.soundEnabled !== undefined ? userPrefs.soundEnabled : true);
        setMusicEnabled(userPrefs.musicEnabled !== undefined ? userPrefs.musicEnabled : true);
        setSoundVolume(userPrefs.soundVolume !== undefined ? userPrefs.soundVolume : 0.7);
        setMusicVolume(userPrefs.musicVolume !== undefined ? userPrefs.musicVolume : 0.5);

        // Game preferences
        setAutoShowHand(userPrefs.autoShowHand !== undefined ? userPrefs.autoShowHand : true);
        setConfirmActions(userPrefs.confirmActions !== undefined ? userPrefs.confirmActions : true);
        setChatEnabled(userPrefs.chatEnabled !== undefined ? userPrefs.chatEnabled : true);
        setPrivateProfile(userPrefs.privateProfile !== undefined ? userPrefs.privateProfile : false);
        setAllowFriendInvites(userPrefs.allowFriendInvites !== undefined ? userPrefs.allowFriendInvites : true);
        setChallengeShortcut(userPrefs.challengeShortcut || "T");

        // Display settings
        setShowTimer(userPrefs.showTimer !== undefined ? userPrefs.showTimer : true);
        setShowHints(userPrefs.showHints !== undefined ? userPrefs.showHints : true);

        // Account settings
        setPlayerName(userPrefs.playerName || "");
        setAvatar(userPrefs.avatar || 1);
        setPlayerColor(userPrefs.playerColor || "#4299e1");
      }

      // Also load last username
      const lastUsername = storageService.getLastUsername();
      if (lastUsername && (!playerName || playerName === "")) {
        setPlayerName(lastUsername);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      // Continue with defaults if loading fails
    }
  };

  // Save settings to storage
  const saveSettings = () => {
    try {
      const settings = {
        // Visual settings
        theme,
        cardTheme: cardStyle,
        showAnimations,
        tableColor,

        // Sound settings
        soundEnabled,
        musicEnabled,
        soundVolume,
        musicVolume,

        // Game preferences
        autoShowHand,
        confirmActions,
        chatEnabled,
        privateProfile,
        allowFriendInvites,
        challengeShortcut,

        // Display settings
        showTimer,
        showHints,

        // Account settings
        playerName,
        avatar,
        playerColor,
      };

      storageService.setUserPreferences(settings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  // Reset settings to defaults
  const resetSettings = () => {
    // Visual settings
    setTheme("dark");
    setCardStyle("classic");
    setShowAnimations(true);
    setTableColor("#2c5282");

    // Sound settings
    setSoundEnabled(true);
    setMusicEnabled(true);
    setSoundVolume(0.7);
    setMusicVolume(0.5);

    // Game preferences
    setAutoShowHand(true);
    setConfirmActions(true);
    setChatEnabled(true);
    setPrivateProfile(false);
    setAllowFriendInvites(true);
    setChallengeShortcut("T");

    // Display settings
    setShowTimer(true);
    setShowHints(true);

    // Account settings remain unchanged
  };

  // Apply theme to body class
  useEffect(() => {
    document.body.classList.remove("theme-light", "theme-dark", "theme-contrast");
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  // Sound effects utilities
  const playSoundEffect = (soundName) => {
    if (!soundEnabled) return;

    // Get actual sound element
    const soundElement = document.getElementById(`sound-${soundName}`);
    if (soundElement) {
      soundElement.volume = soundVolume;
      soundElement.currentTime = 0;
      soundElement.play().catch((e) => console.error("Error playing sound:", e));
    } else {
      console.log(`Playing sound: ${soundName} at volume ${soundVolume}`);
    }
  };

  const playMusic = (trackName) => {
    if (!musicEnabled) return;

    // Get actual music element
    const musicElement = document.getElementById(`music-${trackName}`);
    if (musicElement) {
      musicElement.volume = musicVolume;
      musicElement.loop = true;
      musicElement.play().catch((e) => console.error("Error playing music:", e));
    } else {
      console.log(`Playing music: ${trackName} at volume ${musicVolume}`);
    }
  };

  const stopMusic = () => {
    // Stop all music elements
    const musicElements = document.querySelectorAll('audio[id^="music-"]');
    musicElements.forEach((element) => {
      element.pause();
      element.currentTime = 0;
    });
  };

  const contextValue = {
    // Visual settings
    theme,
    setTheme,
    cardStyle,
    setCardStyle,
    showAnimations,
    setShowAnimations,
    tableColor,
    setTableColor,

    // Sound settings
    soundEnabled,
    setSoundEnabled,
    musicEnabled,
    setMusicEnabled,
    soundVolume,
    setSoundVolume,
    musicVolume,
    setMusicVolume,

    // Game preferences
    autoShowHand,
    setAutoShowHand,
    confirmActions,
    setConfirmActions,
    chatEnabled,
    setChatEnabled,
    privateProfile,
    setPrivateProfile,
    allowFriendInvites,
    setAllowFriendInvites,
    challengeShortcut,
    setChallengeShortcut,

    // Display settings
    showTimer,
    setShowTimer,
    showHints,
    setShowHints,

    // Account settings
    playerName,
    setPlayerName,
    avatar,
    setAvatar,
    playerColor,
    setPlayerColor,

    // Utility functions
    loadSettings,
    saveSettings,
    resetSettings,
    playSoundEffect,
    playMusic,
    stopMusic,
  };

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
};

export default SettingsContext;
