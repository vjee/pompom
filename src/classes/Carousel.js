import BezierEasing from 'bezier-easing'
import mapToPixel from './../lib/mapToPixel'
import EventTarget from './EventTarget'

/** Carousel class */
class Carousel extends EventTarget {
  /**
   * constructor
   *
   * Carousel constructor
   * @param {Object} settings Object containing all the required settings needed for this Carousel instance
   * @param {Object} options Object containing all the options we want for this Carousel instance
   */
  constructor (settings, options = {}) {
    super()

    this.parseSettings(settings)
    this.parseOptions(options)

    this.cardPool = []
    this.map = []
    this.centreDataIndex = 0
    this.animating = false

    // create the bezier curve we can extract points from
    this.bezier = BezierEasing(...this.easingFunc)

    this.completeConfig()
    this.buildMap()
    this.initialiseDOM()

    this.keyListener = this.keyListener.bind(this)
    this.gettinJiggyWithIt = this.gettinJiggyWithIt.bind(this)

    window.addEventListener('keyup', this.keyListener)
    window.addEventListener('resize', this.gettinJiggyWithIt)
  }

  /**
   * delete
   *
   * Stops all event listeners and removed the DOM from the $mount
   */
  delete () {
    window.removeEventListener('keyup', this.keyListener)
    window.removeEventListener('resize', this.gettinJiggyWithIt)

    this.$mount.innerHTML = ''
    this.$mount.removeAttribute('data-pompom-mount')
  }

  keyListener (event) {
    switch (event.keyCode) {
      case 39:
        this.next()
        break
      case 37:
        this.prev()
        break
    }
  }

  /**
   * gettinJiggyWithIt
   *
   * Triggered when the browser window changes dimensions
   */
  gettinJiggyWithIt () {
    this.setMountSize()

    this.cardPool.filter(card => card.alive).forEach(card => {
      // find configIndex from cards dataIndex
      const { configIndex } = this.map.find(
        pair => pair.dataIndex === card.dataIndex
      )
      card.update(this.config[configIndex], true)
    })
  }

  /**
   * parseSettings
   *
   * Set all the settings on this instance and throw errors when there is a
   * misconfiguration.
   * @param {Object} settings Object containing all the required settings needed for this Carousel instance
   */
  parseSettings (settings) {
    this.$mount = document.querySelector(settings.mount)
    if (!this.$mount) {
      throw new Error('settings.mount should be a valid DOM selector with only one result.')
    }
    this.setMountSize()

    this.setCardSize(settings.sizes)
    if (!this.cardWidth || !this.cardHeight) {
      throw new Error('settings.sizes is required and should have a width and height property.')
    }

    this.config = settings.config
    this.diffCentreBorder = settings.config.length - 1
    if (!(this.config.length % 2)) {
      throw new Error('settings.config should have an odd amount of items.')
    }

    const width =
      mapToPixel(this.cardWidth, this.mountWidth) * this.config[0].scale / 2
    const x = mapToPixel(this.config[0].x / 2, this.mountWidth)

    if (width + x > 0) {
      throw new Error(
        `The 'scale' and 'x' properties on the first settings.config object should be set so that the carousel card doesn't intersect with the screen.\nThis is so Pompom can animate the outer items in and out of the screen.\nThe card should be at least ${width + x}px more to the left.\nConsult the documentation https://github.com/vgesteljasper/pompom-carousel/blob/master/README.md for more information.`)
    }

    this.data = settings.data
    if (!this.data || this.data.length === 0) {
      throw new Error(
        'settings.data should be an array of objects containing the data needed for each carousel item.'
      )
    }

    this.Card = settings.Card
    if (!this.Card) {
      throw new Error(
        'settings.Card is required. Create a \'Card\' by calling \'pompom.createCard\'. Consult the README for more information.'
      )
    }
  }

  /**
   * parseOptions
   *
   * Set all the options on this instance
   * @param {Object} options Object containing options
   */
  parseOptions (options) {
    this.duration = options.duration || 300
    this.easingFunc = options.easingFunc || [0, 0, 0.58, 1]
  }

  /**
   * setMountSize
   *
   * Get the dimensions of the Carousel mount and set them on this instance
   */
  setMountSize () {
    const { width, height } = this.$mount.getBoundingClientRect()
    this.mountWidth = width
    this.mountHeight = height
  }

  /**
   * setCardSize
   *
   * Set the size for the Carousel cards
   * @param {Object} sizes Object containing a "width" and "height" key/value pair
   */
  setCardSize (sizes) {
    this.cardWidth = sizes.width
    this.cardHeight = sizes.height
  }

  /**
   * completeConfig
   *
   * Complete the config by mirroring what we already have and appending that to
   * the end of the array
   */
  completeConfig () {
    let index = this.config.length - 2
    while (index > -1) {
      // create copy of the config object
      const config = { ...this.config[index] }

      // transform the x to the other side of the imaginary x/y field
      config.x = 100 + (100 - config.x)

      this.config.push(config)
      index--
    }

    this.configLength = this.config.length
  }

  /**
   * buildMap
   *
   * Build a map of config indexes and data indexes that we can use to keep
   * track of what card needs to be displayed where and with which data
   */
  buildMap () {
    // centre index
    const centreConfigIndex = this.configLength / 2 + 0.5 - 1

    let configIndex
    let dataIndex

    // add from the centre to the right most index
    dataIndex = 0
    for (
      configIndex = centreConfigIndex;
      configIndex < this.configLength;
      configIndex++
    ) {
      this.map.push({ configIndex, dataIndex })
      dataIndex++
    }

    // add from the centre-1 to the left most index
    dataIndex = this.data.length - 1
    for (configIndex = centreConfigIndex - 1; configIndex >= 0; configIndex--) {
      this.map.push({ configIndex, dataIndex })
      dataIndex--
    }

    // sort from left to right config
    this.map = this.map.sort((a, b) => a.configIndex - b.configIndex)
  }

