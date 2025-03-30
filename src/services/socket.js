// Socket.io service for LiersPoker
import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventHandlers = {};
    this.responseCallbacks = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  // Initialize the socket connection
  connect(url = null) {
    if (this.socket) {
      console.log("Socket already connected");
      return Promise.resolve(this.socket);
    }

    // Determine server URL based on environment
    const serverUrl = url || this.getServerUrl();

    return new Promise((resolve, reject) => {
      try {
        this.socket = io(serverUrl, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: this.maxReconnectAttempts,
        });

        // Setup basic socket event listeners
        this.setupSocketListeners();

        // Resolve once connected
        this.socket.on("connect", () => {
          console.log("Socket connected");
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve(this.socket);
        });

        // Reject if connection fails
        this.socket.on("connect_error", (error) => {
          console.error("Socket connection error:", error);
          this.reconnectAttempts++;

          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.isConnected = false;
            reject(error);
          }
        });
      } catch (error) {
        console.error("Failed to initialize socket:", error);
        reject(error);
      }
    });
  }

  // Determine the server URL based on the environment
  getServerUrl() {
    // If in Electron with utilities exposed
    if (window.utilities && window.utilities.isElectron) {
      return "http://localhost:3001"; // Update to your server port
    }

    // For development, always use the local server
    if (process.env.NODE_ENV === "development") {
      return "http://localhost:3001";
    }

    // If in browser, use the current origin
    return window.location.origin;
  }

  // Setup basic socket event handlers
  setupSocketListeners() {
    if (!this.socket) return;

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
      this.isConnected = false;

      // Notify registered handlers about disconnection
      this.notifyEventHandlers("disconnect", { reason: "server_disconnect" });
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;

      // Notify registered handlers about reconnection
      this.notifyEventHandlers("reconnect", { attemptNumber });
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
      this.notifyEventHandlers("error", { error });
    });
  }

  // Register an event handler
  on(event, callback) {
    if (!this.socket) {
      console.warn("Socket not initialized. Connect first before registering events.");
      return false;
    }

    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];

      // Register with actual socket if it's not a basic event (connect, disconnect, etc.)
      if (!["connect", "disconnect", "reconnect", "error"].includes(event)) {
        this.socket.on(event, (data) => {
          this.notifyEventHandlers(event, data);
        });
      }
    }

    // Add callback to our handlers
    this.eventHandlers[event].push(callback);
    return true;
  }

  // Remove an event handler
  off(event, callback) {
    if (!this.socket || !this.eventHandlers[event]) return false;

    if (callback) {
      // Remove specific callback
      const index = this.eventHandlers[event].indexOf(callback);
      if (index !== -1) {
        this.eventHandlers[event].splice(index, 1);
      }

      // If no more handlers for this event, remove socket listener
      if (this.eventHandlers[event].length === 0) {
        this.socket.off(event);
        delete this.eventHandlers[event];
      }
    } else {
      // Remove all callbacks for this event
      this.socket.off(event);
      delete this.eventHandlers[event];
    }

    return true;
  }

  // Notify all registered handlers for an event
  notifyEventHandlers(event, data) {
    if (!this.eventHandlers[event]) return;

    this.eventHandlers[event].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} event handler:`, error);
      }
    });
  }

  // Emit an event with optional callback for response
  emit(event, data = {}, callback = null) {
    if (!this.socket || !this.isConnected) {
      console.warn("Socket not connected. Cannot emit event:", event);
      return false;
    }

    if (callback) {
      // If callback provided, set up response handling
      this.socket.emit(event, data, callback);
    } else {
      // Simple emit without response handling
      this.socket.emit(event, data);
    }

    return true;
  }

  // Emit an event and return a promise for the response
  emitAsync(event, data = {}) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error("Socket not connected"));
        return;
      }

      this.socket.emit(event, data, (response) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  // Disconnect the socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.eventHandlers = {};
      this.responseCallbacks.clear();
    }
  }

  // Check if socket is connected
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }
}

// Create and export singleton instance
const socketService = new SocketService();
export default socketService;
