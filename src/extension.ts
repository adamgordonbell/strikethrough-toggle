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

    let codDisposable = vscode.commands.registerCommand('extension.chainOfDensity', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);

            if (text) {
                try {
                    const result = await chainOfDensity(text);
                    editor.edit(editBuilder => {
                        editBuilder.replace(selection, result);
                    });
                } catch (error: any) {
                    vscode.window.showErrorMessage(String(error));
                }
            } else {
                vscode.window.showWarningMessage('No text selected.');
            }
        }
    });

    context.subscriptions.push(codDisposable);

    let makeDenseDisposable = vscode.commands.registerCommand('extension.makeDense', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            const text = editor.document.getText(selection);

            if (text) {
                try {
                    const result = await chainOfDensity(text);
                    editor.edit(editBuilder => {
                        editBuilder.replace(selection, result);
                    });
                } catch (error: any) {
                    vscode.window.showErrorMessage(String(error));
                }
            } else {
                vscode.window.showWarningMessage('No text selected.');
            }
        }
    });

    context.subscriptions.push(makeDenseDisposable);

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

function chainOfDensity(text: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const wordCount = text.split(/\s+/).length;
        const systemMessage = `
You will generate increasingly concise, entity-dense summaries of the provided text.

Repeat the following 2 steps 5 times.

Step 1. Identify 1-3 informative Entities ("; " delimited) from the Article which are missing from the previously generated summary.
Step 2. Write a new, denser summary of identical length which covers every entity and detail from the previous summary plus the Missing Entities.

A Missing Entity is:
- Relevant: to the main story.
- Specific: descriptive yet concise (5 words or fewer).
- Novel: not in the previous summary.
- Faithful: present in the Article.
- Anywhere: located anywhere in the Article.

Guidelines:
- The first summary should be long (${wordCount} words) yet highly non-specific, containing little information beyond the entities marked as missing. Use overly verbose language and fillers (e.g., "this discusses") to reach ${wordCount} words.
- Make every word count: rewrite the previous summary to improve flow and make space for additional entities.
- Make space with fusion, compression, and removal of uninformative phrases like "the discusses".
- The condensed versions should become highly dense and concise yet self-contained, e.g., easily understood without the Article.
- Missing entities can appear anywhere in the new summary.
- Never drop entities from the previous summary. If space cannot be made, add fewer new entities.

Answer in JSON. The JSON should be a list (length 5) of dictionaries whose keys are "Missing_Entities" and "Denser_Summary".`;

        const fs = require('fs');
        const os = require('os');
        const path = require('path');

        const tempDir = os.tmpdir();
        const systemMessageFile = path.join(tempDir, 'system_message.txt');
        fs.writeFileSync(systemMessageFile, systemMessage);

        exec(`zsh -c 'source ~/.zshrc && echo "${text}" | llm --system "$(cat ${systemMessageFile})" - | jq -r ".[-1].Denser_Summary"'`, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${stderr}`);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

export function deactivate() {}
