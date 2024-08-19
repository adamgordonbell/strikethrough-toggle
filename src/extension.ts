import * as vscode from 'vscode';

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
            }).then(() => {
                updateStatusBar(document);
            });
        }
    });

    context.subscriptions.push(disposable);

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

export function deactivate() {}
