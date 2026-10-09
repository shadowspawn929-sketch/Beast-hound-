/*
 * Beast Tamer: Wild Realm
 * Online Multiplayer Client
 *
 * Requires Socket.IO to load before this file.
 * Works with the game's existing server.js.
 */

(function () {
  'use strict';

  const options = {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 800,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    autoConnect: true
  };

  let socket = null;

  // Update the online status indicator.
  function setBadge(message, isOnline) {
    const badge = document.getElementById('connectBadge');

    if (!badge) return;

    badge.textContent = message;
    badge.classList.toggle('online', Boolean(isOnline));
  }

  // Start the multiplayer connection.
  function start() {
    if (typeof window.io !== 'function') {
      setBadge('● OFFLINE MODE', false);

      console.warn(
        '[Wild Realm Online] Socket.IO client did not load.'
      );

      return null;
    }

    // Create one shared connection for the game.
    socket = window.io(options);

    window.realmSocket = socket;

    // Successfully connected to the server.
    socket.on('connect', function () {
      console.info(
        '[Wild Realm Online] Connected:',
        socket.id
      );

      setBadge('● ONLINE', true);
    });

    // Lost connection to the server.
    socket.on('disconnect', function (reason) {
      console.info(
        '[Wild Realm Online] Disconnected:',
        reason
      );

      setBadge('● OFFLINE MODE', false);
    });

    // Handle connection errors.
    socket.on('connect_error', function (error) {
      console.warn(
        '[Wild Realm Online] Connection failed:',
        error.message
      );

      if (!socket.connected) {
        setBadge('● CONNECTING…', false);
      }
    });

    // Socket.IO will automatically try connecting again.
    socket.io.on('reconnect_attempt', function (attempt) {
      console.info(
        '[Wild Realm Online] Reconnection attempt:',
        attempt
      );

      if (!socket.connected) {
        setBadge('● RECONNECTING…', false);
      }
    });

    socket.io.on('reconnect', function () {
      console.info(
        '[Wild Realm Online] Connection restored.'
      );
    });

    return socket;
  }

  const sharedSocket = start();

  // Public multiplayer API for other game scripts.
  window.BeastTamerOnline = {
    socket: sharedSocket,

    // Check whether the game is online.
    isConnected: function () {
      return Boolean(
        sharedSocket && sharedSocket.connected
      );
    },

    // Send an event to the server.
    emit: function (eventName, payload) {
      if (!sharedSocket || !sharedSocket.connected) {
        return false;
      }

      sharedSocket.emit(eventName, payload);

      return true;
    },

    // Try connecting again manually.
    reconnect: function () {
      if (sharedSocket && !sharedSocket.connected) {
        sharedSocket.connect();
      }
    },

    // Disconnect from the server.
    disconnect: function () {
      if (sharedSocket) {
        sharedSocket.disconnect();
      }
    }
  };
})();
