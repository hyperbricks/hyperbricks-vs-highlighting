"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// extension.ts
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
function activate(context) {
    const schemaFilePath = path.join(context.extensionPath, 'schemas', 'hyperbricks-schema.json');
    // Read the JSON schema file
    const schemaContent = fs.readFileSync(schemaFilePath, 'utf-8');
    const schema = JSON.parse(schemaContent);
    const generateCompletionItems = (schema) => {
        const items = [];
        // 1. Attempt to get named properties
        const namedProps = schema.properties?.myobject?.properties || {};
        // 2. Attempt to get "additionalProperties"
        const additionalProps = schema.properties?.myobject?.additionalProperties;
        // -- Handle named properties first --
        for (const [key, value] of Object.entries(namedProps)) {
            const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Property);
            if (value.description) {
                item.documentation = value.description;
            }
            if (value.enum) {
                item.insertText = new vscode.SnippetString(`${key} = \${1|${value.enum.join(",")}|}`);
            }
            else if (value.example) {
                item.insertText = new vscode.SnippetString(`${key} = ${value.example}`);
            }
            else {
                item.insertText = `${key} = `;
            }
            items.push(item);
        }
        // -- If additionalProperties exists, create a generic snippet --
        if (additionalProps) {
            // We'll create a 'generic' property name placeholder, e.g. "anyKey"
            const exampleKey = "anyKey";
            const item = new vscode.CompletionItem(exampleKey, vscode.CompletionItemKind.Property);
            if (additionalProps.description) {
                item.documentation = additionalProps.description;
            }
            if (additionalProps.enum) {
                item.insertText = new vscode.SnippetString(`${exampleKey} = \${1|${additionalProps.enum.join(",")}|}`);
            }
            else {
                item.insertText = `${exampleKey} = `;
            }
            items.push(item);
        }
        return items;
    };
    const generateContextualSuggestions = (document, position, lineText, schema) => {
        const items = [];
        const customSuggestions = schema.customSuggestions || [];
        for (const suggestionConfig of customSuggestions) {
            // Does the line end in one of our triggers?
            if (suggestionConfig.trigger &&
                suggestionConfig.trigger.some((trigger) => lineText.trim().endsWith(trigger))) {
                for (const suggestion of suggestionConfig.suggestions || []) {
                    const item = new vscode.CompletionItem(suggestion, vscode.CompletionItemKind.Enum);
                    // Check if we already have "<" at the end:
                    if (lineText.trim().endsWith("<")) {
                        // user typed "aaa = <"
                        item.insertText = new vscode.SnippetString(`${suggestion}>`);
                    }
                    else {
                        // user typed something else: "aaa = " or "aaa = < " with a space, etc.
                        item.insertText = new vscode.SnippetString(`<${suggestion}>`);
                    }
                    item.documentation = suggestionConfig.description || "";
                    items.push(item);
                }
            }
        }
        return items;
    };
    const provider = {
        provideCompletionItems(document, position, token, completionContext) {
            const lineText = document.lineAt(position).text.substring(0, position.character);
            const schemaSuggestions = generateCompletionItems(schema);
            const contextualSuggestions = generateContextualSuggestions(document, position, lineText, schema);
            return [...schemaSuggestions, ...contextualSuggestions];
        },
    };
    // Register the provider for the hyperbricks language
    const disposable = vscode.languages.registerCompletionItemProvider({ scheme: 'file', language: 'hyperbricks' }, provider, '=', // Trigger character
    '<', // Trigger after <
    'h' // Trigger when typing "h" for hx_ prefix
    );
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map