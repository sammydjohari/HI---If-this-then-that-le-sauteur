export default class Highscore extends Phaser.Scene {
  constructor() {
    super({ key: "Highscore" });

    this.playerText;
  }

  init(data) {
    this.finalScore = data.score;
  }

  preload() {
    this.load.image("block", "./assets/input/block.png");
    this.load.image("rub", "./assets/input/rub.png");
    this.load.image("end", "./assets/input/end.png");

    this.load.bitmapFont(
      "arcade",
      "./assets/fonts/bitmap/arcade.png",
      "./assets/fonts/bitmap/arcade.xml"
    );
  }
  create() {
    this.userHasEnteredName = false;
    this.center = {
      x: this.physics.world.bounds.width / 2,
      y: this.physics.world.bounds.height / 2,
    };
    this.add
      .bitmapText(this.center.x, this.center.y - 100, "arcade", "RANK  SCORE   NAME")
      .setTint(0xff00ff)
      .setOrigin();
    // this.add.bitmapText(100, 310, "arcade", "       " + `${this.finalScore}`).setTint(0xff0000);

    this.playerText = this.add
      .bitmapText(this.center.x + 220, this.center.y - 50, "arcade", "")
      .setTint(0xff0000)
      .setOrigin();
    this.gameOver = this.add
      .text(this.center.x, this.center.y + 50, "Game over", {
        fontFamily: "Arcade",
        fontSize: "60px",
      })
      .setOrigin();
    this.desc = this.add
      .text(this.center.x, this.gameOver.y + 100, "Please enter your name", {
        fontFamily: "Arcade",
        fontSize: "20px",
      })
      .setOrigin();
    this.add.tween({
      targets: this.desc,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    //  Do this, otherwise this Scene will steal all keyboard input
    this.input.keyboard.enabled = false;

    this.scene.launch("InputPanel", {
      score: this.finalScore,
    });

    let panel = this.scene.get("InputPanel");

    //  Listen to events from the Input Panel scene
    panel.events.on("updateName", this.updateName, this);
    panel.events.on("submitName", this.submitName, this);
  }
  update() {
    if (this.userHasEnteredName) {
    }
  }
  submitName() {
    this.playerText.destroy();
    this.gameOver.destroy();
    this.add
      .text(this.center.x, this.center.y - 200, "High scores", {
        fontFamily: "Arcade",
        fontSize: "60px",
      })
      .setOrigin();
    this.desc.destroy();
    let highScoredPlayers = JSON.parse(localStorage.getItem("players"));
    highScoredPlayers.sort((a, b) => {
      return b.score - a.score;
    });
    const tintArray = [0xff0000, 0xff8200, 0xffff00, 0x00ff00, 0x00bfff];
    let offsetYPos = 310;
    this.scene.stop("InputPanel");
    for (let i = 0; i < highScoredPlayers.length && i < 5; i++) {
      this.add
        .bitmapText(this.center.x - 240, offsetYPos, "arcade", `${i + 1}`)
        .setTint(tintArray[i]);
      offsetYPos += 50;
    }
    let offsetYScore = 310;
    for (let i = 0; i < highScoredPlayers.length && i < 5; i++) {
      this.add
        .bitmapText(this.center.x - 30, offsetYScore, "arcade", `${highScoredPlayers[i].score}`)
        .setTint(tintArray[i]);
      offsetYScore += 50;
    }
    let offsetYName = 310;
    for (let i = 0; i < highScoredPlayers.length && i < 5; i++) {
      this.add
        .bitmapText(this.center.x + 180, offsetYName, "arcade", `${highScoredPlayers[i].name}`)
        .setTint(tintArray[i]);
      offsetYName += 50;
    }
    this.userHasEnteredName = true;
    this.backToMenu = this.add
      .text(this.center.x, this.center.y + 250, "Click anywhere on the screen to go back to main", {
        fontFamily: "Arcade",
        color: "#fff",
        fontSize: "20px",
      })
      .setOrigin(0.5)
      .setDepth(2);
    this.add.tween({
      targets: this.backToMenu,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
    this.input.on("pointerdown", () => {
      this.scene.start("StartScene");
    });
  }

  updateName(name) {
    this.playerText.setText(name);
  }
}
