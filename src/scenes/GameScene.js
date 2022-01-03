import Phaser from "phaser";
import config from "../main.js";

let game, ball, sasuke, sasukefire, healthbar1, healthbar2, healthbar3;
let score = 0;
let healthCounter = 3;
let overlapTriggered = false;
window.onload = () => (game = new Phaser.Game(config));

let gameOptions = {
  platformSpeedRange: 500, //speed range in px/sec
  backgroundSpeed: 80, //backgroundspeed in px/sec
  platformSpawnRange: [80, 300], //how far should the next be platform from the right edge, before next platform spawns, in px
  platformSizeRange: [200, 500], //platform width range in px
  platformHeightRange: [-5, 5], //height range between rightmost platform and next platform to be spawned
  platformHeightScale: 20, //scale to be multiplied by platformHeightRange
  playerGravity: 1200,
  jumps: 2,
  jumpForce: 500,
  platformVerticalLimit: [0.4, 0.8],
  playerStartPosition: 200, //x position
  coinPercent: 50, // % of probability of coin appearing
  ballPercent: 25, // % of probability of spike appearing
  sasukePercent: 15, // % of probability of sasuke appearing
  sasukefirePercent: 5, // % of probability of sasuke spitting fire appearing
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({
      key: "GameScene",
    });
  }

  init(data) {
    this.character = data.player;
    this.characterJumpKey = data.jumpKey;
    this.jumpFrame = data.jumpFrame;
    this.doubleJump = data.doubleJump;
    this.runningKey = data.runningKey;
    this.runningFrameStart = data.runningFrameStart;
    this.runningFrameEnd = data.runningFrameEnd;
    this.background = data.background;
    this.backgroundKey = data.backgroundKey;
    this.center = data.center;
    this.fullScreen = data.fullScreen;
    this.platformKey = data.platformKey;
    this.framesEnd = data.frames;
  }

  preload() {
    this.load.image("snow", `./assets/platforms/purpleplat.png`);
    this.load.image("lava", `./assets/platforms/lava-platform.png`);
    this.load.image("grass", `./assets/platforms/grass-platform.png`);
  }

  create() {
    this.center = {
      x: this.physics.world.bounds.width / 2,
      y: this.physics.world.bounds.height / 2,
    };
    // this.checkhealth();
    // setting player animation
    this.anims.create({
      key: this.runningKey,
      frames: this.anims.generateFrameNumbers(this.character, {
        start: this.runningFrameStart,
        end: this.runningFrameEnd,
      }),
      frameRate: 16,
      repeat: -1,
    });

    this.anims.create({
      key: this.characterJumpKey,
      frames: [{ key: this.character, frame: this.jumpFrame }],
    });

    this.anims.create({
      key: "doublejump",
      frames: this.anims.generateFrameNumbers("naruto", {
        start: 8,
        end: 11,
      }),
      frameRate: 14,
      repeat: 0,
    });

    this.anims.create({
      key: "rotate",
      frames: this.anims.generateFrameNumbers("coins", {
        start: 0,
        end: 6,
      }),
      frameRate: 15,
      repeat: -1,
    });

    this.anims.create({
      key: "bouncingRussian",
      frames: this.anims.generateFrameNumbers("white-russian", {
        start: 0,
        end: 1,
      }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: "sasukestanding",
      frames: this.anims.generateFrameNumbers("sasuke", {
        start: 0,
        end: 3,
      }),
      frameRate: 7,
      repeat: -1,
    });
    this.anims.create({
      key: "sasukefireanim",
      frames: this.anims.generateFrameNumbers("sasukefire", {
        start: 0,
        end: 7,
      }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: this.backgroundKey,
      frames: this.anims.generateFrameNames(this.background, {
        start: 0,
        end: this.framesEnd,
      }),
      frameRate: 12,
      repeat: -1,
    });
    this.addBackground();
    healthbar3 = this.add
      .image(this.center.x * 2, 10, "healthbar3")
      .setVisible(false)
      .setScale(2)
      .setOrigin(1, 0);
    healthbar2 = this.add
      .image(this.center.x * 2, 10, "healthbar2")
      .setVisible(false)
      .setScale(2)
      .setOrigin(1, 0);
    healthbar1 = this.add
      .image(this.center.x * 2, 10, "healthbar1")
      .setVisible(false)
      .setScale(2)
      .setOrigin(1, 0);

    // * ======= Groups & Pools ======== * //
    // group with all active platforms.
    this.platformGroup = this.add.group({
      // once a platform is removed, it's added to the pool
      removeCallback: function (platform) {
        // @ts-ignore Property 'platformPool' does not exist on type 'Scene'.
        platform.scene.platformPool.add(platform);
      },
    });

    // platform pool
    this.platformPool = this.add.group({
      // once a platform is removed from the pool, it's added to the active platforms group
      removeCallback: function (platform) {
        // @ts-ignore Property 'platformGroup' does not exist on type 'Scene'.
        platform.scene.platformGroup.add(platform);
      },
    });

    //group all active coins
    this.coinGroup = this.add.group({
      removeCallback: function (coin) {
        //once a coin is removed it's added to the pool
        // @ts-ignore Property 'coinPool' does not exist on type 'Scene'.
        coin.scene.coinPool.add(coin);
      },
    });

    //coin pool
    this.coinPool = this.add.group({
      removeCallback: function (coin) {
        //once a coin is removed from the pool it's added to the active coins group
        // @ts-ignore Property 'coinGroup' does not exist on type 'Scene'.
        coin.scene.coinGroup.add(coin);
      },
    });

    //group all active bowling balls
    this.ballGroup = this.add.group({
      removeCallback: function (ball) {
        //once a ball is removed it's added to the pool
        // @ts-ignore Property 'ballPool' does not exist on type 'Scene'.
        ball.scene.ballPool.add(ball);
      },
    });

    //ball pool
    this.ballPool = this.add.group({
      removeCallback: function (ball) {
        // @ts-ignore Property 'ballGroup' does not exist on type 'Scene'.
        ball.scene.ballGroup.add(ball);
      },
    });

    //group all active sasuke
    this.sasukeGroup = this.add.group({
      removeCallback: function (sasuke) {
        //once a sasuke is removed it's added to the pool
        // @ts-ignore Property 'ballPool' does not exist on type 'Scene'.
        sasuke.scene.sasukePool.add(sasuke);
      },
    });

    //sasuke pool
    this.sasukePool = this.add.group({
      removeCallback: function (sasuke) {
        // @ts-ignore Property 'ballGroup' does not exist on type 'Scene'.
        sasuke.scene.sasukeGroup.add(sasuke);
      },
    });

    //group all active sasukefire
    this.sasukefireGroup = this.add.group({
      removeCallback: function (sasukefire) {
        //once a sasuke is removed it's added to the pool
        // @ts-ignore Property 'ballPool' does not exist on type 'Scene'.
        sasukefire.scene.sasukefirePool.add(sasukefire);
      },
    });

    //sasukefire pool
    this.sasukefirePool = this.add.group({
      removeCallback: function (sasukefire) {
        // @ts-ignore Property 'ballGroup' does not exist on type 'Scene'.
        sasukefire.scene.sasukefireGroup.add(sasukefire);
      },
    });

    // number of consecutive jumps made by the player so far

    this.playerJumps = 0;
    this.dying = false;
    // * ======= Player ======== * //
    this.player = this.physics.add.sprite(
      gameOptions.playerStartPosition,
      game.config.height * 0.5,
      this.character
    );
    this.player.setGravityY(gameOptions.playerGravity);
    this.player.setDepth(5);
    this.player.setScale(1.3);
    this.player.setBodySize(47, 59);

    this.playerLanding = this.sound.add("landing", { volume: 0 });
    this.playerJumps = 0;

    this.addedPlatforms = 0;
    this.input.keyboard.on("keydown-SPACE", this.jump, this);
    this.input.on("pointerdown", this.jump, this);

    // * ======= Colliders / Overlaps ======== * //
    //setting collision between player and coins
    this.physics.add.overlap(
      this.player,
      this.coinGroup,
      (player, coin) => {
        if (overlapTriggered) {
          return;
        }
        overlapTriggered = true;
        this.updateScore();
        this.tweens.add({
          targets: coin,
          // @ts-ignore
          y: coin.y - 80,
          alpha: 0,
          duration: 800,
          ease: "Cubic.easeOut",
          callbackScope: this,
          onComplete: () => {
            this.coinGroup.killAndHide(coin);
            this.coinGroup.remove(coin);
            overlapTriggered = false;
          },
        });
      },
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.ballGroup,
      (player, ball) => {
        this.ballGroup.killAndHide(ball);
        this.ballGroup.remove(ball);
        this.checkHealth();
        healthCounter--;
        this.tweens.add({
          targets: player,
          alpha: 0,
          duration: 100,
          repeat: 3,
          yoyo: true,
          callbackScope: this,
          onComplete: () => {
            this.player.alpha = 1;
          },
        });
      },
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.sasukeGroup,
      function (player, sasuke) {
        this.sasukeGroup.killAndHide(sasuke);
        this.sasukeGroup.remove(sasuke);
        this.checkHealth();
        healthCounter--;
        this.tweens.add({
          targets: player,
          alpha: 0,
          duration: 100,
          repeat: 3,
          yoyo: true,
          callbackScope: this,
          onComplete: () => {
            this.player.alpha = 1;
          },
        });
      },
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.sasukefireGroup,
      function (player, sasukefire) {
        this.sasukefireGroup.killAndHide(sasukefire);
        this.sasukefireGroup.remove(sasukefire);
        this.checkHealth();
        healthCounter--;
        this.tweens.add({
          targets: player,
          alpha: 0,
          duration: 100,
          repeat: 3,
          yoyo: true,
          callbackScope: this,
          onComplete: () => {
            this.player.alpha = 1;
          },
        });
      },
      null,
      this
    );

    // * ======= First platform ======== * //
    // adding a platform to the game, the arguments are platform width, x position and y position
    this.addPlatform(
      game.config.width,
      game.config.width / 2,
      game.config.height * gameOptions.platformVerticalLimit[1]
    );
    // setting collisions between the player and the platform group
    this.physics.add.collider(
      this.player,
      this.platformGroup,
      () => {
        // play "run" animation if the player is on a platform
        if (!this.player.anims.isPlaying) {
          this.player.anims.play(this.runningKey);
          this.playerLanding.play();
        }
      },
      null,
      this
    );

    this.displayScore = this.add.text(20, 20, "Points: 0", {
      fontSize: "24px",
      color: "#FF00F5",
      fontFamily: "Arcade",
    });
  }
  // * ======= Methods ======== * //

  // the core of the script: platform are added from the pool or created on the fly
  addPlatform(platformWidth, posX, posY) {
    this.addedPlatforms++;
    let platform;
    if (this.platformPool.getLength()) {
      platform = this.platformPool.getFirst();
      platform.x = posX;
      platform.y = posY;
      platform.active = true;
      platform.visible = true;
      this.platformPool.remove(platform);
      platform.displayWidth = platformWidth;
      platform.tileScaleX = 1 / platform.scaleX;
    } else {
      platform = this.add.tileSprite(posX, posY, platformWidth, 64, this.platformKey);
      this.physics.add.existing(platform);
      // @ts-ignore
      platform.body.setImmovable(true);
      // @ts-ignore
      platform.body.setVelocityX(gameOptions.platformSpeedRange * -1);
      platform.setDepth(5);
      this.platformGroup.add(platform);
    }
    this.nextPlatformDistance = Phaser.Math.Between(
      gameOptions.platformSpawnRange[0],
      gameOptions.platformSpawnRange[1]
    );

    //if this is not the starting platform?
    if (this.addedPlatforms > 1) {
      //if there is a coin over the platform?
      if (Phaser.Math.Between(1, 100) <= gameOptions.coinPercent) {
        if (this.coinPool.getLength()) {
          let coin = this.coinPool.getFirst();
          coin.x = posX;
          coin.y = posY - 86;
          coin.alpha = 1;
          coin.active = true;
          coin.visible = true;
          this.coinPool.remove(coin);
        } else {
          if (this.character === "dude") {
            var coin = this.physics.add.sprite(posX, posY - 80, "white-russian");
            coin.anims.play("bouncingRussian", true);
          } else {
            var coin = this.physics.add.sprite(posX, posY - 80, "coins");
            coin.anims.play("rotate", true);
          }
          coin.setImmovable(true);
          coin.setVelocityX(platform.body.velocity.x);
          coin.setDepth(5);
          this.coinGroup.add(coin);
        }
      }

      // * ======= Ball - Obstacle ======== * //
      //if there is a ball over the platform?
      if (Phaser.Math.Between(1, 100) <= gameOptions.ballPercent && platformWidth < 350) {
        if (this.ballPool.getLength()) {
          ball = this.ballPool.getFirst();
          ball.x = posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth);
          ball.y = posY - platform.height / 2;
          ball.alpha = 1;
          ball.active = true;
          ball.visible = true;
          this.ballPool.remove(ball);
        } else {
          ball = this.physics.add.sprite(
            posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth),
            posY - platform.height / 2,
            "ball"
          );
          ball.setScale(0.07);
          ball.setDepth(5);
          ball.setOrigin(0.5, 1);
          ball.setImmovable(true);
          ball.setVelocityX(platform.body.velocity.x);
          this.ballGroup.add(ball);
        }
      }

      //if there is a sasuke over the platform?
      if (
        Phaser.Math.Between(1, 100) <= gameOptions.sasukePercent &&
        platformWidth > 350 &&
        platformWidth < 450
      ) {
        if (this.sasukePool.getLength()) {
          sasuke = this.sasukePool.getFirst();
          sasuke.x = posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth);
          sasuke.y = posY - platform.height / 2;
          sasuke.alpha = 1;
          sasuke.active = true;
          sasuke.visible = true;
          this.sasukePool.remove(sasuke);
        } else {
          sasuke = this.physics.add.sprite(
            posX - platformWidth / 2 + Phaser.Math.Between(1, platformWidth),
            posY - platform.height / 2,
            "sasuke"
          );

          // sasuke.setSize(8, 2);
          sasuke.setScale(1.15);
          sasuke.setDepth(5);
          sasuke.setFlipX(true);
          sasuke.setOrigin(0.5, 1);
          this.sasukeGroup.add(sasuke);
          sasuke.anims.play("sasukestanding");
          sasuke.setVelocityX(platform.body.velocity.x);
          sasuke.setImmovable(true);
        }
      }

      //if there is a sasukefire over the platform?
      if (Phaser.Math.Between(1, 100) <= gameOptions.sasukefirePercent && platformWidth >= 450) {
        if (this.sasukefirePool.getLength()) {
          sasukefire = this.sasukefirePool.getFirst();
          sasukefire.x = posX;
          sasukefire.y = posY - platform.height / 2;
          sasukefire.alpha = 1;
          sasukefire.active = true;
          sasukefire.visible = true;
          this.sasukefirePool.remove(sasukefire);
        } else {
          sasukefire = this.physics.add.sprite(posX, posY - platform.height / 2, "sasukefire");
          sasukefire.setScale(0.8);
          sasukefire.setDepth(5);
          sasukefire.setFlipX(true);
          sasukefire.setSize(75, 0);
          sasukefire.setOrigin(0.5, 0.8);
          sasukefire.setVelocityX(platform.body.velocity.x);
          sasukefire.setImmovable(true);
          this.sasukefireGroup.add(sasukefire);
          sasukefire.anims.play("sasukefireanim");
        }
      }
    }
  }

  updateScore() {
    score++;
    this.displayScore.setText("Points: " + score);
  }

  jump() {
    if (
      this.player.body.touching.down ||
      (this.playerJumps > 0 && this.playerJumps < gameOptions.jumps)
    ) {
      if (this.player.body.touching.down) {
        this.playerJumps = 0;
      }
      this.player.setVelocityY(gameOptions.jumpForce * -1);
      this.playerJumps++;
      this.player.anims.play(this.characterJumpKey);
      this.player.anims.stop();

      if (this.doubleJump) {
        if (this.playerJumps === 2) {
          this.player.anims.play("doublejump");
        }
      }
    }
  }

  update() {
    this.checkHealth();
    if (this.player.y > game.config.height) {
      this.gameover();
    }
    // Keep the player at the same position on the x axis
    this.player.x = gameOptions.playerStartPosition;

    // * ======= Recycling Platforms / adding new ======== * //
    let minDistance = game.config.width;
    let rightmostPlatformHeight = 0;
    this.platformGroup.getChildren().forEach(function (platform) {
      // @ts-ignore Property 'x' && 'displawidth' does not exist on type 'GameObject'.
      let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
      if (platformDistance < minDistance) {
        minDistance = platformDistance;
        // @ts-ignore Property 'y' does not exist on type 'GameObject'.
        rightmostPlatformHeight = platform.y;
      }
      // @ts-ignore Property 'x' && 'displawidth' does not exist on type 'GameObject'.
      if (platform.x < -platform.displayWidth / 2) {
        this.platformGroup.killAndHide(platform);
        this.platformGroup.remove(platform);
      }
    }, this);

    // adding new platforms
    if (minDistance > this.nextPlatformDistance) {
      let nextPlatformWidth = Phaser.Math.Between(
        gameOptions.platformSizeRange[0],
        gameOptions.platformSizeRange[1]
      );
      let platformRandomHeight =
        gameOptions.platformHeightScale *
        Phaser.Math.Between(gameOptions.platformHeightRange[0], gameOptions.platformHeightRange[1]);
      let nextPlatformGap = rightmostPlatformHeight + platformRandomHeight;

      let minPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[0];
      let maxPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[1];
      let nextPlatformHeight = Phaser.Math.Clamp(
        nextPlatformGap,
        minPlatformHeight,
        maxPlatformHeight
      );
      this.addPlatform(
        nextPlatformWidth,
        game.config.width + nextPlatformWidth / 2,
        nextPlatformHeight
      );
    }

    /// * ======= New Coins ======== * //
    this.coinGroup.getChildren().forEach(function (coin) {
      // @ts-ignore
      if (coin.x < -coin.displayWidth / 2) {
        this.coinGroup.killAndHide(coin);
        this.coinGroup.remove(coin);
      }
    }, this);

    // * ======= New Balls ======== * //
    this.ballGroup.getChildren().forEach((ball) => {
      // @ts-ignore
      if (ball.x < -ball.displayWidth / 2) {
        this.ballGroup.killAndHide(ball);
        this.ballGroup.remove(ball);
      }
    }, this);

    // adding new sasukes
    this.sasukeGroup.getChildren().forEach(function (sasuke) {
      // @ts-ignore
      if (sasuke.x < -sasuke.displayWidth / 2) {
        this.sasukeGroup.killAndHide(sasuke);
        this.sasukeGroup.remove(sasuke);
      }
    }, this);

    // adding new sasukefires
    this.sasukefireGroup.getChildren().forEach(function (sasukefire) {
      // @ts-ignore
      if (sasukefire.x < -sasukefire.displayWidth / 2) {
        this.sasukefireGroup.killAndHide(sasukefire);
        this.sasukefireGroup.remove(sasukefire);
      }
    }, this);
  }

  checkHealth() {
    if (score % 10 === 0 && score !== 0 && healthCounter !== 3) {
      healthCounter++;
    }
    switch (healthCounter) {
      case 3:
        healthbar3.setVisible(true);
        break;
      case 2:
        healthbar3.setVisible(false);
        healthbar2.setVisible(true);
        break;
      case 1:
        healthbar3.setVisible(false);
        healthbar2.setVisible(false);
        healthbar1.setVisible(true);
        break;
      case 0:
        this.gameover();
        break;
    }
  }
  addBackground() {
    this.add
      .sprite(this.center.x, this.center.y, this.background)
      .setDisplaySize(this.fullScreen.x + 2, this.fullScreen.y + 2)
      .anims.play(this.backgroundKey);
  }

  gameover() {
    this.finalScore = score;
    score = 0;
    healthCounter = 3;
    overlapTriggered = false;
    // this.getSessionStorage();
    this.scene.start("Highscore", {
      score: this.finalScore,
      center: this.center,
      fullScreen: this.fullScreen,
      background: this.background,
      frames: this.framesEnd,
      key: this.backgroundKey,
    });
  }

  getSessionStorage() {
    let oldPlayers = JSON.parse(localStorage.getItem("players")) || [];
    let newPlayerAndScore = { score: this.finalScore };
    oldPlayers.push(newPlayerAndScore);
    localStorage.setItem("players", JSON.stringify(oldPlayers));
    console.log(localStorage.getItem("players"));
  }
}
