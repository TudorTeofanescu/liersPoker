// Preload script that runs in the renderer process
const { contextBridge, ipcRenderer } = require("electron");

// Expose needed modules and APIs to renderer
contextBridge.exposeInMainWorld("utilities", {
  isElectron: true,

  // Steam functionality wrapper
  steam: {
    isAvailable: !!global.utilities?.isSteamAvailable,

    getUsername: function () {
      return global.utilities?.username || "Player";
    },

    getSteamId: function () {
      return global.utilities?.steamId || "dev-player";
    },

    // Asynchronous Steam functions
    getFriends: function () {
      return new Promise((resolve, reject) => {
        const requestId = Date.now().toString();

        const handleResponse = (event, response) => {
          if (response.request.id === requestId) {
            ipcRenderer.removeListener("steamworks-response", handleResponse);

            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.friends || []);
            }
          }
        };

        ipcRenderer.on("steamworks-response", handleResponse);

        ipcRenderer.send("steamworks-request", {
          id: requestId,
          action: "get-friends",
        });
      });
    },

    activateAchievement: function (achievementName) {
      return new Promise((resolve, reject) => {
        const requestId = Date.now().toString();

        const handleResponse = (event, response) => {
          if (response.request.id === requestId) {
            ipcRenderer.removeListener("steamworks-response", handleResponse);

            if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve(response.achievement);
            }
          }
        };

        ipcRenderer.on("steamworks-response", handleResponse);

        ipcRenderer.send("steamworks-request", {
          id: requestId,
          action: "activate-achievement",
          achievement: achievementName,
        });
      });
    },
  },
});

// Expose IPC functions to the renderer process
contextBridge.exposeInMainWorld("ipc", {
  // Invoke a method in the main process and get the response
  invoke: (channel, data) => {
    return ipcRenderer.invoke(channel, data);
  },

  // Send an event to the main process (no response)
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },

  // Listen for events from the main process
  on: (channel, callback) => {
    const subscription = (event, ...args) => callback(...args);
    ipcRenderer.on(channel, subscription);

    // Return a function to remove the listener
    return () => {
      ipcRenderer.removeListener(channel, subscription);
    };
  },

  // Remove all listeners for a channel
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

// Expose a simplified logging utility
contextBridge.exposeInMainWorld("log", {
  info: (message) => console.log(message),
  error: (message) => console.error(message),
  warn: (message) => console.warn(message),
});

// Log that preload script has executed
console.log("Preload script executed");
