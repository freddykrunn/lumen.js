/** @namespace */
var Lumen = Lumen || {};
/**
 * @author Frederico Gonçalves //github.com/freddyLumenn
 */

/**
 * Lumen specific magic attributes
 */
Lumen.ATTR_BIND = "Lumen-bind";
Lumen.ATTR_TAG = "Lumen-tag";
Lumen.ATTR_ACTION_CLICK = "Lumen-action-click";
Lumen.ATTR_ARRAY = "Lumen-array";
Lumen.TAG_COMPONENT = "Lumen-component";
Lumen.TAG_REPEAT = "Lumen-repeat";

//#region system

/**
 * Metadata
 */
Lumen.metadata = {
}

/**
 * Set theme
 * @param {string} theme 
 */
Lumen.setTheme = function(theme) {
    document.body.className = theme;
}

/**
 * Bootstrap app
 * @param {string} container 
 * @param {string} component
 */
Lumen.bootstrap = function(container, component, loadTests) {
    // load current culture from cache
    Lumen.currentCulture = localStorage['current_culture'];
    if (!Lumen.currentCulture || Lumen.currentCulture === "undefined" || Lumen.currentCulture === "null" || Lumen.availableCultures.indexOf(Lumen.currentCulture) === -1) {
        Lumen.currentCulture = Lumen.defaultCulture;
    }
    // load config file and then load all app scripts
    return Lumen.loadJSON("lumen.metadata.json").then((metadata) => {
        Lumen.metadata = metadata;

        // preload required scripts
        const scriptsLoadPromises = [];

        // load all components
        if (Lumen.metadata.components instanceof Array) {
            for (const component of Lumen.metadata.components) {
                scriptsLoadPromises.push(Lumen.loadScript(`src/${component.path}.js`));
            }
        }
        // load all scripts
        if (Lumen.metadata.scripts instanceof Array) {
            for (const script of Lumen.metadata.scripts) {
                scriptsLoadPromises.push(Lumen.loadScript(`src/${script}.js`));
            }
        }
        // load all test scripts
        if (loadTests === true) {
            // unit tests
            if (Lumen.metadata.tests != null && Lumen.metadata.tests.unit instanceof Array) {
                for (const testScript of Lumen.metadata.tests.unit) {
                    scriptsLoadPromises.push(Lumen.loadScript(`test/unit/${testScript.path}.js`));
                }
            }
        } else {
            Lumen.metadata.tests = null;
        }
        // load all translations
        if (Lumen.metadata.translations instanceof Array) {
            for (const translation of Lumen.metadata.translations) {
                const promise = Lumen.loadJSON(`src/${translation.path}.${Lumen.currentCulture === Lumen.defaultCulture ? "default" : Lumen.currentCulture}.json`);
                promise.then((json) => {
                    Translations[translation.name] = json;
                });
                scriptsLoadPromises.push(promise);
            }
        }

        // add style from all components
        return Promise.all(scriptsLoadPromises).then(() => {
            if (Lumen.metadata.components instanceof Array) {
                // create stylesheets for each component
                for (const component of Lumen.metadata.components) {
                    createStylesheet(component.name);
                }

                // instantiate provided main component
                Lumen.instantiateComponent(container, component);
            }
        });
    });
}

/**
 * Instantiate component
 * @param {string} sel 
 * @param {string} name
 * @param {string} toReplaceSel 
 */
Lumen.instantiateComponent = function(sel, name, toReplaceSel) {
    var element = typeof(sel) === "object" ? sel : document.querySelector(sel);
    var toReplace = typeof(toReplaceSel) === "object" || typeof(toReplaceSel) === "number" ? toReplaceSel : document.querySelector(toReplaceSel);
    if (element != null) {
        const component = eval("new "+name+"()");
        component._init(element, toReplace);
        return component;
    }
}

//#endregion

//#region base component
/**
 * Base component
 */
