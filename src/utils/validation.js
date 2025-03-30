// Input validation utilities for LiersPoker

/**
 * Validate username input
 * @param {string} username - The username to validate
 * @returns {Object} Validation result with success flag and error message
 */
export function validateUsername(username) {
  if (!username || typeof username !== "string") {
    return {
      success: false,
      error: "Username is required",
    };
  }

  username = username.trim();

  if (username.length < 2) {
    return {
      success: false,
      error: "Username must be at least 2 characters long",
    };
  }

  if (username.length > 20) {
    return {
      success: false,
      error: "Username cannot exceed 20 characters",
    };
  }

  // Check for valid characters (alphanumeric, spaces, and common symbols)
  const validUsernameRegex = /^[a-zA-Z0-9 _.!@#$%^&*()\-=+[\]{}|;:'",.<>/?\\]+$/;
  if (!validUsernameRegex.test(username)) {
    return {
      success: false,
      error: "Username contains invalid characters",
    };
  }

  return { success: true };
}

/**
 * Validate room code input
 * @param {string} roomCode - The room code to validate
 * @returns {Object} Validation result with success flag and error message
 */
export function validateRoomCode(roomCode) {
  if (!roomCode || typeof roomCode !== "string") {
    return {
      success: false,
      error: "Room code is required",
    };
  }

  roomCode = roomCode.trim().toUpperCase();

  if (roomCode.length !== 6) {
    return {
      success: false,
      error: "Room code must be exactly 6 characters",
    };
  }

  // Room codes should only contain uppercase letters and numbers
  const validRoomCodeRegex = /^[A-Z0-9]{6}$/;
  if (!validRoomCodeRegex.test(roomCode)) {
    return {
      success: false,
      error: "Room code must contain only letters and numbers",
    };
  }

  return { success: true, roomCode };
}

/**
 * Validate a hand declaration
 * @param {string} handType - The type of hand being declared
 * @param {Array} cards - The cards being declared
 * @returns {Object} Validation result with success flag and error message
 */
export function validateDeclaration(handType, cards) {
  // Check if a hand type is provided
  if (!handType) {
    return {
      success: false,
      error: "Hand type is required",
    };
  }

  // Check if the hand type is valid
  const validHandTypes = [
    "HIGH_CARD",
    "ONE_PAIR",
    "TWO_PAIR",
    "THREE_OF_A_KIND",
    "STRAIGHT",
    "FLUSH",
    "FULL_HOUSE",
    "FOUR_OF_A_KIND",
    "STRAIGHT_FLUSH",
    "ROYAL_FLUSH",
  ];

  if (!validHandTypes.includes(handType)) {
    return {
      success: false,
      error: "Invalid hand type",
    };
  }

  // Check if cards are provided
  if (!cards || !Array.isArray(cards)) {
    return {
      success: false,
      error: "Cards must be provided as an array",
    };
  }

  // Check card count for different hand types
  const requiredCounts = {
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

  if (cards.length !== requiredCounts[handType]) {
    return {
      success: false,
      error: `${handType} requires exactly ${requiredCounts[handType]} cards`,
    };
  }

  // Validate each card has required properties
  for (const card of cards) {
    if (!card.rank || !card.suit) {
      return {
        success: false,
        error: "Each card must have a rank and suit",
      };
    }

    // Validate rank
    const validRanks = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
    if (!validRanks.includes(card.rank)) {
      return {
        success: false,
        error: `Invalid card rank: ${card.rank}`,
      };
    }

    // Validate suit
    const validSuits = ["hearts", "diamonds", "clubs", "spades"];
    if (!validSuits.includes(card.suit)) {
      return {
        success: false,
        error: `Invalid card suit: ${card.suit}`,
      };
    }
  }

  return { success: true };
}

/**
 * Validate game settings input
 * @param {Object} settings - The game settings to validate
 * @returns {Object} Validation result with success flag and error message
 */
export function validateGameSettings(settings) {
  if (!settings || typeof settings !== "object") {
    return {
      success: false,
      error: "Invalid settings format",
    };
  }

  // Validate max players
  if (settings.maxPlayers !== undefined) {
    const maxPlayers = parseInt(settings.maxPlayers);
    if (isNaN(maxPlayers) || maxPlayers < 2 || maxPlayers > 8) {
      return {
        success: false,
        error: "Max players must be between 2 and 8",
      };
    }
    settings.maxPlayers = maxPlayers; // Convert to number
  }

  // Validate game mode
  if (settings.gameMode !== undefined) {
    const validGameModes = ["standard", "quick", "tournament"];
    if (!validGameModes.includes(settings.gameMode)) {
      return {
        success: false,
        error: "Invalid game mode",
      };
    }
  }

  // Validate privacy settings
  if (settings.isPrivate !== undefined && typeof settings.isPrivate !== "boolean") {
    return {
      success: false,
      error: "Privacy setting must be a boolean",
    };
  }

  if (settings.friendsOnly !== undefined && typeof settings.friendsOnly !== "boolean") {
    return {
      success: false,
      error: "Friends only setting must be a boolean",
    };
  }

  // Ensure friends only can't be true if isPrivate is true
  if (settings.isPrivate && settings.friendsOnly) {
    return {
      success: false,
      error: "A private room cannot also be friends only",
    };
  }

  return { success: true, settings };
}

/**
 * Validate matchmaking preferences
 * @param {Object} preferences - The matchmaking preferences to validate
 * @returns {Object} Validation result with success flag and error message
 */
export function validateMatchmakingPreferences(preferences) {
  if (!preferences || typeof preferences !== "object") {
    return {
      success: false,
      error: "Invalid preferences format",
    };
  }

  // Validate queue type
  if (preferences.queueType !== undefined) {
    const validQueueTypes = ["casual", "ranked"];
    if (!validQueueTypes.includes(preferences.queueType)) {
      return {
        success: false,
        error: "Invalid queue type",
      };
    }
  }

  // Validate preferred player count
  if (preferences.playerCount !== undefined) {
    const playerCount = parseInt(preferences.playerCount);
    if (isNaN(playerCount) || playerCount < 2 || playerCount > 8) {
      return {
        success: false,
        error: "Preferred player count must be between 2 and 8",
      };
    }
    preferences.playerCount = playerCount; // Convert to number
  }

  // Validate skill level range
  if (preferences.skillRange !== undefined) {
    const validSkillRanges = ["any", "narrow", "wide"];
    if (!validSkillRanges.includes(preferences.skillRange)) {
      return {
        success: false,
        error: "Invalid skill range preference",
      };
    }
  }

  return { success: true, preferences };
}

/**
 * Validate a game action
 * @param {string} action - The action type
 * @param {Object} data - The action data
 * @returns {Object} Validation result with success flag and error message
 */
export function validateGameAction(action, data = {}) {
  // Check action type
  const validActions = ["declaration", "challenge", "pass"];
  if (!validActions.includes(action)) {
    return {
      success: false,
      error: "Invalid action type",
    };
  }

  // Validate based on action type
  switch (action) {
    case "declaration":
      // A declaration requires a hand type and cards
      if (!data.handType) {
        return {
          success: false,
          error: "Declaration requires a hand type",
        };
      }

      if (!data.cards || !Array.isArray(data.cards)) {
        return {
          success: false,
          error: "Declaration requires cards",
        };
      }

      // Full declaration validation
      return validateDeclaration(data.handType, data.cards);

    case "challenge":
      // No additional data needed for challenge
      return { success: true };

    case "pass":
      // No additional data needed for pass
      return { success: true };

    default:
      return {
        success: false,
        error: "Unknown action type",
      };
  }
}

/**
 * Validate and format a Steam ID
 * @param {string} steamId - The Steam ID to validate
 * @returns {Object} Validation result with success flag and formatted Steam ID
 */
export function validateSteamId(steamId) {
  if (!steamId || typeof steamId !== "string") {
    return {
      success: false,
      error: "Invalid Steam ID",
    };
  }

  // Simple validation for example purposes
  // Real Steam ID validation would be more complex
  const steamIdRegex = /^[0-9]{17}$|^STEAM_[0-5]:[01]:[0-9]+$|^[A-Z0-9_]{3,}$/;
  if (!steamIdRegex.test(steamId)) {
    return {
      success: false,
      error: "Invalid Steam ID format",
    };
  }

  return { success: true, steamId };
}

/**
 * Validate user settings
 * @param {Object} settings - The user settings to validate
 * @returns {Object} Validation result with success flag and error message
 */
export function validateUserSettings(settings) {
  if (!settings || typeof settings !== "object") {
    return {
      success: false,
      error: "Invalid settings format",
    };
  }

  // Validate sound settings
  if (settings.soundEnabled !== undefined && typeof settings.soundEnabled !== "boolean") {
    return {
      success: false,
      error: "Sound enabled setting must be a boolean",
    };
  }

  if (settings.musicVolume !== undefined) {
    const musicVolume = parseFloat(settings.musicVolume);
    if (isNaN(musicVolume) || musicVolume < 0 || musicVolume > 1) {
      return {
        success: false,
        error: "Music volume must be between 0 and 1",
      };
    }
    settings.musicVolume = musicVolume; // Convert to number
  }

  if (settings.sfxVolume !== undefined) {
    const sfxVolume = parseFloat(settings.sfxVolume);
    if (isNaN(sfxVolume) || sfxVolume < 0 || sfxVolume > 1) {
      return {
        success: false,
        error: "SFX volume must be between 0 and 1",
      };
    }
    settings.sfxVolume = sfxVolume; // Convert to number
  }

  // Validate language setting
  if (settings.language !== undefined) {
    const validLanguages = ["en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja"];
    if (!validLanguages.includes(settings.language)) {
      return {
        success: false,
        error: "Invalid language selection",
      };
    }
  }

  // Validate card theme
  if (settings.cardTheme !== undefined) {
    const validThemes = ["default", "classic", "minimal", "dark", "colorful"];
    if (!validThemes.includes(settings.cardTheme)) {
      return {
        success: false,
        error: "Invalid card theme",
      };
    }
  }

  // Validate colorblind mode
  if (settings.colorBlindMode !== undefined && typeof settings.colorBlindMode !== "boolean") {
    return {
      success: false,
      error: "Colorblind mode setting must be a boolean",
    };
  }

  return { success: true, settings };
}
/**
 * Enhanced validation for room code input
 * @param {string} roomCode - The room code to validate
 * @returns {Object} Validation result with success flag, error message, and formatted room code
 */
export function validateRoomCodeEnhanced(roomCode) {
  if (!roomCode || typeof roomCode !== "string") {
    return {
      success: false,
      error: "Room code is required",
    };
  }

  // Remove whitespace and convert to uppercase
  roomCode = roomCode.trim().toUpperCase();

  if (roomCode.length !== 6) {
    return {
      success: false,
      error: "Room code must be exactly 6 characters",
    };
  }

  // Room codes should only contain uppercase letters and numbers
  const validRoomCodeRegex = /^[A-Z0-9]{6}$/;
  if (!validRoomCodeRegex.test(roomCode)) {
    return {
      success: false,
      error: "Room code must contain only letters and numbers",
    };
  }

  return { success: true, roomCode };
}

/**
 * Format a room code for display or API use
 * @param {string} roomCode - The room code to format
 * @returns {string} Properly formatted room code
 */
export function formatRoomCode(roomCode) {
  if (!roomCode) return "";

  // Ensure uppercase and no whitespace
  return roomCode.trim().toUpperCase();
}
