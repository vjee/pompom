/**
 * mapToPixel
 *
 * Get the mapped pixel value of a percentage value
 * @param {Number} percentage The percentage value
 * @param {Number} relativeTo The pixel value of the element the percentage is relative to
 */
export default (percentage, relativeTo) => {
  return relativeTo / 100 * percentage;
};