Lumen.Component = class Component {
    /**
     * Constructor
     */
    constructor() {
        this.parentElement = null;
        this.element = null;
    }

    //#region private

    _removeFromView() {
        // remove element from DOM
        if (this.parentElement != null) {
            this.parentElement.removeChild(this.element);
        }
        this.element = null;
        this.parentElement = null;
    }

    _processBinds(element) {
        var bindMethod, bindProperty, elementsToBind, componentsToInstantiate;

        // Lumen-action-click
        elementsToBind = this.getElementsByAttribute(element, Lumen.ATTR_ACTION_CLICK);
        for (const el of elementsToBind) {
            const bindMethod = el.getAttribute(Lumen.ATTR_ACTION_CLICK);
            el.addEventListener("click", (event) => {
                if (this[bindMethod] != null) {
                    this[bindMethod](event, el.getAttribute(Lumen.ATTR_TAG));
                }
            });
        }

        // Lumen-bind
        elementsToBind = this.getElementsByAttribute(element, Lumen.ATTR_BIND);
        for (const el of elementsToBind) {
            bindProperty = el.getAttribute(Lumen.ATTR_BIND);
            this[bindProperty] = el;
        }

        // Lumen-component
        componentsToInstantiate = this.getElementsByTagName(element, Lumen.TAG_COMPONENT);
        componentsToInstantiate = new Array(...componentsToInstantiate);
        for (const el of componentsToInstantiate) {
            bindProperty = el.getAttribute(Lumen.ATTR_BIND);

            const componentName = el.getAttribute("name");
            const component = eval("new "+componentName+"()");
            component._init(el.parentElement, el);

            if (bindProperty != null) {
                this[bindProperty] = component;
            }
        }        
    }

    _processInitialTemplate(template) {
        var pos1, pos2, value, curly, valueText, resultString = new String(template);
        pos1 = 0;
        while (pos1 > -1) {
            pos1 = resultString.indexOf("{{", pos1);
            if (pos1 === -1) {
                break;
            }
            pos2 = resultString.indexOf("}}", pos1 + 1);
            valueText = resultString.substring(pos1 + 2, pos2);

            if (valueText != undefined) {
                curly = "{{" + valueText + "}}";
                value = window.eval.call(window,`(function () { return ${valueText};})`)();
                resultString = resultString.replace(curly, value);
            }
            pos1 = pos1 + 1;
        }
        return resultString;
    }

    //#endregion

    //#region utils
    show(selector, condition) {
        var element = this.getElement(selector);
        if (condition) {
            this.styleElement(element, "display", element.previousDisplay);
        } else {
            element.previousDisplay = element.style.display;
            this.styleElement(element, "display", "none");
        }
    }
    style(selector, prop, val) {
        var element = this.getElement(selector);
        if (val == null && prop != null && Object.keys(prop).length > 0) {
            for (const p in prop) {
                element.style.setProperty(p, prop[p]);
            }
        } else {
            element.style.setProperty(prop, val);
        }
    };
    addClass(selector, name) {
        var element = this.getElement(selector);
        var i, arr1, arr2;
        arr1 = element.className.split(" ");
        arr2 = name.split(" ");
        for (i = 0; i < arr2.length; i++) {
            if (arr1.indexOf(arr2[i]) == -1) {
                element.className += " " + arr2[i];
            }
        }
    };
    removeClass(selector, name) {
        var element = this.getElement(selector);
        var i, arr1, arr2;
        arr1 = element.className.split(" ");
        arr2 = name.split(" ");
        for (i = 0; i < arr2.length; i++) {
            while (arr1.indexOf(arr2[i]) > -1) {
                arr1.splice(arr1.indexOf(arr2[i]), 1);     
            }
        }
        element.className = arr1.join(" ");
    };
    toggleClass(selector, className, condition) {
        if (condition) {
            this.addClass(selector, className);
        } else {
            this.removeClass(selector, className);
        }
    }
    bind(selector, event, callback) {
        var element = this.getElement(selector);
        element.addEventListener(event, callback);
    }
    unbind(selector, event, callback) {
        var element = this.getElement(selector);
        element.removeEventListener(event, callback);
    }
    getElements(sel) {
        if (typeof sel == "object") {
            return [sel];
        } else {
            return this.element.querySelectorAll(sel);
        }
    };
    getElement(sel) {
        if (typeof sel == "object") {
            return sel;
        } else {
            return this.element.querySelector(sel);
        }
    };
    getElementsByAttribute(element, att) {
        var elements = element.getElementsByTagName("*"),
        attr = att.toUpperCase(),
        length = elements.length,
        i = 0,
        arr = [];
        for (i=0; i<length; i++) {
            if (elements[i].getAttribute(attr) !== null) {
                arr.push(elements[i]);
            }
        }
        return arr;
    };  
    getElementsByTagName(element, tag) {
        return element.getElementsByTagName(tag);
    };  
    createElement(type, bindVariable) {
        var element = document.createElement(type);
        if (bindVariable) {
            this[bindVariable] = element;
        }
        return element;
    };
    setInnerHTML(selector, html) {
        var element = this.getElement(selector);
        if (element != null) {
            element.innerHTML = html;
            // process binds
            this._processBinds(element);
        }
    }
    // repeatTemplate(selector, array, templateBuilder){
    //     if (array != null) {
    //         var host = this.getElement(selector);
    //         var i;
    //         if (host != null) {
    //             host.innerHTML = "";
    //             for (i=0; i<array.length; i++) {
    //                 // append string to host inner html
    //                 host.innerHTML += "\n" + this._processInitialTemplate(templateBuilder(array[i]));
    //             }
    //         }
    //         // process binds
    //         this._processBinds(host);
    //     }
    // };
    //#endregion

    //#region component
    /**
     * Instantiate component
     * @param sel the component future parent element selector
     * @param name the component name
     * @param whereToPut [optional] the index where to put the component in parent, or the selector/element to replace 
     * in the parent
     */
    instantiateComponent(sel, name, whereToPut) {
        return Lumen.instantiateComponent(sel, name, whereToPut);
    }
    //#endregion

    //#region http utils
    getHttpData(file, func) {
        this.http(file, function () {
            if (this.readyState == 4 && this.status == 200) {
                func(this.responseText);
            }
        });
    };
    getHttpObject(file, func) {
        this.http(file, function () {
            if (this.readyState == 4 && this.status == 200) {
                func(JSON.parse(this.responseText));
            }
        });
    };
    http(target, readyfunc, xml, method) {
        var httpObj;
        if (!method) {method = "GET"; }
        if (window.XMLHttpRequest) {
            httpObj = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            httpObj = new ActiveXObject("Microsoft.XMLHTTP");
        }
        if (httpObj) {
            if (readyfunc) {httpObj.onreadystatechange = readyfunc;}
            httpObj.open(method, target, true);
            httpObj.send(xml);
        }
    };
    //#endregion

    //#region lifecycle

    _init(parentElement, childToReplace) {
        // create element
        this.element = document.createElement(eval(`${this.constructor.name}Metadata.selector`));
        const initialTemplate = this._processInitialTemplate(eval(`${this.constructor.name}Metadata.template`))
        this.element.innerHTML = initialTemplate;

        // append to parent element
        if (childToReplace != null) {
            if (typeof(childToReplace) === "number") {
                parentElement.insertBefore(this.element, parentElement.childNodes[childToReplace]);
            } else {
                parentElement.replaceChild(this.element, childToReplace);
            }
        } else {
            parentElement.appendChild(this.element);
        }
        this.parentElement = parentElement;

        // process binds
        this._processBinds(this.element);

        // create inputs
        // inputs are created dynamically

        // create outputs
        var outputs = eval(`${this.constructor.name}Metadata.outputs`);
        for (const output of outputs) {
            this[output] = new Lumen.EventEmitter();
        }
        
        // init
        this.onInit();
    }

    destroy() {
        // destroy
        const promise = this.onDestroy();
        if (promise != null) {
            return promise.then(() => {
                this._removeFromView();
            });
        } else {
            this._removeFromView();
            return Promise.resolve();
        }
    }

    //#endregion

    //#region IO

    inputChanged(input) {
        if (this[input] != null) {
            this.onChanges(input);
        }
    }

    set(input, value) {
        const oldValue = this[input];
        this[input] = value;
        if (this[input] != oldValue) {
            this.onChanges(input);
        }
    }

    get(input) {
        return this[input];
    }

    on(output, callback) {
        if (this[output] != null) {
            this[output].bind(callback);
        }
    }

    off(output, callback) {
        if (this[output] != null) {
            this[output].unbind(callback);
        }
    }

    //#endregion

    //#region abstract
    onInit(){
    }
    onChanges(input){
    }
    onDestroy(){
        return Promise.resolve();
    }
    //#endregion
}

