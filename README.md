[![Travis CI](https://img.shields.io/travis/vjee/pompom.svg)](https://travis-ci.org/vjee/pompom)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Pompom

> NOTE: Pompom was written because I personally needed this feature.
>
> I made this open source so other people might use it or build upon it.
>
> Because of this, Pompom might has some "rough edges".

Pompom is an infinite carousel that animates the horizontal
position of its elements **as well as** the scale and vertical position.

**Table of contents:**

* [Browser support](#browser-support)
* [How it works](#how-it-works)
* [Gotchas](#gotchas)
* [Installation](#installation)
* [Usage](#usage)
* [Configuration](#configuration)

## Browser support

| Chrome | Firefox | Safari | Opera | IE/Edge |
| ------ | ------- | ------ | ----- | ------- |
| /      | /       | /      | /     | /       |

# How it works

Pompom only renders the DOM needed to display what is visibile on the screen at any given moment.
For this you provide your own function that created the DOM you want for each carousel item/card.
As wel as a "create" function, a "update" function is needed to update a card with new data.

Each time you call the "next" or "prev" method on Pompom's Carousel instance the carousel's cards/items
are animated to their new position and new scale.
This is done using a bezier curve you provide or the default on defined by Pompom.

Pompom uses [bezier-easing](https://github.com/gre/bezier-easing) to calculate each step of the animation.

# Gotchas

1. The amount of visible cards always needs to be odd. This way there is a centre card/item. Eg: 1, 3, 5, 7
2. If you want to display 7 carousel cards/items on the screen, you'll need data for 9 or more cards (visible +2)
3. The first position for the first card needs to be placed outside of the bounds of the carousel.
  This is so Pompom knows where to animate cards/items to when they leave the sceen or come in from the side of the screen.

## Installation

Add the Pompom to your project with Yarn:

```Bash
yarn add @vgesteljasper/pompom
```

or npm:

```Bash
npm install @vgesteljasper/pompom
```

## Usage

### Importing

```JavaScript
import { Carousel, createCard } from "@vgesteljasper/pompom"

// Carousel     -> The Pompom carousel class used to instantiate a new carousel
// createCard   -> Helper function to create a Card class with your own DOM structure
```

### Creating custom Card

To instantiate a new Pompom carousel we will need a Pompom `Card` class.
This class will be used to render and update each carousel card/item.

Use `createCard` to easilly create a class with your desired DOM structure.

```JavaScript
import { createCard } from "@vgesteljasper/pompom"

const Card = createCard(
  // create function
  data => { // `data` is the data passed to Pompom (see further on in documentation)
    const el = document.createElement("div")
    el.textContent = data.text

    return el
  },

  // update function
  (el, data) => { // `el` is the carousel card node, `data` is the data passed to Pompom
    el.textContent = data.text
  }
)
```

### Creating the carousel

Pompom's `Carousel` class accepts a settings object as first argument and a options object as it's second argument.

The options object is not required whereas the settings object is optional.

Seee [Configuration](#configuration) for more details.

```JavaScript
import { Carousel } from "@vgesteljasper/pompom"

const Card = /* See Usage > Creating custom Card */

const settings = {};
const options = {};

const carousel = new Carousel(settings, options)
```

## Configuration

### settings

**_Parameter 1 of new Carousel()_**

All the properties listed below are required for Pompom to work.

| Key    | Type            | Description                                                                                          | Example                                |
| ------ | --------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------- |
| mount  | String          | String to be passed to `document.querySelector` representing the carousel mount                      | `.carousel-mount`                      |
| sizes  | Object          | Object with `width` and `height` key/value pair representing the size of a single carousel card/item in percentages relative to the parent's width and height | `{ width: 300, height: 200 }`          |
| config | Array\<Object\> | Array of Objects representing the scale and position the carousel cards/items on the screen          | See `basic-example.html` for an example |
| data   | Array\<Object\> | Array of Objects representing the data needed to render each carousel card/item                      | `[ {text: "card1"}, {text: "card2"} ]` |
| card   | Function        | Class that represents a single carousel card.                                                        | `pompom.createCard()`                    |

### Options

**_Parameter 2 of new Carousel()_**

These options are like the name suggests optional and all have a default value.

| Key        | Type          | Description                                                                                    | Example                                                                                                   | Default          |
| ---------- | ------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------- |
| duration   | Number        | Amount of milliseconds it takes for the carousel cards/items to animate to their new positions | 500                                                                                                       | 300              |
| easingFunc | Array | Array of the cubic bezier coordinates for the easing of the animation       | Get your custom coordinates at [http://cubic-bezier.com](http://cubic-bezier.com) | `[0, 0, 0.58, 1]` |
