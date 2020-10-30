const fs = require('fs');
const path = require('path');
const util = require('util');
const Mustache = require('mustache');

const ASSETS_PATH = path.join(__dirname, 'assets');
const VIEWS_PATH = path.join(__dirname, 'views');

const THEME_DIR_PATH = path.join(ASSETS_PATH, 'css', 'themes');
const INDEX_VIEWS_PATH = path.join(VIEWS_PATH, 'index.mustache');

//
//  HELPER FUNCTIONS
//

// function which gets the names of themes
const getThemeNames = async () => {
    const readDir = util.promisify(fs.readdir);

    return readDir(THEME_DIR_PATH).then((files) => {
        return files.map((file) => {
            if(file.endsWith('.css')) {
                const re = /^(.+).css$/;
                const groups = re.exec(file);
                return groups[1];
            }
        });
    });
};

const readTemplateFile = async () => {
    const readFile = util.promisify(fs.readFile);

    return readFile(INDEX_VIEWS_PATH, 'utf8');
};

const writeHtmlFile = async (html) => {
    const writeFile = util.promisify(fs.writeFile);

    const htmlFilePath = path.join(__dirname, 'index.html');
    return writeFile(htmlFilePath, html);
};

//
//  MAIN FUNCTION
//

const main = async () => {
    let links, themes, template, html;

    template = await readTemplateFile();
    
    // Get parsing out of the way first
    Mustache.parse(template);
    
    // collect links
    links = require('./assets/links.json');

    console.log(`Found links: ${links.map(link => JSON.stringify(link))}`);
    
    // get list of themes
    try {
        themes = await getThemeNames();
    } catch (err) {
        throw new Error(`ThemeError: ${err}`);
    }

    if (themes.length === 0) {
        console.warn(`Warning: No themes found in '${THEME_DIR_PATH}'`);
    } else {
        console.log(`Found themes: [${themes.join(', ')}]`);
    }

    // render index template
    html = Mustache.render(template, { links, themes });

    // write/overwrite html file
    await writeHtmlFile(html);
};

main().catch(err => console.error(`Error: ${err}`));
