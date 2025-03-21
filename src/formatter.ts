import * as vscode from 'vscode';

let globalIndentation = 0;
const INDENT_SIZE = 4;

function getIndentation(): string {
    return ' '.repeat(globalIndentation * INDENT_SIZE);
}

function formatHTML(html: string): string {
    let formattedHTML = html
        .replace(/<([a-zA-Z0-9]+)([^>]*)>/g, '<$1$2>')
        .replace(/>\s*</g, '><');

    let localIndentation = 0;
    const lines = formattedHTML.split('\n');
    const formattedLines = [];

    for (const line of lines) {
        let trimmedLine = line.trim();
        if (trimmedLine.startsWith('</')) {
            localIndentation = Math.max(0, localIndentation - 1);
        }
        formattedLines.push(getIndentation() + ' '.repeat(localIndentation * INDENT_SIZE) + trimmedLine);
        if (trimmedLine.startsWith('<') && !trimmedLine.endsWith('/>') && !trimmedLine.startsWith('</')) {
            localIndentation++;
        }
    }
    return formattedLines.join('\n');
}

function formatCSS(css: string): string {
    let formattedCSS = css
        .replace(/\s*\{/g, ' {')
        .replace(/\s*\}/g, ' }')
        .replace(/;\s*/g, '; ')
        .replace(/\s*:\s*/g, ': ');

    let localIndentation = 0;
    const lines = formattedCSS.split('\n');
    const formattedLines = [];

    for (const line of lines) {
        let trimmedLine = line.trim();

        if (trimmedLine.startsWith('}')) {
            localIndentation = Math.max(0, localIndentation - 1);
        }
        formattedLines.push(getIndentation() + ' '.repeat(localIndentation * INDENT_SIZE) + trimmedLine);
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
    let textType = '';
    let inTextBlockStart = -1;
    let postTextBlockDecrement = false; // Add this flag

    for (const line of lines) {
        let trimmedLine = line.trim();

        if (inTextBlock) {
            if (trimmedLine === ']>>') {
                inTextBlock = false;
                let formattedText = '';
                if (textType === 'HTML') {
                    formattedText = formatHTML(lines.slice(inTextBlockStart + 1, lines.indexOf(line)).join('\n'));
                } else if (textType === 'CSS') {
                    formattedText = formatCSS(lines.slice(inTextBlockStart + 1, lines.indexOf(line)).join('\n'));
                } else {
                    formattedText = lines.slice(inTextBlockStart + 1, lines.indexOf(line)).join('\n');
                }

                const indentedLines = formattedText.split('\n');
                formattedLines.push(...indentedLines);
                formattedLines.push(getIndentation() + trimmedLine);
                inTextBlockStart = -1;
                postTextBlockDecrement = true; // Set the flag
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
            const typeMatch = trimmedLine.match(/<([A-Z_]+)>/);
            textType = typeMatch ? typeMatch[1] : '';
        }
        if (postTextBlockDecrement) { // Check the flag
            globalIndentation = Math.max(0, globalIndentation - 1); // Decrement
            postTextBlockDecrement = false;             // Reset
        }
    }
    return formattedLines.join('\n');
}
