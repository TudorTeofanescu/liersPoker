// src/components/common/AudioManager.js
import React from "react";

const AudioManager = () => {
  return (
    <div className="audio-container" style={{ display: "none" }}>
      {/* Sound effects */}
      <audio id="sound-button_click" preload="auto" src="/audio/button_click.mp3"></audio>
      <audio id="sound-card_flip" preload="auto" src="/audio/card_flip.mp3"></audio>
      <audio id="sound-card_deal" preload="auto" src="/audio/card_deal.mp3"></audio>
      <audio id="sound-challenge" preload="auto" src="/audio/challenge.mp3"></audio>
      <audio id="sound-challenge_success" preload="auto" src="/audio/challenge_success.mp3"></audio>
      <audio id="sound-challenge_fail" preload="auto" src="/audio/challenge_fail.mp3"></audio>
      <audio id="sound-game_win" preload="auto" src="/audio/game_win.mp3"></audio>
      <audio id="sound-game_lose" preload="auto" src="/audio/game_lose.mp3"></audio>
      <audio id="sound-chat_message" preload="auto" src="/audio/chat_message.mp3"></audio>

      {/* Background music */}
      <audio id="music-lobby_music" preload="auto" src="/audio/lobby_music.mp3" loop></audio>
      <audio id="music-game_music" preload="auto" src="/audio/game_music.mp3" loop></audio>
    </div>
  );
};

export default AudioManager;
