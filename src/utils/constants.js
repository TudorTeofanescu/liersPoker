// Game constants for LiersPoker (Server-side)

// Game phases
const PHASES = {
  WAITING: "waiting",
  DEALING: "dealing",
  DECLARATION: "declaration",
  CHALLENGE: "challenge",
  REVEAL: "reveal",
  RESULT: "result",
  GAME_OVER: "gameOver",
};

// Hand rankings
const HAND_RANKINGS = {
  HIGH_CARD: 1,
  ONE_PAIR: 2,
  TWO_PAIR: 3,
  THREE_OF_A_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_OF_A_KIND: 8,
  STRAIGHT_FLUSH: 9,
  ROYAL_FLUSH: 10,
};

// Hand names for display
const HAND_NAMES = {
  1: "High Card",
  2: "One Pair",
  3: "Two Pair",
  4: "Three of a Kind",
  5: "Straight",
  6: "Flush",
  7: "Full House",
  8: "Four of a Kind",
  9: "Straight Flush",
  10: "Royal Flush",
};

// Card ranks
const CARD_RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

// Card suits
const CARD_SUITS = [
  { id: "hearts", name: "Hearts", symbol: "♥", color: "red" },
  { id: "diamonds", name: "Diamonds", symbol: "♦", color: "red" },
  { id: "clubs", name: "Clubs", symbol: "♣", color: "black" },
  { id: "spades", name: "Spades", symbol: "♠", color: "black" },
];

// Card values for comparing
const CARD_VALUES = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

// Full rank names
const RANK_NAMES = {
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten",
  J: "Jack",
  Q: "Queen",
  K: "King",
  A: "Ace",
};

// Game modes
const GAME_MODES = {
  STANDARD: "standard",
  QUICK: "quick",
  TOURNAMENT: "tournament",
};

// Game modes configuration
const GAME_MODE_CONFIG = {
  standard: {
    initialCards: 2,
    eliminationThreshold: 6,
    description: "Standard game with 2 initial cards. Eliminated at 6+ cards.",
  },
  quick: {
    initialCards: 3,
    eliminationThreshold: 5,
    description: "Quick game with 3 initial cards. Eliminated at 5+ cards.",
  },
  tournament: {
    initialCards: 2,
    eliminationThreshold: 7,
    description: "Tournament mode with 2 initial cards. Eliminated at 7+ cards.",
  },
};

// Matchmaking queue types
const QUEUE_TYPES = {
  CASUAL: "casual",
  RANKED: "ranked",
};

// Player skill ranks
const SKILL_RANKS = {
  NOVICE: { id: "novice", name: "Novice", minMMR: 0, maxMMR: 999 },
  BEGINNER: { id: "beginner", name: "Beginner", minMMR: 1000, maxMMR: 1499 },
  INTERMEDIATE: { id: "intermediate", name: "Intermediate", minMMR: 1500, maxMMR: 1999 },
  ADVANCED: { id: "advanced", name: "Advanced", minMMR: 2000, maxMMR: 2499 },
  EXPERT: { id: "expert", name: "Expert", minMMR: 2500, maxMMR: 2999 },
  MASTER: { id: "master", name: "Master", minMMR: 3000, maxMMR: 9999 },
};

// Achievements
const ACHIEVEMENTS = {
  FIRST_GAME: {
    id: "first_game",
    name: "First Steps",
    description: "Complete your first game.",
    icon: "🎮",
  },
  FIRST_WIN: {
    id: "first_win",
    name: "Beginner's Luck",
    description: "Win your first game.",
    icon: "🏆",
  },
  PERFECT_CHALLENGE: {
    id: "perfect_challenge",
    name: "Perfect Challenge",
    description: "Successfully challenge 5 declarations in a single game.",
    icon: "🔍",
  },
  PERFECT_BLUFF: {
    id: "perfect_bluff",
    name: "Poker Face",
    description: "Successfully bluff 5 times in a single game.",
    icon: "😶",
  },
  WINNING_STREAK: {
    id: "winning_streak",
    name: "On Fire",
    description: "Win 3 games in a row.",
    icon: "🔥",
  },
  COMEBACK_KID: {
    id: "comeback_kid",
    name: "Comeback Kid",
    description: "Win a game after having 5 cards.",
    icon: "↩️",
  },
  SOCIAL_BUTTERFLY: {
    id: "social_butterfly",
    name: "Social Butterfly",
    description: "Play games with 10 different players.",
    icon: "🦋",
  },
};

