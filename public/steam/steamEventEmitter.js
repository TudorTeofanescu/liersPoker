// Steam Event Emitter
// Provides a simple event system for Steam-related events

class SteamEventEmitter {
  constructor() {
    // Events callback registry
    this.eventCallbacks = {
      "lobby-created": [],
      "lobby-joined": [],
      "player-joined": [],
      "player-left": [],
      "game-started": [],
      "invite-received": [],
      "queue-updated": [],
    };
  }

  // Register an event listener
  on(event, callback) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event].push(callback);
    }
    return this; // For chaining
  }

  // Remove an event listener
  off(event, callback) {
    if (this.eventCallbacks[event]) {
      const index = this.eventCallbacks[event].indexOf(callback);
      if (index !== -1) {
        this.eventCallbacks[event].splice(index, 1);
      }
    }
    return this;
  }

  // Trigger an event
  trigger(event, data) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event].forEach((callback) => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in ${event} callback:`, err);
        }
      });
    }
  }

  // Check if an event has any listeners
  hasListeners(event) {
    return this.eventCallbacks[event] && this.eventCallbacks[event].length > 0;
  }

  // Get the number of listeners for an event
  listenerCount(event) {
    if (!this.eventCallbacks[event]) return 0;
    return this.eventCallbacks[event].length;
  }

  // Clear all listeners for an event
  clearListeners(event) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event] = [];
    }
    return this;
  }

  // Clear all listeners for all events
  clearAllListeners() {
    Object.keys(this.eventCallbacks).forEach((event) => {
      this.eventCallbacks[event] = [];
    });
    return this;
  }
}

module.exports = SteamEventEmitter;