  /**
   * prev
   *
   * Shorthand for Carousel.navigate({...}, false)
   */
  prev () {
    this.navigate(
      {
        configIndex: 0,
        dataIndex: this.prevDataIndex(
          this.centreDataIndex,
          this.diffCentreBorder
        )
      },
      false
    )
  }

  /**
   * next
   *
   * Shorthand for Carousel.navigate({...}, true)
   */
  next () {
    this.navigate(
      {
        configIndex: this.configLength - 1,
        dataIndex: this.nextDataIndex(
          this.centreDataIndex,
          this.diffCentreBorder
        )
      },
      true
    )
  }

  /**
   * navigate
   *
   * Animate all cards to their new position
   * @param {Object} indexes An object containing a "configIndex" and "dataIndex" key/value pair
   * @param {Boolean} next Wheather or not we go to the next or previous index
   */
  navigate (indexes, next) {
    if (this.animating) return

    // temporarily disable calls this method untill the animation has finished
    this.animating = true

    // fire "animationStart" event
    this.dispatchEvent(
      new CustomEvent('animationStart', {
        detail: { centreDataIndex: this.centreDataIndex }
      })
    )

    // wait untill we the DOM has the new card
    this.spawnCard(indexes).then(() => {
      // shift the entire map for next time we want to navigate
      this.shiftMap(next)

      // now we can update the centreDataIndex (+1)
      this.centreDataIndex = next
        ? this.nextDataIndex(this.centreDataIndex)
        : this.prevDataIndex(this.centreDataIndex)

      // wait for all cards to animate to their new positions
      Promise.all(
        this.cardPool.filter(card => card.alive).map(card => {
          // find the new configIndex with the card's dataIndex
          const { configIndex } = this.map.find(
            pair => pair.dataIndex === card.dataIndex
          )

          // if (!configIndex) return console.log(card.dataIndex)
          return card.transform(this.config[configIndex])
        })
      ).then(() => {
        this.animating = false

        // fire "animationEnd" event
        this.dispatchEvent(
          new CustomEvent('animationEnd', {
            detail: { centreDataIndex: this.centreDataIndex }
          })
        )
      })
    })
  }

  /**
   * shiftDataIndex
   *
   * Calculate the next index according to if we go to the next of previous card
   * @param {Number} value The current index
   * @param {Number} times The amount of times we need to execute this operation
   * @param {Boolean} next Wheather or not we go to the next or previous index
   * @return {Number} The calculated index
   */
  shiftDataIndex (value, times = 1, next = true) {
    let v = value

    for (let i = 0; i < times; i++) {
      v = next
        ? v + 1 < this.data.length
          ? v + 1
          : 0
        : v - 1 >= 0
          ? v - 1
          : this.data.length - 1
    }

    return v
  }

  /**
   * nextDataIndex
   *
   * Go to the next card index
   * @param {Number} value The current index
   * @param {Number} times The amount of times we need to execute this operation
   * @return {Number} The calculated index
   */
  nextDataIndex (value, times = 1) {
    return this.shiftDataIndex(value, times, true)
  }

  /**
   * prevDataIndex
   *
   * Go to the previous card index
   * @param {Numver} value The current index
   * @param {Number} times The amount of times we need to execute this operation
   * @return {Number} The calculated index
   */
  prevDataIndex (value, times = 1) {
    return this.shiftDataIndex(value, times, false)
  }

  /**
   * shiftMap
   *
   * Shift the dataIndex of the entire map to the next or previous index
   * @param {Boolean} next Wheather of not we go to the next or previous index
   */
  shiftMap (next = true) {
    // shift dataIndexes for all configIndexes
    this.map = this.map.map(pair => ({
      ...pair,
      dataIndex: this.shiftDataIndex(pair.dataIndex, 1, next)
    }))
  }

  /**
   * initialiseDOM
   *
   * Clear the mount, add the Carousel cards and add the correct styles for the
   * Carousel cards to the head of the document
   */
  initialiseDOM () {
    // empty the mount
    this.$mount.innerHTML = ''
    this.$mount.dataset.pompomMount = ''

    // spawn cards
    this.map
      .filter(
        pair =>
          pair.configIndex !== 0 && pair.configIndex !== this.configLength - 1
      )
      .map(pair => this.spawnCard(pair))

    // set styles for cards
    const $styles = document.createElement('style')
    $styles.type = 'text/css'

    $styles.textContent = `[data-pompom-mount]{overflow:hidden;position:relative;}[data-pompom-card]{position:absolute;top:0;left:0;width:${
      this.cardWidth
    }%;height:${this.cardHeight}%;}`

    document.head.appendChild($styles)
  }

  /**
   *
   * spawnCard
   *
   * Create a new Carousel card or reuse an existing one in case it is not being
   * used anymore
   * @param {Object} pair A single card from the config/data map
   */
  spawnCard (pair) {
    const { configIndex, dataIndex } = pair
    const config = this.config[configIndex]
    const data = this.data[dataIndex]

    let card = this.cardPool.find(card => !card.alive)
    if (card) {
      card.revive(config, data, dataIndex)
    } else {
      card = new this.Card(this, config, data, dataIndex)
      this.cardPool.push(card)
    }

    return card.mount()
  }
}

export default Carousel
