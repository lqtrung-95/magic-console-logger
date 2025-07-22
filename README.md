# Magic Console Logger

A VSCode extension that helps developers quickly add, manage, and clean up `console.log` statements for debugging. It provides shortcut-based utilities to insert formatted logs, comment/uncomment them, and clean them up—all with awareness of function context.

## Features

- **🪄 Insert Magic Log**: Quickly insert context-aware console.log statements
- **🗑️ Delete All Magic Logs**: Remove all magic logs from your file
- **💬 Comment/Uncomment Magic Logs**: Toggle comments on all magic logs

## Keyboard Shortcuts

| Shortcut                             | Action                     |
| ------------------------------------ | -------------------------- |
| `Ctrl + Alt + L`                     | Insert magic `console.log` |
| `Shift + Ctrl + Alt + D` (Win/Linux) | Delete all magic logs      |
| `Shift + Ctrl + Cmd + D` (Mac)       |                            |
| `Shift + Ctrl + Alt + C` (Win/Linux) | Comment all magic logs     |
| `Shift + Ctrl + Cmd + C` (Mac)       |                            |
| `Shift + Ctrl + Alt + U` (Win/Linux) | Uncomment all magic logs   |
| `Shift + Ctrl + Cmd + U` (Mac)       |                            |

## How to Use

### Insert Magic Log

1. Select a variable in your code
2. Press `Ctrl + Alt + L`
3. A console.log statement will be inserted on the next line with the format:
   - Inside a function: `console.log("🪄 [FunctionName] -> variableName", variableName);`
   - Outside a function: `console.log("🪄 variableName", variableName);`

### Manage Magic Logs

- **Delete All**: Press `Shift + Ctrl + Alt + D` (Win/Linux) or `Shift + Ctrl + Cmd + D` (Mac) to remove all magic logs from the current file
- **Comment All**: Press `Shift + Ctrl + Alt + C` (Win/Linux) or `Shift + Ctrl + Cmd + C` (Mac) to comment out all magic logs
- **Uncomment All**: Press `Shift + Ctrl + Alt + U` (Win/Linux) or `Shift + Ctrl + Cmd + U` (Mac) to uncomment all magic logs

## Examples

### Function Context Detection

```javascript
function calculateTotal(price, tax) {
  // Select 'price' and press Ctrl + Alt + L
  console.log("🪄 [calculateTotal] -> price", price);
  return price + tax;
}

const processData = (data) => {
  // Select 'data' and press Ctrl + Alt + L
  console.log("🪄 [processData] -> data", data);
  return data.map((item) => item.value);
};
```

### Global Scope

```javascript
const globalVar = "hello";
// Select 'globalVar' and press Ctrl + Alt + L
console.log("🪄 globalVar", globalVar);
```

## Supported Languages

- JavaScript
- TypeScript
- JSX/TSX (React)

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press `F5` to open a new VSCode window with the extension loaded

## Development

To develop this extension:

1. Install dependencies: `npm install`
2. Compile TypeScript: `npm run compile`
3. Watch for changes: `npm run watch`
4. Press `F5` to test the extension in a new VSCode window

## Requirements

- VSCode 1.74.0 or higher

## License

MIT
