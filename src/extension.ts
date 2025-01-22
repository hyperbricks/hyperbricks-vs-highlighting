// extension.ts
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  const schemaFilePath = path.join(context.extensionPath, 'schemas', 'hyperbricks-schema.json');

  // Read the JSON schema file
  const schemaContent = fs.readFileSync(schemaFilePath, 'utf-8');
  const schema = JSON.parse(schemaContent);

  // Define a type for schema properties
  interface SchemaProperty {
    description?: string;
    enum?: string[];
    example?: string;
  }

  interface CustomSuggestion {
    trigger?: string[];
    suggestions?: string[];
    description?: string;
  }

  const generateCompletionItems = (schema: any): vscode.CompletionItem[] => {
    const items: vscode.CompletionItem[] = [];
  
    // 1. Attempt to get named properties
    const namedProps = schema.properties?.myobject?.properties || {};
  
    // 2. Attempt to get "additionalProperties"
    const additionalProps = schema.properties?.myobject?.additionalProperties;
  
    // -- Handle named properties first --
    for (const [key, value] of Object.entries<SchemaProperty>(namedProps)) {
      const item = new vscode.CompletionItem(key, vscode.CompletionItemKind.Property);
  
      if (value.description) {
        item.documentation = value.description;
      }
  
      if (value.enum) {
        item.insertText = new vscode.SnippetString(`${key} = \${1|${value.enum.join(",")}|}`);
      } else if (value.example) {
        item.insertText = new vscode.SnippetString(`${key} = ${value.example}`);
      } else {
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
        item.insertText = new vscode.SnippetString(
          `${exampleKey} = \${1|${additionalProps.enum.join(",")}|}`
        );
      } else {
        item.insertText = `${exampleKey} = `;
      }
  
      items.push(item);
    }
  
    return items;
  };
  

  const generateContextualSuggestions = (
    document: vscode.TextDocument,
    position: vscode.Position,
    lineText: string,
    schema: any
  ): vscode.CompletionItem[] => {
    const items: vscode.CompletionItem[] = [];
  
    const customSuggestions: CustomSuggestion[] = schema.customSuggestions || [];
    for (const suggestionConfig of customSuggestions) {
      // Does the line end in one of our triggers?
      if (
        suggestionConfig.trigger &&
        suggestionConfig.trigger.some((trigger) =>
          lineText.trim().endsWith(trigger)
        )
      ) {
        for (const suggestion of suggestionConfig.suggestions || []) {
          const item = new vscode.CompletionItem(
            suggestion,
            vscode.CompletionItemKind.Enum
          );
          // Check if we already have "<" at the end:
          if (lineText.trim().endsWith("<")) {
            // user typed "aaa = <"
            item.insertText = new vscode.SnippetString(`${suggestion}>`);
          } else {
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

  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems(
      document: vscode.TextDocument,
      position: vscode.Position,
      token: vscode.CancellationToken,
      completionContext: vscode.CompletionContext
    ) {
      const lineText = document.lineAt(position).text.substring(0, position.character);
      const schemaSuggestions = generateCompletionItems(schema);
      const contextualSuggestions = generateContextualSuggestions(document, position, lineText, schema);

      return [...schemaSuggestions, ...contextualSuggestions];
    },
  };

  // Register the provider for the hyperbricks language
  const disposable = vscode.languages.registerCompletionItemProvider(
    { scheme: 'file', language: 'hyperbricks' },
    provider,
    '=', // Trigger character
    '<', // Trigger after <
    'h' // Trigger when typing "h" for hx_ prefix
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
