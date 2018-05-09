/**
* mutateDOMAndWait
*
* Trigger a DOM mutation and wait until the DOM tells us the mutation was completed
* @param {Node} node The node to observe
* @param {Function} mutationFunc The function to trigger the DOM mutation
* @param {Function} mutationCompleteFunc The function that checks if the mutation was completed
*/
export default (node, mutationFunc, mutationCompleteFunc) => {
 return new Promise((resolve, reject) => {
   new MutationObserver((mutationList, observer) => {
     for (let mutation of mutationList) {
       if (mutationCompleteFunc(mutation)) {
         resolve();
         observer.disconnect();
       }
     }
   }).observe(node, { childList: true });
   mutationFunc();
 });
}
