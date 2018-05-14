/**
 * createAnimationFunc
 *
 * Create an animate function with the correct bezier curve, and duration.
 * @param {Node} node The node of which to animate the transform property of
 * @param {Number} frames The amount of frames to animate over
 * @param {Function} bezier THe bezier function (created by the bezier-easing package)
 */
export const createAnimationFunc = (node, frames, bezier) => (
  items,
  callback
) => {
  let iteration = 0

  const step = () => {
    iteration += 1 / frames

    // calculate the next transform
    const bezierPoint = bezier(iteration)
    node.style.transform = items.reduce((a, i) => `${a} ${i.property}(${i.start + (i.end - i.start) * bezierPoint}${i.unit}) `, '') /* prettier-ignore */

    // go again or trigger callback when we're finished
    return bezierPoint < 1 && iteration < 1
      ? requestAnimationFrame(step)
      : (() => {
        // update the transform one last time to the target values
        node.style.transform = items.reduce((a, i) => `${a} ${i.property}(${i.end}${i.unit}) `, '') /* prettier-ignore */

        // trigger callback
        callback && callback()
      })()
  }

  requestAnimationFrame(step)
}
