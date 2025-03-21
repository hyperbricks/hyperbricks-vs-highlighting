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
        // Create a temporary document.  No need to reuse; VS Code handles this efficiently.
        const tempDocument = await vscode.workspace.openTextDocument({
            content: document,
            language: languageId,
        });
        const formattingOptions = {
            insertSpaces: !useTabs,
            tabSize: INDENT_SIZE,
        };
        const edits = await vscode.commands.executeCommand('vscode.executeFormatDocumentProvider', tempDocument.uri, formattingOptions);
        if (!edits || edits.length === 0) {
            return document; // Return original if no edits
        }
        // Use applyEdit (workspace edit), which is much safer and easier.
        const edit = new vscode.WorkspaceEdit();
        edits.forEach(e => edit.replace(tempDocument.uri, e.range, e.newText));
        await vscode.workspace.applyEdit(edit);
        // Return the updated document
        vscode.window.showTextDocument(tempDocument.uri, { preview: false, preserveFocus: true })
            .then(() => {
            outputChannel.appendLine("Closing " + tempDocument.uri);
            return vscode.commands.executeCommand('workbench.action.closeActiveEditor');
        });
        return tempDocument.getText();
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
    for (const [index, line] of lines.entries()) {
        let trimmedLine = line.trim();
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
                const startingTagIndentation = inTextBlockStart > -1 ? getIndentation() : "";
                const textBlockLines = lines.slice(inTextBlockStart + 1, index);
                const textBlockContent = textBlockLines.join('\n');
                let formattedText = '';
                if (lastDeclaredType) {
                    formattedText = await formatWithVSCode(textBlockContent, lastDeclaredType.toLowerCase(), globalIndentation);
                }
                else {
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
exports.formatConfig = formatConfig;
//# sourceMappingURL=formatter.js.map