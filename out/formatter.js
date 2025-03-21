"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatConfig = void 0;
const vscode = require("vscode");
const outputChannel = vscode.window.createOutputChannel("HyperBricks");
let globalIndentation = 0;
const INDENT_SIZE = 4;
const useTabs = false;
let lastDeclaredType = null;
function getIndentation() {
    return useTabs ? '\t'.repeat(globalIndentation) : ' '.repeat(globalIndentation * INDENT_SIZE);
}
async function formatWithVSCode(document, languageId, baseIndentation) {
    try {
        outputChannel.appendLine(`formatWithVSCode: Formatting ${languageId} with baseIndentation ${baseIndentation}`);
        // Create a temporary document.  No need to reuse; VS Code handles this efficiently.
        const tempDocument = await vscode.workspace.openTextDocument({
            content: document,
            language: languageId,
        });
        outputChannel.appendLine(`formatWithVSCode: tempDocument URI: ${tempDocument.uri.toString()}`);
        const formattingOptions = {
            insertSpaces: !useTabs,
            tabSize: INDENT_SIZE,
        };
        outputChannel.appendLine(`formatWithVSCode: Formatting options: ${JSON.stringify(formattingOptions)}`);
        const edits = await vscode.commands.executeCommand('vscode.executeFormatDocumentProvider', tempDocument.uri, formattingOptions);
        if (!edits || edits.length === 0) {
            outputChannel.appendLine(`formatWithVSCode: No edits, returning original document`);
            return document; // Return original if no edits
        }
        outputChannel.appendLine(`formatWithVSCode: Received ${edits.length} edits`);
        // Use applyEdit (workspace edit), which is much safer and easier.
        const edit = new vscode.WorkspaceEdit();
        edits.forEach(e => edit.replace(tempDocument.uri, e.range, e.newText));
        await vscode.workspace.applyEdit(edit);
        // Return the updated document
        return tempDocument.getText();
    }
    catch (error) {
        outputChannel.appendLine(`formatWithVSCode: Error: ${error}. Returning original document.`);
        console.error(`Failed to format ${languageId}:`, error);
        return document; // Return original on error
    }
}
async function formatConfig(input) {
    outputChannel.appendLine("formatter version: 2.7");
    globalIndentation = 0;
    const lines = input.split('\n');
    const formattedLines = [];
    let inTextBlock = false;
    let inTextBlockStart = -1;
    outputChannel.appendLine(`formatConfig: Input lines: ${lines.length}`);
    for (const [index, line] of lines.entries()) {
        let trimmedLine = line.trim();
        outputChannel.appendLine(`formatConfig: Processing line ${index + 1}: "${line}", trimmed: "${trimmedLine}", inTextBlock: ${inTextBlock}, globalIndentation: ${globalIndentation}`);
        if (trimmedLine.includes('<HTML>')) {
            lastDeclaredType = 'HTML';
            outputChannel.appendLine(`formatConfig: Detected HTML declaration, lastDeclaredType = HTML`);
        }
        else if (trimmedLine.includes('<TEMPLATE>')) {
            lastDeclaredType = 'HTML';
            outputChannel.appendLine(`formatConfig: Detected TEMPLATE declaration, lastDeclaredType = HTML`);
        }
        else if (trimmedLine.includes('<FRAGMENT>')) {
            lastDeclaredType = 'HTML';
            outputChannel.appendLine(`formatConfig: Detected FRAGMENT declaration, lastDeclaredType = HTML`);
        }
        else if (trimmedLine.includes('<CSS>')) {
            lastDeclaredType = 'CSS';
            outputChannel.appendLine(`formatConfig: Detected CSS declaration, lastDeclaredType = CSS`);
        }
        else if (trimmedLine.includes('<JAVASCRIPT>')) {
            lastDeclaredType = 'JAVASCRIPT';
            outputChannel.appendLine(`formatConfig: Detected JAVASCRIPT declaration, lastDeclaredType = JAVASCRIPT`);
        }
        if (inTextBlock) {
            if (trimmedLine === ']>>') {
                inTextBlock = false;
                outputChannel.appendLine(`formatConfig: End of text block at line ${index + 1}`);
                const startingTagIndentation = inTextBlockStart > -1 ? getIndentation() : "";
                outputChannel.appendLine(`formatConfig: startingTagIndentation: "${startingTagIndentation}"`);
                const textBlockLines = lines.slice(inTextBlockStart + 1, index);
                const textBlockContent = textBlockLines.join('\n');
                outputChannel.appendLine(`formatConfig: Extracted textBlockContent (length: ${textBlockContent.length}):\n${textBlockContent.substring(0, 100)}...`);
                let formattedText = '';
                if (lastDeclaredType) {
                    formattedText = await formatWithVSCode(textBlockContent, lastDeclaredType.toLowerCase(), globalIndentation);
                    outputChannel.appendLine(`formatConfig: Formatted with VSCode using language ${lastDeclaredType}`);
                }
                else {
                    formattedText = textBlockContent;
                    outputChannel.appendLine(`formatConfig: lastDeclaredType is null/unknown, using original textBlockContent`);
                }
                const formattedLinesArr = formattedText.split('\n');
                const indentedLines = formattedLinesArr.map(line => startingTagIndentation + line); // Much simpler indentation
                formattedLines.push(...indentedLines);
                formattedLines.push(getIndentation() + trimmedLine);
                outputChannel.appendLine(`formatConfig: Added indented lines to formattedLines, inTextBlockStart reset`);
                inTextBlockStart = -1;
                // Correct Post Text Block Decrementation
                globalIndentation = Math.max(0, globalIndentation - 1);
                continue; // Very important:  Skip to the next line *after* processing the block.
            }
            continue; // Skip lines *inside* the text block.
        }
        if (/^([}\]])/.test(trimmedLine)) {
            globalIndentation = Math.max(0, globalIndentation - 1);
            outputChannel.appendLine(`formatConfig: Decrementing indentation, globalIndentation = ${globalIndentation}`);
        }
        // Add line (before opening bracket)
        const formattedLine = getIndentation() + trimmedLine;
        formattedLines.push(formattedLine);
        outputChannel.appendLine(`formatConfig: Added formattedLine: "${formattedLine}"`);
        if (/([\[{])$/.test(trimmedLine)) {
            globalIndentation++;
            outputChannel.appendLine(`formatConfig: Incrementing indentation, globalIndentation = ${globalIndentation}`);
        }
        if (trimmedLine.endsWith('<<[')) {
            inTextBlock = true;
            inTextBlockStart = index;
            // Indentation will be applied inside text block processing
            outputChannel.appendLine(`formatConfig: Start of text block at line ${index + 1}, inTextBlockStart = ${inTextBlockStart}`);
        }
    }
    const result = formattedLines.join('\n');
    outputChannel.appendLine(`formatConfig: Returning formatted output (length: ${result.length}):\n${result.substring(0, 100)}...`);
    return result;
}
exports.formatConfig = formatConfig;
//# sourceMappingURL=formatter.js.map