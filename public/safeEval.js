/*
  The MIT License (MIT)
  Copyright (c) 2016 Gildas Lormeau (Capsule Code)

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const safeEval = (() => {
    const sourceCode = (() => {
        const whitelist = ["Array", "ArrayBuffer", "Boolean", "Date", "DataView", "Error", "Float32Array", "Float64Array", "Infinity", "Int8Array", "Int16Array", "Int32Array", "JSON", "Map", "Math", "NaN", "Number", "Object", "Promise", "RegExp", "Set", "String", "Symbol", "Uint8Array", "Uint8ClampedArray", "Uint16Array", "Uint32Array", "WeakMap", "WeakSet", "atob", "btoa", "decodeURI", "decodeURIComponent", "encodeURI", "encodeURIComponent", "escape", "isNaN", "parseFloat", "parseInt", "undefined", "unescape", "eval"];
        const scope = getScope(Object.create(null), window);
        delete Function.prototype.constructor;
        delete Object.getPrototypeOf(async () => { }).constructor;
        delete (function * () { }).prototype.constructor.constructor;
        return code => {
            with (scope) {
                return (function () {
                    "use strict";
                    return eval(`(0,eval)("eval = undefined"),${code}`);
                })();
            }
        };

        function getScope(scope, object) {
            Object.getOwnPropertyNames(object)
                .filter(name => whitelist.indexOf(name) == -1)
                .concat(["getScope", "scope", "whitelist"])
                .forEach(name => scope[name] = undefined);
            const proto = Object.getPrototypeOf(object);
            return proto ? getScope(scope, proto) : scope;
        }
    }).toString();

    return code => {
        const sandboxIframe = document.createElement("iframe");
        document.body.appendChild(sandboxIframe);
        const script = document.createElement("script");
        script.textContent = "var safeEval = (" + sourceCode + ")();";
        const sandboxWindow = sandboxIframe.contentWindow;
        sandboxWindow.document.body.appendChild(script);
        const safeEval = sandboxWindow.safeEval;
        document.body.removeChild(sandboxIframe);
        return safeEval(code);
    };
})();
