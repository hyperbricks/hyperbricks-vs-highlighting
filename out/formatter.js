"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatConfig = void 0;
const vscode = require("vscode");
let globalIndentation = 0;
const INDENT_SIZE = 4;
const useTabs = false;
let lastDeclaredType = null;
function getIndentation() {
    return useTabs ? '\t'.repeat(globalIndentation) : ' '.repeat(globalIndentation * INDENT_SIZE);
}
async function formatWithVSCode(document, languageId, baseIndentation) {
    try {
        // Create a temporary text document
        const tempDocument = await vscode.workspace.openTextDocument({
            content: document,
            language: languageId,
        });
        // Define formatting options
        const formattingOptions = {
            insertSpaces: !useTabs,
            tabSize: INDENT_SIZE,
        };
        // Get the formatting edits from VS Code
        const edits = await vscode.commands.executeCommand('vscode.executeFormatDocumentProvider', tempDocument.uri, formattingOptions);
        if (edits && edits.length > 0) {
            // Apply the edits to the text
            var wse = new vscode.WorkspaceEdit();
            wse.set(tempDocument.uri, edits);
            const success = await vscode.workspace.applyEdit(wse);
            if (success) {
                return tempDocument.getText();
            }
        }
        return document; // Return original if no edits or applyEdit fails
    }
    catch (error) {
        console.error(`Failed to format ${languageId}:`, error);
        return document; // Return original on error
    }
}
async function formatConfig(input) {
    globalIndentation = 0;
    const lines = input.split('\n');
    const formattedLines = [];
    let inTextBlock = false;
    let inTextBlockStart = -1;
    let postTextBlockDecrement = false;
    for (const line of lines) {
        let trimmedLine = line.trim();
        // Check for type declarations
        if (trimmedLine.includes('<HTML>')) {
            lastDeclaredType = 'HTML';
        }
        else if (trimmedLine.includes('<TEMPLATE>')) {
            lastDeclaredType = 'HTML';
        }
        else if (trimmedLine.includes('<FRAGMENT>')) {
            lastDeclaredType = 'HTML';
        }
        else if (trimmedLine.includes('<CSS>')) {
            lastDeclaredType = 'CSS';
        }
        else if (trimmedLine.includes('<JAVASCRIPT>')) {
            lastDeclaredType = 'JAVASCRIPT';
        }
        if (inTextBlock) {
            if (trimmedLine === ']>>') {
                inTextBlock = false;
                let formattedText = '';
                const startingTagIndentation = inTextBlockStart > -1 ? getIndentation() : "";
                if (lastDeclaredType === 'HTML') {
                    formattedText = await formatWithVSCode(lines.slice(inTextBlockStart + 1, lines.indexOf(line)).join('\n'), 'html', globalIndentation);
                }
                else if (lastDeclaredType === 'CSS') {
                    formattedText = await formatWithVSCode(lines.slice(inTextBlockStart + 1, lines.indexOf(line)).join('\n'), 'css', globalIndentation);
                }
                else if (lastDeclaredType === 'JAVASCRIPT') {
                    formattedText = await formatWithVSCode(lines.slice(inTextBlockStart + 1, lines.indexOf(line)).join('\n'), 'javascript', globalIndentation);
                }
                else {
                    formattedText = lines.slice(inTextBlockStart + 1, lines.indexOf(line)).join('\n');
                }
                const indentedLines = formattedText.split('\n').map(l => getIndentation() + l);
                formattedLines.push(...indentedLines);
                formattedLines.push(getIndentation() + trimmedLine);
                inTextBlockStart = -1;
                postTextBlockDecrement = true;
                continue;
            }
            continue;
        }
        if (/^([}\]])/.test(trimmedLine)) {
            globalIndentation = Math.max(0, globalIndentation - 1);
        }
        const formattedLine = getIndentation() + trimmedLine;
        formattedLines.push(formattedLine);
        if (/([\[{])$/.test(trimmedLine)) {
            globalIndentation++;
        }
        if (trimmedLine.endsWith('<<[')) {
            inTextBlock = true;
            inTextBlockStart = lines.indexOf(line);
        }
        if (postTextBlockDecrement) {
            globalIndentation = Math.max(0, globalIndentation - 1);
            postTextBlockDecrement = false;
        }
    }
    return formattedLines.join('\n');
}
exports.formatConfig = formatConfig;
//# sourceMappingURL=formatter.js.map