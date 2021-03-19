/**
 * InfoTile Component
 */
var InfoTileMetadata = {
    // selector
    selector: "main-info-tile",

    // inputs
    inputs: [
        "icon",
        "title",
        "text"
    ],

    // outputs
    outputs: [
    ],

    // css
    styles: [
    ],

    // html
    template: `
        <h2 Lumen-bind="header"></h2>
        <p Lumen-bind="body"></p>
    `
}
class InfoTile extends Lumen.Component {
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
        if (input === "title") {
            this.header.innerHTML = this.title;
        }
        if (input === "text") {
            this.body.innerHTML = this.text;
        }
        return Promise.resolve();
    }

    /**
     * On destroy
     */
    onDestroy(){
        return Promise.resolve();
    }
}