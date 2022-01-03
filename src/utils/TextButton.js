export class TextButton extends Phaser.GameObjects.Text {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string | string[]} text
   * @param {{ fontFamily: string; fontSize: string; color: string; fontStyle?: string; font?: string; backgroundColor?: string; stroke?: string; strokeThickness?: number; shadow?: Phaser.Types.GameObjects.Text.TextShadow; padding?: Phaser.Types.GameObjects.Text.TextPadding; align?: string; maxLines?: number; fixedWidth?: number; fixedHeight?: number; resolution?: number; rtl?: boolean; testString?: string; baselineX?: number; baselineY?: number; wordWrap?: Phaser.Types.GameObjects.Text.TextWordWrap; metrics?: Phaser.Types.GameObjects.Text.TextMetrics; }} style
   * @param {{ (): void; (): void; (): void; (): void; }} callback
   */
  constructor(scene, x, y, text, style, callback) {
    super(scene, x, y, text, style);
    this.hasClicked = false;
    this.setInteractive({ useHandCursor: true })
      .on("pointerover", () => this.enterButtonHoverState())
      .on("pointerout", () => this.enterButtonRestState())
      .on("pointerdown", () => this.enterButtonActiveState())
      .on("pointerup", () => {
        this.enterButtonHasChoosenState();
        callback();
      });
  }

  enterButtonHasChoosenState() {
    if (this.hasClicked) {
      this.hasClicked = false;
      return;
    }
    this.hasClicked = true;
    this.setStyle({ fill: "#0ff" });
  }

  enterButtonHoverState() {
    this.setStyle({ fill: "#FF5733" });
    if (this.hasClicked) this.setStyle({ fill: "#0ff" });
  }

  enterButtonRestState() {
    if (!this.hasClicked) this.setStyle({ fill: "#fff" });
  }

  enterButtonActiveState() {
    this.setStyle({ fill: "#0ff" });
  }
}
