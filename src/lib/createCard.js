import Card from "./../classes/Card"

/**
 * Create a new Card class with a user provided DOM tree.
 *
 * @param {Function} userDOMCreator A function that returns a DOM node
 * @param {Function} userDOMUpdator A function that updated the user DOM node
 */
export default (userDOMCreator, userDOMUpdator) => {
  return class PompomCard extends Card {
    constructor(parent, config, data, dataIndex) {
      super(parent, config, data, dataIndex);

      this.createDOM = () => {
        this.el = userDOMCreator(this.data);
        this.el.dataset.pompomCard = "";
        this.el.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
        this.el.style.willChange = "transform";
      }

      this.updateDOM = () => {
        userDOMUpdator(this.el, this.data);
      }

      this.createDOM();

      this.setAnimationFunction();
    }
  };
};
