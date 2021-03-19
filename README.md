# Lumen.js -Component based Javascript framework #

A lightweight and simple to use javascript component oriented framework.

## How to Use ###

* Include and Import `lumen.css` and `lumen.js` files

* Create file `lumen.metadata.json` file in root folder, containing metadata to identify the components, the script files, the unit test files and translation files with the following format:
```json
{
    "components": [
        {"name": "ComponentMain", "path": "main-module/component-main"}
    ],
    "scripts": [
        "main-module/scriptXpto"
    ],
    "tests": {
        "unit": [
            {"class": "TestMain", "path": "test-main"}
        ]
    },
    "translations": [
        {"name": "main", "path": "main/translations/main"}
    ]
}
```

* Create  file `themes.css` to write the color themes for the application _(note that the name of the class is the name of the theme and will be used as identifier. Ex: `'.theme-xpto'` -> Name = `'theme-xpto'`)_ in the following format:

```css
    .theme-light {
        font-family: "consolas";

        --color-primary: hsl(200, 70%, 40%);
        --color-accent: hsl(20, 70%, 60%); 
        --color-dark: hsl(200, 40%, 20%); 
        --color-light: hsl(0, 0%, 100%);
        --color-background: hsl(0, 0%, 90%);
        --color-text: hsl(0, 0%, 10%);
        
    }

    .theme-dark {
        font-family: "consolas";

        --color-primary: hsl(200, 75%, 50%);
        --color-accent: hsl(20, 75%, 55%); 
        --color-dark: hsl(0, 0%, 20%); 
        --color-light: hsl(0, 0%, 90%);
        --color-background: hsl(0, 0%, 30%);
        --color-text: hsl(0, 0%, 100%);
    }
```

* Create Component files in the format:
``` javascript

var ComponentNameMetadata = {
    // selector
    selector: "component-selector",

    // inputs
    inputs: [
        "inputA"
    ],

    // outputs
    outputs: [
        "outputA"
    ],

    // css
    styles: [
        `.class-a {
            color: red;
        }`,
        `.class-b {
            color: blue;
        }`,
    ],

    // html
    template: `
        <div class="class-a">Hello</div>
        <div class="class-b">World</div>
    `
}
class ComponentName extends Lumen.Component {
    /**
     * Constructor
     */
    constructor() {
        super();
    }

    /**
     * On init
     */
    onInit(){
        return Promise.resolve();
    }

    /**
     * On changes
     */
    onChanges(input){
        return Promise.resolve();
    }

    /**
     * On destroy
     */
    onDestroy(){
        return Promise.resolve();
    }
}
```

* Call `Lumen.bootstrap` on document load in main.js:

```javascript
    Lumen.bootstrap("{dom-host-element-selector}", "ComponentName", isToLoadUnitTests /* boolean */).then(() => {
        // after bootstrap
    });
```

## Run the example ##

* Download the repository
* copy \dist files to the \example folder
* Run an http-server on the \example folder