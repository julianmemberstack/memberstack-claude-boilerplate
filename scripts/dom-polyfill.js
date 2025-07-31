/**
 * DOM Polyfill for Node.js Environment
 * 
 * This utility sets up a minimal DOM environment using jsdom
 * to allow @memberstack/dom to work in Node.js scripts.
 */

const { JSDOM } = require('jsdom');

/**
 * Sets up a minimal DOM environment for Node.js
 * @param {Object} options - Configuration options
 * @param {boolean} options.verbose - Whether to log setup messages
 */
function setupDOMEnvironment(options = {}) {
  const { verbose = false } = options;
  
  // Only set up if we're in Node.js and don't already have a DOM
  if (typeof window === 'undefined' && typeof global !== 'undefined') {
    if (verbose) {
      console.log('Setting up DOM environment for Node.js...');
    }
    
    // Create a minimal DOM
    const dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
      resources: 'usable'
    });
    
    // Set up global variables that @memberstack/dom expects
    global.window = dom.window;
    global.document = dom.window.document;
    global.navigator = dom.window.navigator;
    global.localStorage = dom.window.localStorage;
    global.sessionStorage = dom.window.sessionStorage;
    global.HTMLElement = dom.window.HTMLElement;
    global.Element = dom.window.Element;
    global.Node = dom.window.Node;
    
    // Mock some additional browser APIs that might be needed
    global.fetch = global.fetch || require('node-fetch');
    
    // Set up basic event handling
    global.addEventListener = dom.window.addEventListener.bind(dom.window);
    global.removeEventListener = dom.window.removeEventListener.bind(dom.window);
    
    if (verbose) {
      console.log('DOM environment setup complete');
    }
    
    return dom;
  }
  
  return null;
}

/**
 * Cleans up the DOM environment
 */
function cleanupDOMEnvironment() {
  if (typeof global !== 'undefined' && global.window) {
    delete global.window;
    delete global.document;
    delete global.navigator;
    delete global.localStorage;
    delete global.sessionStorage;
    delete global.HTMLElement;
    delete global.Element;
    delete global.Node;
    delete global.addEventListener;
    delete global.removeEventListener;
  }
}

module.exports = {
  setupDOMEnvironment,
  cleanupDOMEnvironment
};