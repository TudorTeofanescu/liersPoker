// src/components/common/ConnectionStatus.js
import React from 'react';

const ConnectionStatus = ({ isConnected, error }) => {
  if (isConnected && !error) return null;
  
  return (
    <div className={`connection-status ${!isConnected ? 'disconnected' : ''} ${error ? 'error' : ''}`}>
      {!isConnected && <span>Disconnected from server. Attempting to reconnect...</span>}
      {error && <span>{error}</span>}
    </div>
  );
};

export default ConnectionStatus;