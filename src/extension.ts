import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
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
            });
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
