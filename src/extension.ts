import * as vscode from 'vscode';
import { exec } from 'child_process';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    context.subscriptions.push(statusBarItem);

    let disposable = vscode.commands.registerCommand('extension.toggleStrikethrough', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            const line = document.lineAt(selection.active.line);

            if (isHeading(line.text)) {
                toggleStrikethroughBelowHeading(editor, line.lineNumber);
            } else {
                toggleStrikethroughLine(editor, line);
            }

            updateStatusBar(document);
        }
    });

    context.subscriptions.push(disposable);

    let codDisposable = vscode.commands.registerCommand('extension.chainOfDensity', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);

            if (text) {
                exec(`./util/functions chain_of_density "${text}"`, (error, stdout, stderr) => {
                    if (error) {
                        vscode.window.showErrorMessage(`Error: ${stderr}`);
                        return;
                    }
                    const result = stdout.trim();
                    editor.edit(editBuilder => {
                        editBuilder.replace(selection, result);
                    });
                });
            } else {
                vscode.window.showWarningMessage('No text selected.');
            }
        }
    });

    context.subscriptions.push(codDisposable);

    // Update status bar when the active editor changes
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateStatusBar(editor.document);
        }
    });

    // Update status bar when the document changes
    vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document === vscode.window.activeTextEditor?.document) {
            updateStatusBar(event.document);
        }
    });

    // Initial update of the status bar
    if (vscode.window.activeTextEditor) {
        updateStatusBar(vscode.window.activeTextEditor.document);
    }
}

function isHeading(text: string): boolean {
    return /^#{1,6}\s/.test(text.trim());
}

function toggleStrikethroughLine(editor: vscode.TextEditor, line: vscode.TextLine) {
    editor.edit(editBuilder => {
        if (line.text.trim().startsWith('~~') && line.text.trim().endsWith('~~')) {
            // Remove strikethrough
            const newText = line.text.replace(/^(\s*)~~(.*)~~(\s*)$/, '$1$2$3');
            editBuilder.replace(line.range, newText);
        } else {
            // Add strikethrough
            const newText = line.text.replace(/^(\s*)(.*)(\s*)$/, '$1~~$2~~$3');
            editBuilder.replace(line.range, newText);
        }
    });
}

function toggleStrikethroughBelowHeading(editor: vscode.TextEditor, startLineNumber: number) {
    const document = editor.document;
    let endLineNumber = document.lineCount - 1;

    // Find the next heading or end of document
    for (let i = startLineNumber + 1; i < document.lineCount; i++) {
        if (isHeading(document.lineAt(i).text)) {
            endLineNumber = i - 1;
            break;
        }
    }

    editor.edit(editBuilder => {
        for (let i = startLineNumber + 1; i <= endLineNumber; i++) {
            const line = document.lineAt(i);
            if (line.text.trim() !== '') {
                if (line.text.trim().startsWith('~~') && line.text.trim().endsWith('~~')) {
                    // Remove strikethrough
                    const newText = line.text.replace(/^(\s*)~~(.*)~~(\s*)$/, '$1$2$3');
                    editBuilder.replace(line.range, newText);
                } else {
                    // Add strikethrough
                    const newText = line.text.replace(/^(\s*)(.*)(\s*)$/, '$1~~$2~~$3');
                    editBuilder.replace(line.range, newText);
                }
            }
        }
    });
}

function updateStatusBar(document: vscode.TextDocument) {
    if (document.languageId !== 'markdown') {
        statusBarItem.hide();
        return;
    }

    const text = document.getText();
    const totalChars = text.length;
    const strikethroughMatches = text.match(/~~[^~\n]+~~/g);
    const strikethroughChars = strikethroughMatches
        ? strikethroughMatches.reduce((sum, match) => sum + match.length - 4, 0)
        : 0;
    const percentage = totalChars > 0 ? (strikethroughChars / totalChars) * 100 : 0;

    statusBarItem.text = `Strikethrough: ${percentage.toFixed(1)}%`;
    statusBarItem.show();
}

function chainOfDensity(text: string): string {
    // Implement the logic of the chain_of_density function here
    // For now, let's just return the text for demonstration
    return `Processed: ${text}`;
}

export function deactivate() {}
