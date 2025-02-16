const toIntercept = ["ImageCollection", "Image","FeatureCollection"];
let loggedAssets = [];
let loggedRequire = [];

// Block all network access
self.fetch = () => { throw new Error("Network access is disabled"); };
self.XMLHttpRequest = undefined;

// Dynamic Proxy handler for `ee` (intercepts only direct `ee.ImageCollection(...)` and `ee.Image(...)`)
const eeHandler = {
    get(target, prop) {
        return (...args) => {
            // Only log if the first argument exists and is a string
            if (toIntercept.includes(prop) && args.length > 0 && typeof args[0] === "string") {
                loggedAssets.push({ method: prop, args });
            }
            return new Proxy({}, recursiveHandler); // Continue chain
        };
    }
};

// Generic recursive Proxy for other objects (`Map`, `Export`, `Chart`, `ui`)
const recursiveHandler = {
    get(target, prop) {
        return (...args) => new Proxy({}, recursiveHandler); // Continue chain
    }
};

// Create dynamic objects
const ee = new Proxy({}, eeHandler);
const Map = new Proxy({}, recursiveHandler);
const Export = new Proxy({}, recursiveHandler);
const Chart = new Proxy({}, recursiveHandler);
const ui = new Proxy({}, recursiveHandler);
const print = () => {}; // No-op function

// Custom require function that logs requests
const require = (moduleName) => {
    if (typeof moduleName === "string") {
        loggedRequire.push(moduleName);
    }
    return {}; // Returns an empty object
};

// Message handler
self.onmessage = (event) => {
    // Reset logs at the start of a new message
    loggedAssets = [];
    loggedRequire = [];

    try {
        // Evaluate the received string
        eval(event.data);
    } catch (error) {
        console.error("Eval Error:", error);
    }

    // Send logged results back to the main thread
    self.postMessage({ assets: loggedAssets, requires: loggedRequire });
};
