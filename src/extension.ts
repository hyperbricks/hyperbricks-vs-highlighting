import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {

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
    { label: "JSON", detail: "Handles JSON data.", documentation: "Allows parsing and rendering JSON content." },
    { label: "MENU", detail: "Defines a navigational menu.", documentation: "Used to create structured menus with sorting and active states." },
    { label: "CSS", detail: "Handles stylesheets.", documentation: "Allows inclusion of inline or linked CSS files." },
    { label: "IMAGE", detail: "Handles a single image.", documentation: "Defines and configures an image component with attributes." },
    { label: "IMAGES", detail: "Handles multiple images.", documentation: "Defines a collection of images dynamically loaded from a directory." },
    { label: "JS", detail: "Handles JavaScript inclusion.", documentation: "Allows inclusion of inline or linked JavaScript files." }
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
  const typeProperties: Record<string, { label: string; detail: string; documentation: string }[]> = {
    "HYPERMEDIA": [
        { label: "title", detail: "Sets the title of the page.", documentation: "Title appearing in the browser tab and in the `<title>` HTML tag." },
        { label: "route", detail: "Defines the route for the page.", documentation: "The URL-friendly identifier where this hypermedia document is served." },
        { label: "section", detail: "Defines a section.", documentation: "Used for organizing content sections (useful with menu components)." },
        { label: "bodytag", detail: "Defines the `<body>` tag.", documentation: "Allows specifying classes or inline styles for the `<body>` tag. Note: this property does not work when a template is applied." },
        { label: "enclose", detail: "Encloses content.", documentation: "Specifies an HTML element to wrap the hypermedia content (using the pipe symbol `|`)." },
        { label: "favicon", detail: "Specifies the favicon path.", documentation: "Path to the favicon file used for the browser tab icon." },
        { label: "template", detail: "Defines a reusable template.", documentation: "Provides a template for dynamically rendering page content." },
        { label: "cache", detail: "Enables caching.", documentation: "Specifies a cache expiration duration (e.g., '10m') for the document." },
        { label: "nocache", detail: "Disables caching.", documentation: "Prevents caching of the hypermedia document when set to true." },
        { label: "static", detail: "Defines a static file.", documentation: "Indicates that the document should be rendered to a static file." },
        { label: "index", detail: "Specifies an index value.", documentation: "Used for ordering hypermedia items (e.g., in menus)." },
        { label: "doctype", detail: "Defines the document type.", documentation: "Allows specifying an alternative DOCTYPE for the HTML document." },
        { label: "htmltag", detail: "Defines the opening `<html>` tag.", documentation: "Specifies attributes for the `<html>` element." },
        { label: "head", detail: "Specifies the `<head>` section.", documentation: "Allows inclusion of metadata, links, and scripts in the header." }
    ],
    "FRAGMENT": [
        { label: "response", detail: "HTMX response header configuration.", documentation: "Defines HTMX response headers for dynamic updates (e.g., hx_trigger, hx_redirect)." },
        { label: "title", detail: "Fragment title.", documentation: "Used as the title for the fragment in the context of menus." },
        { label: "route", detail: "Defines the fragment route.", documentation: "The URL-friendly identifier for the fragment." },
        { label: "section", detail: "Defines a section.", documentation: "Used for grouping fragments, especially with menu components." },
        { label: "enclose", detail: "Wraps fragment content.", documentation: "Specifies an HTML element to wrap the fragment (using `|`)." },
        { label: "template", detail: "Template configuration.", documentation: "Allows using a template to render fragment content." },
        { label: "static", detail: "Static file path.", documentation: "Specifies a static file to be served for GET requests." },
        { label: "cache", detail: "Enables caching.", documentation: "Defines cache expiration for the fragment." },
        { label: "nocache", detail: "Disables caching.", documentation: "Prevents caching of the fragment." },
        { label: "index", detail: "Specifies an index value.", documentation: "Determines the order of fragments in a menu or list." }
        // { label: "hx_location", detail: "Sets HX-Location header.", documentation: "Triggers a client-side redirect without a full reload." },
        // { label: "hx_push_url", detail: "Sets HX-Push-Url header.", documentation: "Pushes a new URL into the browser history stack." },
        // { label: "hx_redirect", detail: "Sets HX-Redirect header.", documentation: "Triggers a client-side redirect to a new location." },
        // { label: "hx_refresh", detail: "Sets HX-Refresh header.", documentation: "Forces a full page refresh when set to true." },
        // { label: "hx_replace_url", detail: "Sets HX-Replace-URL header.", documentation: "Replaces the current URL in the location bar." },
        // { label: "hx_reswap", detail: "Sets HX-Reswap header.", documentation: "Specifies the strategy for swapping response content." },
        // { label: "hx_retarget", detail: "Sets HX-Retarget header.", documentation: "Defines a CSS selector for the target of the content update." },
        // { label: "hx_reselect", detail: "Sets HX-Reselect header.", documentation: "Chooses which part of the response to use for the swap." },
        // { label: "hx_trigger", detail: "Sets HX-Trigger header.", documentation: "Triggers client-side events." },
        // { label: "hx_trigger_after_settle", detail: "Sets HX-Trigger-After-Settle header.", documentation: "Triggers events after the settle step." },
        // { label: "hx_trigger_after_swap", detail: "Sets HX-Trigger-After-Swap header.", documentation: "Triggers events after the swap step." }
    ],
    "TREE": [
        { label: "enclose", detail: "Defines enclosing tag.", documentation: "Specifies an HTML element to wrap tree content using the pipe symbol `|`." }
    ],
    "TEMPLATE": [
        { label: "template", detail: "Specifies the template.", documentation: "The name or reference to the external template file." },
        { label: "inline", detail: "Defines an inline template.", documentation: "Contains inline template code for rendering content." },
        { label: "querykeys", detail: "Specifies query keys.", documentation: "Defines which query parameters to use for the template." },
        { label: "queryparams", detail: "Defines query parameters.", documentation: "Specifies additional query parameters for template rendering." },
        { label: "values", detail: "Key-value pairs for rendering.", documentation: "Provides data values to be injected into the template." },
        { label: "enclose", detail: "Encloses rendered output.", documentation: "Wraps the template output within a specified HTML element." }
    ],
    "API_RENDER": [
        { label: "route", detail: "Defines the API render route.", documentation: "The URL-friendly identifier for the API-rendered component." },
        { label: "url", detail: "Specifies the API endpoint.", documentation: "The URL of the API to fetch data from." },
        { label: "method", detail: "HTTP method for API request.", documentation: "Specifies the HTTP method (GET, POST, etc.) to use." },
        { label: "inline", detail: "Inline rendering instructions.", documentation: "Template or code snippet for rendering the API response." },
        { label: "body", detail: "API request payload.", documentation: "Defines the request body for POST or other methods." },
        { label: "headers", detail: "API request headers.", documentation: "Specifies any custom HTTP headers for the API call." },
        { label: "debug", detail: "Enables debugging.", documentation: "Turns on debug mode for troubleshooting API rendering." }
    ],
    "API_FRAGMENT_RENDER": [
        { label: "route", detail: "Defines the API fragment route.", documentation: "The URL-friendly identifier for the API fragment component." },
        { label: "url", detail: "Specifies the API endpoint.", documentation: "The URL of the API to fetch data from." },
        { label: "method", detail: "HTTP method for API request.", documentation: "Specifies the HTTP method (GET, POST, etc.) to use." },
        { label: "inline", detail: "Inline rendering instructions.", documentation: "Template or code snippet for rendering the API response." },
        { label: "body", detail: "API request payload.", documentation: "Defines the request body for POST or other methods." },
        { label: "headers", detail: "API request headers.", documentation: "Specifies any custom HTTP headers for the API call." },
        { label: "debug", detail: "Enables debugging.", documentation: "Turns on debug mode for troubleshooting the API fragment." },
        { label: "setcookie", detail: "Sets client cookie.", documentation: "Provides a template to set a cookie from the API response." },
        { label: "response", detail: "HTMX response header configuration.", documentation: "Defines HTMX headers (e.g., hx_trigger) for the API fragment." }
    ],
    "HTML": [
        { label: "enclose", detail: "Encloses HTML content.", documentation: "Defines the enclosing HTML element using the pipe symbol `|`." },
        { label: "value", detail: "Raw HTML content.", documentation: "Specifies the HTML markup to be rendered." },
        { label: "trimspace", detail: "Trims whitespace.", documentation: "Removes leading and trailing whitespace from the HTML content." }
    ],
    "TEXT": [
        { label: "enclose", detail: "Encloses text content.", documentation: "Defines the HTML element to wrap the text using the pipe symbol `|`." },
        { label: "value", detail: "Text content.", documentation: "Specifies the plain text to be displayed." }
    ],
    "HEAD": [
        { label: "title", detail: "Document title.", documentation: "Specifies the title to be used in the `<title>` tag." },
        { label: "favicon", detail: "Favicon path.", documentation: "Path to the favicon file (icon displayed in the browser tab)." },
        { label: "meta", detail: "Metadata key-value pairs.", documentation: "Defines meta tags for the document header." },
        { label: "css", detail: "CSS files or inline styles.", documentation: "Specifies CSS resources to be included in the header." },
        { label: "js", detail: "JavaScript files or inline scripts.", documentation: "Specifies JavaScript resources to be included in the header." }
    ],
    "JSON": [
        { label: "attributes", detail: "Extra attributes.", documentation: "Specifies additional attributes to customize JSON rendering." },
        { label: "enclose", detail: "Encloses JSON output.", documentation: "Wraps the rendered JSON in a specified HTML element." },
        { label: "file", detail: "JSON file path.", documentation: "Specifies the path to an external JSON file." },
        { label: "template", detail: "Template for JSON rendering.", documentation: "Defines a template to format the JSON data." },
        { label: "inline", detail: "Inline JSON content.", documentation: "Provides inline JSON or a template snippet." },
        { label: "values", detail: "Key-value pairs.", documentation: "Data values to be used when rendering the JSON template." },
        { label: "debug", detail: "Enables debug mode.", documentation: "Turns on debug mode to help troubleshoot JSON rendering issues." }
    ],
    "MENU": [
        { label: "enclose", detail: "Encloses menu items.", documentation: "Defines an HTML element to wrap the menu items using the pipe (`|`) syntax." },
        { label: "section", detail: "Menu section.", documentation: "Specifies the section to which the menu belongs." },
        { label: "order", detail: "Menu order.", documentation: "Defines a custom order for the menu items." },
        { label: "sort", detail: "Menu sort.", documentation: "Specifies the sorting criteria for menu items." },
        { label: "active", detail: "Active menu item.", documentation: "Marks a menu item as active, typically highlighting it in the UI." },
        { label: "item", detail: "Menu item.", documentation: "Defines an individual menu item entry." }
    ],
    "CSS": [
        { label: "inline", detail: "Inline CSS content.", documentation: "Specifies inline CSS styles." },
        { label: "file", detail: "CSS file path.", documentation: "Specifies the path to an external CSS file." }
    ],
    "IMAGE": [
        { label: "src", detail: "Image source URL.", documentation: "Specifies the URL of the image to display." },
        { label: "width", detail: "Image width.", documentation: "Defines the width of the image (in pixels or as a CSS value)." },
        { label: "height", detail: "Image height.", documentation: "Defines the height of the image (in pixels or as a CSS value)." },
        { label: "alt", detail: "Alt text.", documentation: "Provides alternative text for the image for accessibility." }
    ],
    "IMAGES": [
        { label: "directory", detail: "Images directory.", documentation: "Specifies the directory to load multiple images from." },
        { label: "width", detail: "Image width.", documentation: "Defines the width for the images." },
        { label: "height", detail: "Image height.", documentation: "Defines the height for the images." },
        { label: "alt", detail: "Alt text.", documentation: "Provides alternative text for the images." }
    ],
    "JS": [
        { label: "inline", detail: "Inline JavaScript.", documentation: "Specifies inline JavaScript code." },
        { label: "src", detail: "JavaScript file path.", documentation: "Specifies the path to an external JavaScript file." },
        { label: "attributes", detail: "Script attributes.", documentation: "Provides additional attributes (e.g., type) for the script tag." }
    ]
  };

  // Store object type assignments (variable → type)
  let assignedTypes: Record<string, string> = {};


  let propertyCompletionProvider = vscode.languages.registerCompletionItemProvider("hyperbricks", {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
        const currentLine = document.lineAt(position).text;
        // Updated regex: optionally match a trailing dot
        const regex = /^\s*(\w+)((?:\.\w+)*)(\.)?$/;
        const match = currentLine.match(regex);

        if (match) {
            const objectName = match[1];
            const nestedStr = match[2];
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
            } else {
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

export function deactivate() {}