# Magic Console Logger

A VSCode extension that helps developers quickly add, manage, and clean up `console.log` statements for debugging. It provides shortcut-based utilities to insert beautifully styled logs with function detection, comment/uncomment them, and clean them up—all with awareness of function context.

## ✨ What's New in v2.0.0

- **🎨 Styled Console Logs**: Beautiful console output with vibrant orange highlighting
- **🎯 Function Logging Support**: Smart detection of functions with placement after function body
- **⚛️ React Hooks Support**: Special handling for `useCallback`, `useMemo`, `useEffect`

## Features

- **🪄 Insert Magic Log**: Quickly insert context-aware console.log statements with beautiful styling
- **🎯 Function Detection**: Automatically detects functions and places logs after function body
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

#### Variable Logging
1. Select a variable in your code
2. Press `Ctrl + Alt + L`
3. A styled console.log statement will be inserted on the next line

#### Function Logging (New in v2.0.0)
1. Select a function (name or entire function)
2. Press `Ctrl + Alt + L`
3. A console.log statement will be inserted **after** the function body

### Manage Magic Logs

- **Delete All**: Press `Shift + Ctrl + Alt + D` (Win/Linux) or `Shift + Ctrl + Cmd + D` (Mac) to remove all magic logs from the current file
- **Comment All**: Press `Shift + Ctrl + Alt + C` (Win/Linux) or `Shift + Ctrl + Cmd + C` (Mac) to comment out all magic logs
- **Uncomment All**: Press `Shift + Ctrl + Alt + U` (Win/Linux) or `Shift + Ctrl + Cmd + U` (Mac) to uncomment all magic logs

## Examples

### Styled Console Output (v2.0.0)

All magic logs now use a clean, self-contained single-line format:

```javascript
// Generated log format (clean and self-contained):
console.log(`%c🪄 variableName`, `background: #ff6b35; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold`, variableName);
```

**No Setup Required**: The logs are completely self-contained - no helper functions or imports needed!

**Auto-Formatter Compatible**: Works perfectly with Prettier, ESLint, and other code formatters that may split logs across multiple lines.

### Variable Logging with Function Context

```javascript
function calculateTotal(price, tax) {
  // Select 'price' and press Ctrl + Alt + L
  console.log(`%c🪄 [calculateTotal] price`, `background: #ff6b35; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold`, price);
  return price + tax;
}
```

### Function Logging (New in v2.0.0)

```javascript
// Select the entire function or function name and press Ctrl + Alt + L
const processData = (data) => {
  return data.map((item) => item.value);
};
console.log(`%c🪄 processData`, `background: #ff6b35; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold`, processData);
```

### React Hooks Support (New in v2.0.0)

```javascript
// Select the hook and press Ctrl + Alt + L
const handleClick = useCallback((event) => {
  event.preventDefault();
  doSomething();
}, [doSomething]);
console.log(`%c🪄 handleClick`, `background: #ff6b35; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold`, handleClick);

const memoizedValue = useMemo(() => {
  return computeExpensiveValue();
}, [dependency]);
console.log(`%c🪄 memoizedValue`, `background: #ff6b35; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold`, memoizedValue);
```

### Global Scope

```javascript
const globalVar = "hello";
// Select 'globalVar' and press Ctrl + Alt + L
console.log(`%c🪄 globalVar`, `background: #ff6b35; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold`, globalVar);
```

### Auto-Formatter Support

The extension works seamlessly with Prettier and other formatters:

```javascript
// Extension generates single-line format:
console.log(`%c🪄 data`, `background: #ff6b35; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold`, data);

// Prettier automatically formats to multi-line:
console.log(
  `%c🪄 data`,
  `background: #ff6b35; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold`,
  data,
);

// Both formats work perfectly with delete/comment/uncomment commands! ✨
```

## Supported Function Types

The extension intelligently detects and handles:

- **Function Declarations**: `function myFunc() {}`
- **Arrow Functions**: `const myFunc = () => {}`
- **Function Expressions**: `const myFunc = function() {}`
- **Object Methods**: `{ method: function() {} }` or `{ method() {} }`
- **React Hooks**: `useCallback`, `useMemo`, `useEffect`, `useLayoutEffect`
- **Async Functions**: `async function() {}` or `const asyncFunc = async () => {}`

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