/**
 * EventEmitter
 */
Lumen.EventEmitter = class EventEmitter {
    constructor() {
        this.callbacks = [];
    }

    /**
     * Bind
     */
    bind(callback) {
        if (callback != null && this.callbacks.indexOf(callback) === -1) {
            this.callbacks.push(callback);
        }
    }

    /**
     * Unbind
     */
    unbind(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index != -1) {
            this.callbacks.splice(index, 1);
        }
    }

    /**
     * Emit
     * @param {any} value 
     */
    emit(value) {
        for (const callback of this.callbacks) {
            callback(value);
        }
    }
}

//#endregion

//#region unit tests

/**
 * Base Test Class
 */
Lumen.TestClass = class TestClass {
    /**
     * Constructor
     */
    constructor() {
    }

    assertEqual(fail, x, y, message) {
        if (x !== y) {
            fail(message);
        }
    }

    assertNotEqual(fail,x, y, message) {
        if (x === y) {
            fail(message);
        }
    }

    assertIsNull(fail,x, message) {
        if (x != null) {
            fail(message);
        }
    }
    
    assertIsNotNull(fail,x, message) {
        if (x == null) {
            fail(message);
        }
    }
    
    assertFail(fail,message) {
        fail(message);
    }
    

    init() {
        return Promise.resolve();
    }

    cleanup() {
        return Promise.resolve();
    }
}

