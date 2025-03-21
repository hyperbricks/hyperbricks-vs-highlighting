import * as vscode from 'vscode';
import * as prettier from 'prettier';

// --- Version 11.0 (Formatter - Prettier) ---

const outputChannel = vscode.window.createOutputChannel("HyperBricks");

let globalIndentation = 0;
const INDENT_SIZE = 4;
const useTabs = false;
let lastDeclaredType: string | null = null;

function getIndentation(): string {
    return useTabs ? '\t'.repeat(globalIndentation) : ' '.repeat(globalIndentation * INDENT_SIZE);
}

async function formatWithPrettier(
    block: string,
    languageId: string
): Promise<string> {
    try {
        outputChannel.appendLine(`Formatting ${languageId} with Prettier`);

        let parser: prettier.BuiltInParserName | undefined = undefined;
        switch (languageId) {
            case 'javascript':
                parser = 'babel'; // Use 'babel' for JavaScript, handles modern syntax
                break;
            case 'typescript':
                parser = 'typescript';
                break;
            case 'html':
                parser = 'html';
                break;
            case 'css':
                parser = 'css';
                break;
            case 'json':
                parser = 'json';
                break;
            case 'jsonc': // JSON with comments
                parser = 'json5'; // Use json5 parser for jsonc
                break;
            case 'scss':
                parser = 'scss'; // Explicitly specify SCSS
                break;
            case 'less':
                parser = 'less';  // Explicitly specify LESS
                break;

            // Add other language mappings as needed
            default:
                outputChannel.appendLine(`Unsupported language: ${languageId}. Returning original content.`);
                return block; // Return original if unsupported
        }

        if (!parser) {
            outputChannel.appendLine(`No parser found for ${languageId}. Returning original content.`);
            return block;
        }

        const options: prettier.Options = {
            parser: parser,  // *Crucially*, set the parser
            tabWidth: INDENT_SIZE,
            useTabs: useTabs,
            semi: true,        // Add semicolons
            singleQuote: true,  // Use single quotes
            trailingComma: 'all', // Add trailing commas
            printWidth: 180,     // Wider print width
            // ... other Prettier options ...
        };

        const formattedText = await prettier.format(block, options);
        return formattedText;

    } catch (error) {
        outputChannel.appendLine(`Prettier formatting error (${languageId}): ${error}`);
        console.error(`Failed to format ${languageId} with Prettier:`, error);
        return block; // Return original on error
    }
}
// --- Main Formatting Logic (formatConfig) ---
export async function formatConfig(input: string): Promise<string> {
    globalIndentation = 0;
    const lines = input.split('\n');
    const formattedLines = [];
    let inTextBlock = false;
    let inTextBlockStart = -1;

    for (const [index, line] of lines.entries()) {
        let trimmedLine = line.trim();

        // Detect language declarations
        if (trimmedLine.includes('<HTML>') || trimmedLine.includes('<TEMPLATE>') || trimmedLine.includes('<FRAGMENT>')) {
            lastDeclaredType = 'HTML';
        } else if (trimmedLine.includes('<CSS>')) {
            lastDeclaredType = 'CSS';
        } else if (trimmedLine.includes('<JAVASCRIPT>')) {
            lastDeclaredType = 'JAVASCRIPT';
        }

        // Handle text blocks
        if (inTextBlock) {
            if (trimmedLine === ']>>') {
                inTextBlock = false;
                const startingTagIndentation = inTextBlockStart > -1 ? getIndentation() : "";

                const textBlockLines = lines.slice(inTextBlockStart + 1, index);
                const textBlockContent = textBlockLines.join('\n');

                let formattedText = '';
                if (lastDeclaredType) {
                    const lowerCaseLanguageId = lastDeclaredType.toLowerCase();
					// Now with prettier
                    formattedText = await formatWithPrettier(textBlockContent, lowerCaseLanguageId);
                } else {
                    formattedText = textBlockContent;
                }

                const formattedLinesArr = formattedText.split('\n');
                const indentedLines = formattedLinesArr.map(line => startingTagIndentation + line);

                formattedLines.push(...indentedLines);
                formattedLines.push(getIndentation() + trimmedLine);
                inTextBlockStart = -1;
                globalIndentation = Math.max(0, globalIndentation - 1); // Decrement *after* block
                continue;
            }
            continue;
        }

        // Handle indentation outside text blocks
        if (/^([}\]])/.test(trimmedLine)) {
            globalIndentation = Math.max(0, globalIndentation - 1);
        }

        const formattedLine = getIndentation() + trimmedLine;
        formattedLines.push(formattedLine);

        if (/([\[{])$/.test(trimmedLine)) {
            globalIndentation++;
        }

        // Detect start of text block
        if (trimmedLine.endsWith('<<[')) {
            inTextBlock = true;
            inTextBlockStart = index;
        }
    }
    const result = formattedLines.join('\n');
    vscode.window.showInformationMessage("Formatting done!");
    return result;
}