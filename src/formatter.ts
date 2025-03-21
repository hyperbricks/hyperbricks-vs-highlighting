import * as vscode from 'vscode';
import * as prettier from 'prettier';


const outputChannel = vscode.window.createOutputChannel("HyperBricks");

let globalIndentation = 0;
const INDENT_SIZE = 4;
const useTabs = false;
let lastDeclaredType: string | null = null;

function getIndentation(): string {
    return useTabs ? '\t'.repeat(globalIndentation) : ' '.repeat(globalIndentation * INDENT_SIZE);
}

async function formatWithVSCode(
    block: string,
    languageId: string,
    baseIndentation: number
): Promise<string> {
    try {
        
        let options: prettier.Options = {
            "semi": true,
            "singleQuote": true,
            "trailingComma": "all",
            "printWidth": 180,
            "tabWidth": 2
            
        }
        switch (languageId) {
            case 'javascript':
            case 'typescript':
            case 'javascriptreact':
            case 'typescriptreact':
              options.parser = 'typescript'; // or 'babel', 'babel-ts'
              break;
            case 'json':
            case 'jsonc':
              options.parser = 'json';
              break;
            case 'css':
            case 'scss':
            case 'less':
              options.parser = 'css';
              break;
            case 'html':
              options.parser = 'html';
              break;
            // Add more language mappings as needed
            default:
              // Attempt to infer the parser from the file extension
              break;
          }
        
        const formattedText = await prettier.format(block, options);
        return formattedText

    } catch (error) {
       
        outputChannel.appendLine(`Failed to format ${languageId}: `+ error);

        return block; // Return original on error
    }
}

export async function formatConfig(input: string): Promise<string> {
    globalIndentation = 0;
    const lines = input.split('\n');
    const formattedLines = [];
    let inTextBlock = false;
    let inTextBlockStart = -1;

    for (const [index, line] of lines.entries()) {
        let trimmedLine = line.trim();

        if (trimmedLine.includes('<HTML>')) {
            lastDeclaredType = 'HTML';
        } else if (trimmedLine.includes('<TEMPLATE>')) {
            lastDeclaredType = 'HTML';
        } else if (trimmedLine.includes('<FRAGMENT>')) {
            lastDeclaredType = 'HTML';
        } else if (trimmedLine.includes('<CSS>')) {
            lastDeclaredType = 'CSS';
        } else if (trimmedLine.includes('<JAVASCRIPT>')) {
            lastDeclaredType = 'JAVASCRIPT';
        }

        if (inTextBlock) {
            if (trimmedLine === ']>>') {
                inTextBlock = false;
                const startingTagIndentation = inTextBlockStart > -1 ? getIndentation() : "";

                const textBlockLines = lines.slice(inTextBlockStart + 1, index);
                const textBlockContent = textBlockLines.join('\n');

                let formattedText = '';
                if (lastDeclaredType) {
                    formattedText = await formatWithVSCode(textBlockContent, lastDeclaredType.toLowerCase(), globalIndentation);
                } else {
                    formattedText = textBlockContent;
                }

                const formattedLinesArr = formattedText.split('\n');
                const indentedLines = formattedLinesArr.map(line => startingTagIndentation + line); // Much simpler indentation

                formattedLines.push(...indentedLines);
                formattedLines.push(getIndentation() + trimmedLine);
                inTextBlockStart = -1;

                // Correct Post Text Block Decrementation
                globalIndentation = Math.max(0, globalIndentation - 1);
                continue; // Very important:  Skip to the next line *after* processing the block.
            }
            continue; // Skip lines *inside* the text block.
        }


        if (/^([}\]])/.test(trimmedLine)) {
            globalIndentation = Math.max(0, globalIndentation - 1);
        }

        // Add line (before opening bracket)
        const formattedLine = getIndentation() + trimmedLine;
        formattedLines.push(formattedLine);

        if (/([\[{])$/.test(trimmedLine)) {
            globalIndentation++;
        }

        if (trimmedLine.endsWith('<<[')) {
            inTextBlock = true;
            inTextBlockStart = index;
            // Indentation will be applied inside text block processing
        }
    }

    const result = formattedLines.join('\n');
    return result;
}