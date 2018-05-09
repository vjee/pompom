import awaitMutation from "./../lib/awaitMutation";
import mapToPixel from "./../lib/mapToPixel";
import { createAnimationFunc } from "./../lib/animate";

/** Card class */
class Card {
  /**
   * constructor
   *
   * Card constructor
   * @param {Object} parent Instance of Caroucel
   * @param {Object} config Object containing "x", "y" and "scale" key/value pairs
   * @param {Object} data The data needed for the item
   * @param {Number} dataIndex The index of the data array on the Caroucel instance
   */
  constructor(parent, config, data, dataIndex) {
    this.parent = parent;
    this.alive = true;
    this.dataIndex = dataIndex;

    this.data = data;

    this.scale = config.scale;
    this.x = this.mapX(config.x);
    this.y = this.mapY(config.y);
  }

  /**
   * setAnimationFunction
   *
   * Set the animation function for this card
   */
  setAnimationFunction() {
    this.animate = createAnimationFunc(
      this.el,
      this.parent.duration / 1000 * 60,
      this.parent.bezier
    );
  }

  /**
   * mount
   *
   * Mount the item to the DOM and return a promise that resolves when the DOM
   * completed the mutation
   */
  mount() {
    return awaitMutation(
      this.parent.$mount,
      () => this.parent.$mount.appendChild(this.el),
      m => m.addedNodes.length > 0 && m.addedNodes[0] === this.el
    );
  }

  /**
   * unmount
   *
   * Unmount the item from the DOM and return a promise that resolves when the DOM
   * completed the mutation
   */
  unmount() {
    return awaitMutation(
      this.parent.$mount,
      () => this.parent.$mount.removeChild(this.el),
      m => m.removedNodes.length > 0 && m.removedNodes[0] === this.el
    );
  }

  /**
   * revive
   *
   * Reuse this instance and give it it's new properties
   * @param {Object} config Object containing "x", "y" and "scale" key/value pairs
   * @param {Object} data The data needed for the item
   * @param {Number} dataIndex The index of the data array on the Caroucel instance
   */
  revive(config, data, dataIndex) {
    const { x, y, scale } = config;

    this.alive = true;
    this.dataIndex = dataIndex;
    this.data = data;

    this.updateDOM();
    this.update(config);
  }

  /**
   * transform
   *
   * Animate the item from it's current position to the position from the
   * config parameter
   * @param {Object} config Object containing "x", "y" and "scale" key/value pairs
   */
  transform(config) {
    return new Promise((resolve, reject) => {
      // this.update returns the old values
      const { x, y, scale } = this.update(config);

      this.animate(
        [
          { property: "translateX", unit: "px", start: x, end: this.x },
          { property: "translateY", unit: "px", start: y, end: this.y },
          { property: "scale", unit: "", start: scale, end: this.scale }
        ],
        () => {
          if (this.offScreen()) {
            this.alive = false;
            this.unmount().then(resolve);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * update
   *
   * Give the item new properties and animate to those new properties in case
   * we don't pass false as second parameter
   * @param {Object} config Object containing "x", "y" and "scale" key/value pairs
   * @param {Boolean} execute Wheather or not to immediately go to the new position
   */
  update(config, execute = false) {
    // remember the old positions
    const x = this.x;
    const y = this.y;
    const scale = this.scale;

    // set the new positions
    this.x = this.mapX(config.x);
    this.y = this.mapY(config.y);
    this.scale = config.scale;

    if (execute) {
      this.el.style.transform = `translate(${this.x}px, ${this.y}px) scale(${
        this.scale
      })`;
    }

    // return the old positions
    return { x, y, scale };
  }

  /**
   * offScreen
   *
   * Check if the card is out of the screen's bounds.
   * @return {Boolean}
   */
  offScreen() {
    const { x, width } = this.el.getBoundingClientRect();
    return x + width <= 0 || x >= this.parent.mountWidth;
  }

  /**
   * mapX
   *
   * Return the mapped x position of the card.
   * @param {Number} x The x position of the card represented as a percentage from left/0 to centre/100
   */
  mapX(x) {
    return (
      // the x position in pixels
      mapToPixel(x / 2, this.parent.mountWidth) -
      // minus half of the card's width in pixels
      mapToPixel(this.parent.cardWidth, this.parent.mountWidth) / 2
    );
  }

  /**
   * mapY
   *
   * Return the mapped y position of the card.
   * @param {Number} y The y position of the card represented as a percentage
   */
  mapY(y) {
    return (
      // the y position of the card in pixels
      mapToPixel(y, this.parent.mountHeight) -
      // minus half of the card's height in pixels
      mapToPixel(this.parent.cardHeight, this.parent.mountHeight) / 2
    );
  }
}

export default Card;
