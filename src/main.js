import Phaser from "phaser";
import StartScene from "./scenes/StartScene";
import GameScene from "./scenes/GameScene";
import Gameover from "./scenes/Gameover";
import Highscore from "./scenes/Highscore";
import InputPanel from "./scenes/InputPanel";
const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
    arcade: {
      // gravity: { y: 900 },
      debug: false,
    },
  },
  scene: [StartScene, GameScene, Highscore, InputPanel],
};
export default config;
