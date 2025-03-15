"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const outputChannel = vscode.window.createOutputChannel("HyperBricks");
function activate(context) {
    // Define HyperBricks types with descriptions
    const hyperbricksTypes = [
        { label: "HYPERMEDIA", detail: "Defines a full-page document.", documentation: "Used to structure an entire web page with `<head>` and `<body>` sections." },
        { label: "FRAGMENT", detail: "Defines a reusable section.", documentation: "Used to create dynamic components updated via HTMX requests." },
        { label: "TREE", detail: "Defines hierarchical content.", documentation: "Allows nesting of multiple elements inside a structured format." },
        { label: "TEMPLATE", detail: "Defines a reusable template.", documentation: "Allows defining dynamic content blocks with placeholders." },
        { label: "API_RENDER", detail: "Fetches and renders API data.", documentation: "Used to retrieve and display remote data with optional caching." },
        { label: "API_FRAGMENT_RENDER", detail: "Renders API data dynamically.", documentation: "Acts as a bi-directional proxy for API requests and responses." },
        { label: "HTML", detail: "Defines raw HTML content.", documentation: "Allows embedding raw HTML inside HyperBricks configurations." },
        { label: "TEXT", detail: "Defines a text block.", documentation: "Used for adding text content within HyperBricks objects." },
        { label: "HEAD", detail: "Defines the `<head>` section.", documentation: "Used to structure meta tags, stylesheets, and scripts." },
        { label: "JSON_RENDER", detail: "Handles JSON data.", documentation: "Allows parsing and rendering JSON content." },
        { label: "MENU", detail: "Defines a navigational menu.", documentation: "Used to create structured menus with sorting and active states." },
        { label: "CSS", detail: "Handles stylesheets.", documentation: "Allows inclusion of inline or linked CSS files." },
        { label: "IMAGE", detail: "Handles a single image.", documentation: "Defines and configures an image component with attributes." },
        { label: "IMAGES", detail: "Handles multiple images.", documentation: "Defines a collection of images dynamically loaded from a directory." },
        { label: "JAVASCRIPT", detail: "Handles JavaScript inclusion.", documentation: "Allows inclusion of inline or linked JavaScript files." },
        { label: "PLUGIN", detail: "Renders a custom plugin", documentation: "Used to add extra functionality and logic to HyperBricks" }
    ];
    let provider_1 = vscode.languages.registerCompletionItemProvider("hyperbricks", {
        provideCompletionItems(document, position) {
            const linePrefix = document.lineAt(position).text.slice(0, position.character);
            // Suggest HyperBricks types when typing "<" after "="
            if (linePrefix.trim().endsWith("<")) {
                return hyperbricksTypes.map(type => {
                    let item = new vscode.CompletionItem(`<${type.label}>`, vscode.CompletionItemKind.Class);
                    item.detail = type.detail; // Shows in the completion list
                    item.documentation = new vscode.MarkdownString(type.documentation); // Shows on hover
                    // Ensure correct insertion by replacing the manually typed `<`
                    item.insertText = new vscode.SnippetString(`${type.label}>`);
                    return item;
                });
            }
            return [];
        }
    }, "<"); // Trigger suggestions when typing "<"
    context.subscriptions.push(provider_1);
    // Define the response-specific properties (hx_* fields)
    const responseProperties = [
        { label: "hx_location", detail: "Sets HX-Location header.", documentation: "Triggers a client-side redirect without a full reload." },
        { label: "hx_push_url", detail: "Sets HX-Push-Url header.", documentation: "Pushes a new URL into the browser history stack." },
        { label: "hx_redirect", detail: "Sets HX-Redirect header.", documentation: "Triggers a client-side redirect to a new location." },
        { label: "hx_refresh", detail: "Sets HX-Refresh header.", documentation: "Forces a full page refresh when set to true." },
        { label: "hx_replace_url", detail: "Sets HX-Replace-URL header.", documentation: "Replaces the current URL in the location bar." },
        { label: "hx_reswap", detail: "Sets HX-Reswap header.", documentation: "Specifies the strategy for swapping response content." },
        { label: "hx_retarget", detail: "Sets HX-Retarget header.", documentation: "Defines a CSS selector for the target of the content update." },
        { label: "hx_reselect", detail: "Sets HX-Reselect header.", documentation: "Chooses which part of the response to use for the swap." },
        { label: "hx_trigger", detail: "Sets HX-Trigger header.", documentation: "Triggers client-side events." },
        { label: "hx_trigger_after_settle", detail: "Sets HX-Trigger-After-Settle header.", documentation: "Triggers events after the settle step." },
        { label: "hx_trigger_after_swap", detail: "Sets HX-Trigger-After-Swap header.", documentation: "Triggers events after the swap step." }
    ];
    // Define properties with descriptions for different object types
    const typeProperties = {
        "HYPERMEDIA": [
            { label: "title", detail: "Hypermedia title.", documentation: "Defines the title of the hypermedia site." },
            { label: "route", detail: "Hypermedia route.", documentation: "Specifies the URL-friendly identifier for the hypermedia." },
            { label: "section", detail: "Hypermedia section.", documentation: "Defines the section the hypermedia belongs to, often used with the <MENU> component." },
            { label: "items", detail: "Hypermedia dynamic items.", documentation: "Key-value pairs containing dynamic items for rendering within the hypermedia." },
            { label: "bodytag", detail: "Body tag configuration.", documentation: "Specifies a special body enclose using '|'. Not used when a <HYPERMEDIA>.template is configured." },
            { label: "enclose", detail: "Hypermedia enclosure property.", documentation: "Defines the enclosing property for the hypermedia." },
            { label: "favicon", detail: "Favicon path.", documentation: "Specifies the path to the favicon for the hypermedia." },
            { label: "template", detail: "Template configuration.", documentation: "Specifies the template configurations used for rendering the hypermedia." },
            { label: "isstatic", detail: "Is static flag.", documentation: "Indicates whether the hypermedia is static or dynamically rendered." },
            { label: "cache", detail: "Cache expiration.", documentation: "Defines the cache expiration string for hypermedia caching." },
            { label: "nocache", detail: "Disable caching.", documentation: "Explicitly disables caching for this hypermedia." },
            { label: "static", detail: "Static file path.", documentation: "Specifies the path of a static file associated with the hypermedia." },
            { label: "index", detail: "Hypermedia index.", documentation: "Defines the sort order index for menu section rendering." },
            { label: "doctype", detail: "HTML Doctype.", documentation: "Specifies an alternative Doctype for the HTML document." },
            { label: "htmltag", detail: "Opening HTML tag.", documentation: "Defines the opening HTML tag with attributes." },
            { label: "head", detail: "Head section configuration.", documentation: "Defines configurations for the head section of the hypermedia." },
        ],
        "FRAGMENT": [
            { label: "response", detail: "HTMX response header configuration.", documentation: "Specifies HTMX response header settings for this fragment." },
            { label: "title", detail: "Fragment title.", documentation: "Defines the title of the fragment." },
            { label: "route", detail: "Fragment route.", documentation: "Specifies the URL-friendly identifier for the fragment." },
            { label: "section", detail: "Fragment section.", documentation: "Defines the section this fragment belongs to." },
            { label: "items", detail: "Fragment dynamic items.", documentation: "Key-value pairs containing dynamic items for rendering within the fragment." },
            { label: "enclose", detail: "Enclosure property.", documentation: "Defines the wrapping property for the fragment's rendered output." },
            { label: "template", detail: "Template configuration.", documentation: "Specifies the template configurations used for rendering the fragment." },
            { label: "isstatic", detail: "Is static flag.", documentation: "Indicates whether the fragment is static or dynamically rendered." },
            { label: "static", detail: "Static file path.", documentation: "Specifies the path of a static file associated with the fragment." },
            { label: "cache", detail: "Cache expiration.", documentation: "Defines the cache expiration string for fragment caching." },
            { label: "nocache", detail: "Disable caching.", documentation: "Explicitly disables caching for this fragment." },
            { label: "index", detail: "Fragment index.", documentation: "Defines the sort order index for menu section rendering." }
        ],
        "TREE": [
            { label: "enclose", detail: "Tree enclosure property.", documentation: "Defines the wrapping property for the tree structure." }
        ],
        "TEMPLATE": [
            { label: "template", detail: "Template file.", documentation: "Loads contents of a template file from the module's template directory." },
            { label: "inline", detail: "Inline template.", documentation: "Defines an inline template using a multiline block." },
            { label: "querykeys", detail: "Allowed query parameters.", documentation: "Defines which query parameters are allowed to be proxied." },
            { label: "queryparams", detail: "Query parameter overrides.", documentation: "Defines specific query parameters to be set in the configuration." },
            { label: "values", detail: "Template values.", documentation: "Specifies key-value pairs for dynamic template rendering." },
            { label: "enclose", detail: "Enclosure property.", documentation: "Defines the enclosing property for the template's rendered output." }
        ],
        "API_RENDER": [
            { label: "route", detail: "Defines the API render route.", documentation: "The URL-friendly identifier for the API-rendered component." },
            { label: "url", detail: "Specifies the API endpoint.", documentation: "The URL of the API to fetch data from." },
            { label: "method", detail: "HTTP method for API request.", documentation: "Specifies the HTTP method (GET, POST, etc.) to use." },
            { label: "headers", detail: "API request headers.", documentation: "Specifies any custom HTTP headers for the API call." },
            { label: "body", detail: "API request payload.", documentation: "Defines the request body for POST or other methods." },
            { label: "template", detail: "Template file for rendering.", documentation: "Loads contents of a template file from the modules template directory." },
            { label: "inline", detail: "Inline rendering instructions.", documentation: "Template or code snippet for rendering the API response." },
            { label: "values", detail: "Template key-value pairs.", documentation: "Key-value pairs for template rendering." },
            { label: "username", detail: "Username for authentication.", documentation: "Username for basic authentication." },
            { label: "password", detail: "Password for authentication.", documentation: "Password for basic authentication." },
            { label: "status", detail: "Response status code.", documentation: "HTTP status code included in the response." },
            { label: "setcookie", detail: "Set cookie template.", documentation: "Defines a template for setting cookies in the response." },
            { label: "querykeys", detail: "Allowed query parameters.", documentation: "Defines which query parameters are allowed to be proxied." },
            { label: "queryparams", detail: "Query parameter overrides.", documentation: "Defines specific query parameters to be set in the API request." },
            { label: "jwtsecret", detail: "JWT authentication secret.", documentation: "Secret key for signing JWT tokens for authentication." },
            { label: "jwtclaims", detail: "JWT claims mapping.", documentation: "Defines key-value mappings for JWT claims." },
            { label: "debug", detail: "Enables debugging.", documentation: "Turns on debug mode for troubleshooting API rendering." },
            { label: "debugpanel", detail: "Enables frontend debug panel.", documentation: "Adds a frontend panel for debugging, available when frontend errors are enabled." },
            { label: "attributes", detail: "Extra attributes for rendering.", documentation: "Additional attributes such as id, data-role, and data-action." },
            { label: "enclose", detail: "HTML element enclosure.", documentation: "Specifies the enclosing HTML element for headers, separated by '|'" }
        ],
        "API_FRAGMENT_RENDER": [
            { label: "title", detail: "Fragment title.", documentation: "Defines the title of the API-rendered fragment." },
            { label: "route", detail: "Fragment route.", documentation: "Specifies the URL-friendly identifier for the fragment." },
            { label: "section", detail: "Fragment section.", documentation: "Defines the section this fragment belongs to." },
            { label: "enclose", detail: "Enclosure property.", documentation: "Defines the wrapping property for the fragment's rendered output." },
            { label: "nocache", detail: "Disable caching.", documentation: "Explicitly disables caching for this fragment." },
            { label: "index", detail: "Fragment index.", documentation: "Defines the sort order index for menu section rendering." },
            { label: "endpoint", detail: "API endpoint.", documentation: "Specifies the API endpoint URL." },
            { label: "method", detail: "HTTP method.", documentation: "Defines the HTTP method to use (GET, POST, PUT, DELETE, etc.)." },
            { label: "headers", detail: "Request headers.", documentation: "Defines optional HTTP headers for the API request." },
            { label: "body", detail: "Request body.", documentation: "Specifies the request payload in string format." },
            { label: "template", detail: "Template file.", documentation: "Loads contents from a template file in the module's template directory." },
            { label: "inline", detail: "Inline template.", documentation: "Defines an inline template using a multiline block." },
            { label: "values", detail: "Template values.", documentation: "Key-value pairs for dynamic template rendering." },
            { label: "username", detail: "Basic auth username.", documentation: "Specifies the username for basic authentication." },
            { label: "password", detail: "Basic auth password.", documentation: "Specifies the password for basic authentication." },
            { label: "status", detail: "Response status.", documentation: "Defines the response status code." },
            { label: "setcookie", detail: "Set cookie template.", documentation: "Specifies a template for setting cookies in the response." },
            { label: "querykeys", detail: "Allowed query parameters.", documentation: "Defines which query parameters are allowed to be proxied." },
            { label: "queryparams", detail: "Query parameter overrides.", documentation: "Defines query parameters to be included in the request." },
            { label: "jwtsecret", detail: "JWT secret key.", documentation: "Specifies the secret key used for signing JWT authentication tokens." },
            { label: "jwtclaims", detail: "JWT claims.", documentation: "Defines key-value pairs for JWT claims." },
            { label: "debug", detail: "Enable debugging.", documentation: "Turns on debug mode to inspect API responses." },
            { label: "debugpanel", detail: "Enable frontend debug panel.", documentation: "Adds a debug panel to the frontend when errors are enabled." },
        ],
        "HTML": [
            { label: "value", detail: "Raw HTML content.", documentation: "Specifies the raw HTML content to be rendered." },
            { label: "trimspace", detail: "Trim whitespace.", documentation: "Removes leading and trailing whitespace as defined by Unicode." },
            { label: "attributes", detail: "Extra attributes for rendering.", documentation: "Additional attributes such as id, data-role, and data-action." },
            { label: "enclose", detail: "HTML element enclosure.", documentation: "Specifies the enclosing HTML element for headers, separated by '|'" }
        ],
        "TEXT": [
            { label: "value", detail: "Paragraph content.", documentation: "Specifies the textual content of the paragraph." },
            { label: "attributes", detail: "Extra attributes for rendering.", documentation: "Additional attributes such as id, data-role, and data-action." },
            { label: "enclose", detail: "HTML element enclosure.", documentation: "Specifies the enclosing HTML element for headers, separated by '|'" }
        ],
        "MENU": [
            { label: "section", detail: "Menu section.", documentation: "Specifies the section of the menu to display." },
            { label: "order", detail: "Menu item order.", documentation: "Defines the order of menu items ('asc' or 'desc')." },
            { label: "sort", detail: "Sorting field.", documentation: "Specifies the field to sort menu items by ('title', 'route', or 'index')." },
            { label: "active", detail: "Active menu item template.", documentation: "Defines the template for the active menu item." },
            { label: "item", detail: "Regular menu item template.", documentation: "Defines the template for regular menu items." },
            { label: "enclose", detail: "Menu enclosure template.", documentation: "Specifies a template to enclose menu items." },
            { label: "attributes", detail: "Extra attributes for rendering.", documentation: "Additional attributes such as id, data-role, and data-action." },
            { label: "enclose", detail: "HTML element enclosure.", documentation: "Specifies the enclosing HTML element for headers, separated by '|'" }
        ],
        "CSS": [
            { label: "inline", detail: "Inline CSS content.", documentation: "Specifies inline CSS styles." },
            { label: "link", detail: "CSS link tag.", documentation: "Specifies an external CSS link tag." },
            { label: "file", detail: "CSS file path.", documentation: "Specifies the path to an external CSS file. Overrides link and inline if provided." },
            { label: "attributes", detail: "Extra attributes for rendering.", documentation: "Additional attributes such as id, data-role, and data-action." },
            { label: "enclose", detail: "HTML element enclosure.", documentation: "Specifies the enclosing HTML element for headers, separated by '|'" }
        ],
        "IMAGE": [
            { label: "src", detail: "Image source URL.", documentation: "Specifies the source URL of the image." },
            { label: "width", detail: "Image width.", documentation: "Specifies the width of the image in pixels or percentage." },
            { label: "height", detail: "Image height.", documentation: "Specifies the height of the image in pixels or percentage." },
            { label: "alt", detail: "Alternative text.", documentation: "Provides alternative text for accessibility." },
            { label: "title", detail: "Image title attribute.", documentation: "Specifies a title for the image." },
            { label: "id", detail: "Image ID.", documentation: "Specifies an ID for the image element." },
            { label: "class", detail: "CSS class.", documentation: "Defines CSS classes for styling the image." },
            { label: "quality", detail: "Image quality.", documentation: "Defines image quality for optimization." },
            { label: "loading", detail: "Loading strategy.", documentation: "Specifies the lazy loading strategy (e.g., 'lazy', 'eager')." },
            { label: "is_static", detail: "Static image flag.", documentation: "Indicates whether the image is static or dynamic." },
            { label: "attributes", detail: "Extra attributes for rendering.", documentation: "Additional attributes such as id, data-role, and data-action." },
            { label: "enclose", detail: "HTML element enclosure.", documentation: "Specifies the enclosing HTML element for headers, separated by '|'" }
        ],
        "IMAGES": [
            { label: "directory", detail: "Image directory path.", documentation: "Specifies the directory path containing the images." },
            { label: "width", detail: "Image width.", documentation: "Specifies the width of the images in pixels or percentage." },
            { label: "height", detail: "Image height.", documentation: "Specifies the height of the images in pixels or percentage." },
            { label: "id", detail: "Image ID.", documentation: "Specifies an ID for each image, with an index appended." },
            { label: "class", detail: "CSS class.", documentation: "Defines CSS classes for styling the images." },
            { label: "is_static", detail: "Static images flag.", documentation: "Indicates whether the images are static or dynamic." },
            { label: "alt", detail: "Alternative text.", documentation: "Provides alternative text for accessibility." },
            { label: "title", detail: "Image title attribute.", documentation: "Specifies a title for each image." },
            { label: "quality", detail: "Image quality.", documentation: "Defines image quality for optimization." },
            { label: "loading", detail: "Loading strategy.", documentation: "Specifies the lazy loading strategy (e.g., 'lazy', 'eager')." },
            { label: "attributes", detail: "Extra attributes for rendering.", documentation: "Additional attributes such as id, data-role, and data-action." },
            { label: "enclose", detail: "HTML element enclosure.", documentation: "Specifies the enclosing HTML element for headers, separated by '|'" }
        ],
        "JAVASCRIPT": [
            { label: "inline", detail: "Inline JavaScript content.", documentation: "Defines JavaScript code directly within a script tag." },
            { label: "link", detail: "JavaScript external link.", documentation: "Specifies a script tag with a `src` attribute pointing to an external JavaScript file." },
            { label: "file", detail: "JavaScript file path.", documentation: "Loads the content of a JavaScript file and renders it inside a script tag. Overrides link and inline if provided." },
            { label: "attributes", detail: "Extra attributes for rendering.", documentation: "Additional attributes such as id, data-role, and data-action." },
            { label: "enclose", detail: "HTML element enclosure.", documentation: "Specifies the enclosing HTML element for headers, separated by '|'" }
        ],
        "JSON_RENDER": [
            { label: "file", detail: "Local JSON file path.", documentation: "Specifies the path to the local JSON file." },
            { label: "template", detail: "Template file for rendering.", documentation: "Loads the contents of a template file from the modules template directory." },
            { label: "inline", detail: "Inline template definition.", documentation: "Defines a template using a multiline block." },
            { label: "values", detail: "Template key-value pairs.", documentation: "Specifies key-value pairs for template rendering." },
            { label: "debug", detail: "Enable debugging.", documentation: "Turns on debug mode for troubleshooting JSON rendering." },
            { label: "attributes", detail: "Extra attributes for rendering.", documentation: "Additional attributes such as id, data-role, and data-action." },
            { label: "enclose", detail: "HTML element enclosure.", documentation: "Specifies the enclosing HTML element for headers, separated by '|'" }
        ],
        "PLUGIN": [
            { label: "plugin", detail: "Plugin name.", documentation: "Specifies the name of the plugin for lookup." },
            { label: "classes", detail: "CSS classes.", documentation: "Defines optional CSS classes for styling the plugin link." },
            { label: "data", detail: "Plugin data attributes.", documentation: "Defines key-value pairs for additional plugin data." },
            { label: "attributes", detail: "Extra attributes for rendering.", documentation: "Additional attributes such as id, data-role, and data-action." },
            { label: "enclose", detail: "HTML element enclosure.", documentation: "Specifies the enclosing HTML element for headers, separated by '|'" }
        ],
        "HEAD": [
            { label: "title", detail: "Document title.", documentation: "Specifies the title of the hypermedia document." },
            { label: "favicon", detail: "Favicon path.", documentation: "Defines the path to the favicon for the document." },
            { label: "meta", detail: "Metadata properties.", documentation: "Specifies key-value pairs for meta tags in the head section." },
            { label: "css", detail: "CSS files.", documentation: "Lists the CSS files to be included in the document head." },
            { label: "js", detail: "JavaScript files.", documentation: "Lists the JavaScript files to be included in the document head." },
        ]
    };
    // Store object type assignments (variable → type)
    let assignedTypes = {};
    let propertyCompletionProvider = vscode.languages.registerCompletionItemProvider("hyperbricks", {
        provideCompletionItems(document, position) {
            const lines = document.getText().split("\n");
            const currentLine = document.lineAt(position).text;
            // Updated regex: optionally match a trailing dot
            const regex = /^\s*(\w+)((?:\.\w+)*)(\.)?$/;
            const match = currentLine.match(regex);
            if (match) {
                const objectName = match[1];
                const nestedStr = match[2];
                // Detect variable assignments (e.g., myPage = <HYPERMEDIA>)
                lines.forEach(line => {
                    const _match = line.match(/^(\w+)\s*=\s*<([^>]+)>/);
                    if (_match) {
                        assignedTypes[_match[1]] = _match[2]; // Store object type for later use
                    }
                });
                // outputChannel.appendLine(JSON.stringify({
                //     types:assignedTypes,
                //     objectName:objectName,
                // }," "));
                // The optional trailing dot is in match[3] if present.
                const nestedProps = nestedStr.split('.').filter(s => s.length > 0);
                const objectType = assignedTypes[objectName];
                if (!objectType) {
                    return [];
                }
                // If the first nested property is "response", provide hx_* completions
                if (nestedProps.length > 0 && nestedProps[0] === "response") {
                    // Only FRAGMENT and API_FRAGMENT_RENDER support nested hx_* fields
                    if (objectType === "FRAGMENT" || objectType === "API_FRAGMENT_RENDER") {
                        return responseProperties.map(prop => {
                            let item = new vscode.CompletionItem(prop.label, vscode.CompletionItemKind.Property);
                            item.detail = prop.detail;
                            item.documentation = new vscode.MarkdownString(prop.documentation);
                            return item;
                        });
                    }
                }
                else {
                    // Otherwise, provide top-level properties based on the object's type
                    if (typeProperties[objectType]) {
                        return typeProperties[objectType].map(prop => {
                            let item = new vscode.CompletionItem(prop.label, vscode.CompletionItemKind.Property);
                            item.detail = prop.detail;
                            item.documentation = new vscode.MarkdownString(prop.documentation);
                            return item;
                        });
                    }
                }
            }
            return [];
        }
    }, ".");
    context.subscriptions.push(propertyCompletionProvider);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map