/**
 * runTests
 */
function runTests(testClasses, index, onTestStart, onTestFinish, onClassInit, onClassCleanUp, onFinish) {
    if (index === testClasses.length) {
        onFinish();
    } else {
        var testClass = testClasses[index];
        // init
        testClass.init().then(() => {
            onClassInit(testClass.constructor.name);
            // run tests
            runAllUnitTestsOfTestClass(testClass, testClass.testMethods, 0, onTestStart, onTestFinish, () => {
                // cleanup
                testClass.cleanup().then(() => {
                    onClassCleanUp(testClass.constructor.name);
                    // run next test class
                    runTests(testClasses, index + 1, onTestStart, onTestFinish, onClassInit, onClassCleanUp, onFinish);
                });
            });
        });
    }
}

/**
 * runAllUnitTestsOfTestClass
 */
function runAllUnitTestsOfTestClass(testClassInstance, methods, index, onTestStart, onTestFinish, onFinish) {
    if (index === methods.length) {
        onFinish();
    } else {
        // start
        onTestStart(methods[index]);
        // execute
        return testClassInstance[methods[index]]().then(() => {
            // finish success
            onTestFinish(methods[index], true);
            // run next test
            runAllUnitTestsOfTestClass(testClassInstance, methods, index + 1, onTestStart, onTestFinish, onFinish);
        }).catch(ex => {
            // finish fail
            onTestFinish(methods[index], false, ex);
            // run next test
            runAllUnitTestsOfTestClass(testClassInstance, methods, index + 1, onTestStart, onTestFinish, onFinish);
        });
    }
}

/**
 * Run unit tests
 * @param {string} reportType 
 */