// Card themes
const CARD_THEMES = {
  DEFAULT: "default",
  CLASSIC: "classic",
  MINIMAL: "minimal",
  DARK: "dark",
  COLORFUL: "colorful",
};

// Sound effects
const SOUND_EFFECTS = {
  CARD_DEAL: "card_deal",
  CARD_FLIP: "card_flip",
  CARD_SHUFFLE: "card_shuffle",
  CHALLENGE: "challenge",
  CHALLENGE_SUCCESS: "challenge_success",
  CHALLENGE_FAIL: "challenge_fail",
  GAME_WIN: "game_win",
  GAME_LOSE: "game_lose",
  BUTTON_CLICK: "button_click",
  NOTIFICATION: "notification",
};

// Notification types
const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
};

// Events for socket communication
const EVENTS = {
  // Player events
  PLAYER_REGISTER: "player:register",
  PLAYER_UPDATE: "player:update",

  // Room events
  ROOM_CREATE: "room:create",
  ROOM_JOIN: "room:join",
  ROOM_LEAVE: "room:leave",
  ROOM_LIST: "room:list",
  ROOM_PLAYER_JOINED: "room:playerJoined",
  ROOM_PLAYER_LEFT: "room:playerLeft",

  // Game events
  GAME_START: "game:start",
  GAME_ACTION: "game:action",
  GAME_UPDATE: "game:update",
  GAME_OVER: "game:over",

  // Matchmaking events
  MATCHMAKING_JOIN: "matchmaking:join-queue",
  MATCHMAKING_LEAVE: "matchmaking:leave-queue",
  MATCHMAKING_UPDATE: "matchmaking:queue-update",
  MATCHMAKING_MATCH: "matchmaking:match-found",

  // Steam events
  STEAM_GET_FRIENDS: "steam:get-friends",
  STEAM_INVITE_FRIEND: "steam:invite-friend",
  STEAM_INVITE_RECEIVED: "steam:invite-received",

  // Connection events
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  RECONNECT: "reconnect",
};

// Local storage keys
const STORAGE_KEYS = {
  USER_PREFS: "user_prefs",
  GAME_STATS: "game_stats",
  LAST_USERNAME: "last_username",
  RECENT_ROOMS: "recent_rooms",
  RECENT_PLAYERS: "recent_players",
  ACHIEVEMENTS: "achievements",
  MATCH_HISTORY: "match_history",
  FRIENDS_LIST: "friends_list",
};

// API routes
const API_ROUTES = {
  STATUS: "/api/status",
  STEAM_STATUS: "/api/steam-status",
  LEADERBOARD: "/api/leaderboard",
  USER_PROFILE: "/api/user-profile",
  MATCH_HISTORY: "/api/match-history",
};

// Game limits
const LIMITS = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 8,
  USERNAME_MIN_LENGTH: 2,
  USERNAME_MAX_LENGTH: 20,
  MAX_SPECTATORS: 10,
  MAX_RECENT_ROOMS: 10,
  MAX_RECENT_PLAYERS: 20,
  MAX_MATCH_HISTORY: 50,
  QUEUE_TIMEOUT_SECONDS: 300, // 5 minutes
  TURN_TIMEOUT_SECONDS: 60, // 1 minute
  RECONNECT_GRACE_PERIOD: 60, // 1 minute
  ROOM_CODE_LENGTH: 6,
};

// Animation durations (in milliseconds)
const ANIMATION = {
  CARD_DEAL: 300,
  CARD_FLIP: 200,
  NOTIFICATION: 3000,
  CHALLENGE: 1000,
  RESULT: 2000,
};

// Export only what's needed for the server-side implementation
module.exports = {
  PHASES,
  HAND_RANKINGS,
  HAND_NAMES,
  CARD_RANKS,
  CARD_SUITS,
  CARD_VALUES,
  RANK_NAMES,
  GAME_MODES,
  GAME_MODE_CONFIG,
  QUEUE_TYPES,
  SKILL_RANKS,
  ACHIEVEMENTS,
  EVENTS,
  LIMITS,
};
