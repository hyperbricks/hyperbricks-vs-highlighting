import * as vscode from 'vscode';

const outputChannel = vscode.window.createOutputChannel("HyperBricks");

let globalIndentation = 0;
const INDENT_SIZE = 4;
const useTabs = false;
let lastDeclaredType: string | null = null;

function getIndentation(): string {
    return useTabs ? '\t'.repeat(globalIndentation) : ' '.repeat(globalIndentation * INDENT_SIZE);
}

function formatHTML(html: string, baseIndentation: number): string {
    
    let formattedHTML = html
        .replace(/<([a-zA-Z0-9]+)([^>]*)>/g, '<$1$2>')
        .replace(/>\s*</g, '><');

    let localIndentation = 0;
    const lines = formattedHTML.split('\n');
    const formattedLines = [];
    const startingTagOffset = getIndentation();

    for (const line of lines) {
        let trimmedLine = line.trim();
        if (trimmedLine.startsWith('</')) {
            localIndentation = Math.max(0, localIndentation - 1);
        }
        formattedLines.push(startingTagOffset + (useTabs ? '\t'.repeat(localIndentation) : ' '.repeat(localIndentation * INDENT_SIZE)) + trimmedLine);
        if (trimmedLine.startsWith('<') && !trimmedLine.endsWith('/>') && !trimmedLine.startsWith('</')) {
            localIndentation++;
        }
    }
    
    const fl =  formattedLines.join('\n');
    outputChannel.appendLine("dormatted:"+ fl)
     return fl
}

function formatCSS(css: string, baseIndentation: number): string {
    let formattedCSS = css
        .replace(/\s*\{/g, ' {')
        .replace(/\s*\}/g, ' }')
        .replace(/;\s*/g, '; ')
        .replace(/\s*:\s*/g, ': ');

    let localIndentation = 0;
    const lines = formattedCSS.split('\n');
    const formattedLines = [];
    const startingTagOffset = getIndentation();

    for (const line of lines) {
        let trimmedLine = line.trim();

        if (trimmedLine.startsWith('}')) {
            localIndentation = Math.max(0, localIndentation - 1);
        }
        formattedLines.push(startingTagOffset + (useTabs ? '\t'.repeat(localIndentation) : ' '.repeat(localIndentation * INDENT_SIZE)) + trimmedLine);
        if (trimmedLine.endsWith('{')) {
            localIndentation++;
        }
    }
    return formattedLines.join('\n');
}

export function formatConfig(input: string): string {
    globalIndentation = 0;
    const lines = input.split('\n');
    const formattedLines = [];
    let inTextBlock = false;
    let inTextBlockStart = -1;
    let postTextBlockDecrement = false;

    for (const line of lines) {
        let trimmedLine = line.trim();

        // Check for type declarations (more generic)
        if (trimmedLine.includes('<HTML>')) {
            outputChannel.appendLine("Found HTML")
            lastDeclaredType = 'HTML';
        } else if (trimmedLine.includes('<CSS>')) {
            outputChannel.appendLine("Found CSS")
            lastDeclaredType = 'CSS';
        } else if (trimmedLine.includes('<JAVASCRIPT>')) {
            outputChannel.appendLine("Found JAVASCRIPT")
            lastDeclaredType = 'JAVASCRIPT';
        }

        if (inTextBlock) {
            if (trimmedLine === ']>>') {
                inTextBlock = false;
                let formattedText = '';
                const startingTagIndentation = inTextBlockStart > -1 ? getIndentation() : "";
                if (lastDeclaredType === 'HTML') {
                    formattedText = formatHTML(lines.slice(inTextBlockStart + 1, lines.indexOf(line)).join('\n'), globalIndentation);
                } else if (lastDeclaredType === 'CSS') {
                    formattedText = formatCSS(lines.slice(inTextBlockStart + 1, lines.indexOf(line)).join('\n'), globalIndentation);
                } else {
                    formattedText = lines.slice(inTextBlockStart + 1, lines.indexOf(line)).join('\n');
                }

                const indentedLines = formattedText.split('\n');
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