Lumen.runUnitTests = function(reportType, onTestsFinish) {
    if (Lumen.metadata != null && Lumen.metadata.tests != null && Lumen.metadata.tests.unit != null) {
        // instantiate test classes
        const testClasses = []; var testClass;
        for (const test of Lumen.metadata.tests.unit) {
            testClass = eval(`new ${test.class}()`);
            if (testClass != null) {
                testClasses.push(testClass);
            }
        }

        var report = [];
        var now = new Date();

        var formatDate = function(date) {
            return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        }

        // run tests of all instantiated test classes
        console.log("=== UNIT TESTS RUN ===");
        console.log("## START ##");
        runTests(testClasses, 0, (test) => {
            now = new Date();
            console.log('%c['+formatDate(now)+']%c[RUNNING] ' + test + ' ...', 'color: #919191', 'color: #000000');
        }, (test, passed, message) => {
            now = new Date();
            if (passed === true) {
                console.log('%c['+formatDate(now)+']%c[PASSED] ' + test, 'color: #919191', 'color: #28a32a');
            } else {
                console.log('%c['+formatDate(now)+']%c[FAILED] ' + test + " :: " + message, 'color: #919191', 'color: #a12727');
            }
        }, (classname) => {
            console.log('%c[TEST CLASS] ' + classname + ' :: Init', 'color: #38a09b');
        }, (classname) => {
            console.log('%c[TEST CLASS] ' + classname + ' :: Cleanup', 'color: #2888a2');
        }, () => {
            console.log("## FINISH ##");
            if (onTestsFinish != null) {
                onTestsFinish(report);
            }
        });
    }
}

//#endregion

//#region translations

/**
 *  All app translation keys
 */
Translations = {};

/**
 * Available cultures
 */
Lumen.availableCultures = [
    "en-US",
    "pt-PT"
];
/**
 * Default culture
 */
Lumen.defaultCulture = Lumen.availableCultures[0];
/**
 * Current culture
 */
Lumen.currentCulture = Lumen.defaultCulture;

/**
 * Change current culture
 * @param {string} culture 
 */
Lumen.changeCulture = function(culture) {
    if (confirm("To application will be reloaded. Do you want to leave the page?")) {
        // save current culture in cache
        localStorage['current_culture'] = culture;
        // reload app
        location.reload();
    };
}

//#endregion

//#region utils

/**
 * Load script file
 */
Lumen.loadScript = function(path) {
    return new Promise(function(resolve, reject) {
        try {
            var found = false;
            for (const child of document.head.children) {
                if (child.nodeName.toLowerCase() === "script") {
                    if (child.getAttribute("src") === path + ".js") {
                        found = true;
                        break;
                    }
                }
            }

            if (found === true) {
                resolve();
            } else {
                var script = document.createElement('script');
                script.onload = function () {
                    resolve();
                };
                script.src = path;
                script.type = 'text/javascript';
                document.head.appendChild(script);
            }
        } catch (ex) {
            console.error("Error loading script '"+path+"'");
            reject(ex);
        }
    });
}

/**
 * Load JSON file
 */
Lumen.loadJSON = function(file) {
    return new Promise(resolve => {
        var httpObj;
        if (window.XMLHttpRequest) {
            httpObj = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            httpObj = new ActiveXObject("Microsoft.XMLHTTP");
        }
        if (httpObj) {
            httpObj.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    resolve(JSON.parse(this.responseText));
                }
            }
            httpObj.open("GET", file, true);
            httpObj.send(null);
        }
    });
}

/**
 * Add new stylesheet to document for a specific component
 */
function createStylesheet(componentName) {
    for(var i = 0; i < document.head.children.length; i++){
        if(document.head.children[i].tagName === "STYLE" && document.head.children[i].getAttribute("component-name") === componentName){
            return document.head.children[i].sheet;
        }
    }

    // Create the <style> tag
    var style = document.createElement("style");
    style.setAttribute("component-name", componentName);

    // get component specific style rules and selector
    componentStyleRules = eval(componentName+"Metadata.styles");
    componentSelector = eval(componentName+"Metadata.selector");

    // insert rules
    for (let rule of componentStyleRules) {
        style.innerHTML += componentSelector + " " + rule + "\n";
    }

    // Add the <style> element to the page
    document.head.appendChild(style);

    return style.sheet;
}

//#endregion