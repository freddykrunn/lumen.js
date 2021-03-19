/**
 * Shell Component
 */
var ShellMetadata = {
    // selector
    selector: "main-shell",

    // inputs
    inputs: [
    ],

    // outputs
    outputs: [
    ],

    // css
    styles: [
        `.shell-container {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
        }`,
    ],

    // html
    template: `
        <div class="shell-container background">
            <nav class="navbar navbar-toggleable-md navbar-inverse bg-inverse primary shadow">
                <button class="navbar-toggler navbar-toggler-right collapsed" type="button" data-toggle="collapse" data-target="#navbarsExampleDefault" aria-controls="navbarsExampleDefault" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="navbar-collapse collapse" id="navbarsExampleDefault" aria-expanded="false">
                    <ul class="navbar-nav mr-auto">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle clickable" id="themes-dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{Translations.main.THEME}}</a>
                            <div class="dropdown-menu" aria-labelledby="themes-dropdown">
                                <a class="dropdown-item" Lumen-tag="theme-light" Lumen-action-click="setTheme">{{Translations.main.themes.LIGHT}}</a>
                                <a class="dropdown-item" Lumen-tag="theme-dark" Lumen-action-click="setTheme">{{Translations.main.themes.DARK}}</a>
                            </div>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle clickable" id="themes-dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><img Lumen-bind="languageFlag" style="margin-right: 8px;" width="24" height="24" src=""/>{{Translations.main.LANGUAGE}}</a>
                            <div class="dropdown-menu" aria-labelledby="themes-dropdown">
                                <a class="dropdown-item" Lumen-tag="pt-PT" Lumen-action-click="setLanguage"><img width="32" height="32" src="assets/pt-PT.png"/> Portuguese (PT)</a>
                                <a class="dropdown-item" Lumen-tag="en-US" Lumen-action-click="setLanguage"><img width="32" height="32" src="assets/en-US.png"/> English (US)</a>
                            </div>
                        </li>
                    </ul>
                </div>
            </nav>
            <div class="jumbotron dark">
                <div class="container">
                    <h1 class="display-3">{{Translations.main.TITLE}}</h1>
                    <p>{{Translations.main.DESCRIPTION}}</p>
                </div>
            </div>
            <div class="container background">
                <!-- Example row of columns -->
                <div class="row">
                    <div class="col-md-4">
                        <Lumen-component name="InfoTile" Lumen-bind="tile01"></Lumen-component>                
                    </div>
                    <div class="col-md-4">
                        <Lumen-component name="InfoTile" Lumen-bind="tile02"></Lumen-component>                
                    </div>
                    <div class="col-md-4">
                        <Lumen-component name="InfoTile" Lumen-bind="tile03"></Lumen-component>                
                    </div>
                </div>
                <hr class="contrast-background" style="opacity: 0.25">
                <footer>
                    <p>© Dummy Company 2018</p>
                </footer>
            </div>
        </div>
    `
}
class Shell extends Lumen.Component {
    /**
     * Constructor
     */
    constructor() {
        super();
    }

    /**
     * Set theme
     */
    setTheme(element, theme) {
        Lumen.setTheme(theme);
    }

    /**
     * Set language
     */
    setLanguage(element, language) {
        Lumen.changeCulture(language);
    }

    /**
     * On init
     */
    onInit(){
        this.languageFlag.src = "assets/"+Lumen.currentCulture+".png";

        this.tile01.set("title", Translations.main.tiles.t01.TITLE);
        this.tile01.set("text", Translations.main.tiles.t01.BODY);

        this.tile02.set("title", Translations.main.tiles.t02.TITLE);
        this.tile02.set("text", Translations.main.tiles.t02.BODY);

        this.tile03.set("title", Translations.main.tiles.t03.TITLE);
        this.tile03.set("text", Translations.main.tiles.t03.BODY);

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
        const promises = [];
        promises.push(this.tile01.destroy());
        promises.push(this.tile02.destroy());
        promises.push(this.tile03.destroy());
        return Promise.all(promises);
    }
}