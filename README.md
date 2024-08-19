# Strikethrough Toggle VS Code Extension

This extension allows you to quickly toggle strikethrough formatting on the current line in Markdown files.

## Building the Extension

1. Ensure you have Node.js installed on your system.

2. Clone this repository:
   ```
   git clone https://github.com/yourusername/strikethrough-toggle.git
   cd strikethrough-toggle
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Compile the extension:
   ```
   npm run compile
   ```

## Packaging the Extension

1. Install `vsce` (VS Code Extension Manager) globally:
   ```
   npm install -g vsce
   ```

2. Package the extension:
   ```
   vsce package
   ```
   This will create a `.vsix` file in your project directory.

## Installing the Extension

There are two ways to install the packaged extension:

### Method 1: Using VS Code's GUI

1. Open VS Code
2. Go to the Extensions view (Ctrl+Shift+X or Cmd+Shift+X on Mac)
3. Click on the '...' at the top of the Extensions view
4. Choose 'Install from VSIX...'
5. Navigate to and select the `.vsix` file you created

### Method 2: Using the Command Line

Run the following command:
```
code --install-extension strikethrough-toggle-0.0.1.vsix
```
Replace `strikethrough-toggle-0.0.1.vsix` with the actual name of your `.vsix` file if it's different.

## Adding the Keyboard Shortcut

1. Open VS Code
2. Open the Keyboard Shortcuts editor:
   - Windows/Linux: File > Preferences > Keyboard Shortcuts
   - macOS: Code > Preferences > Keyboard Shortcuts
3. Click on the '{}' icon in the top right to open the `keybindings.json` file
4. Add the following JSON to the file:
   ```json
   {
     "key": "cmd+enter",
     "command": "extension.toggleStrikethrough",
     "when": "editorTextFocus && editorLangId == 'markdown'"
   }
   ```
   Note: Use "ctrl+enter" instead of "cmd+enter" on Windows/Linux.

5. Save the file

## Usage

1. Open a Markdown file in VS Code
2. Place your cursor on a line of text
3. Press Cmd+Enter (or Ctrl+Enter on Windows/Linux)
4. The line should be wrapped in strikethrough syntax (~~) if it wasn't already, or the strikethrough should be removed if it was already present

## Troubleshooting

If the extension doesn't work as expected:
1. Ensure you've restarted VS Code after installation
2. Check that you're working in a Markdown file
3. Verify that the keyboard shortcut is correctly set in your `keybindings.json`

For any issues or feature requests, please open an issue on the GitHub repository.
