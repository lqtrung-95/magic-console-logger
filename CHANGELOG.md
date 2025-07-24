# Change Log

## [2.1.0] - 2025-07-24

### Fixed
- **Variable Detection Fix**: Fixed issue where variables (like `plainOptions` from `useState`) were incorrectly treated as functions, causing logs to be inserted at the end of components instead of right after the current line
- **Precise Function Detection**: Enhanced function detection to only treat selections as functions when the selected text exactly matches a function name, not just any variable inside a function

### Improved
- More accurate distinction between variables and functions for proper log placement

## [2.0.0] - 2025-07-24

### 🚀 Major New Features

- **Styled Console Logs**: Beautiful console output with vibrant highlighting
  - Added `%c` CSS styling with bright orange background (#ff6b35) and white text
  - Enhanced padding (4px 8px) and border-radius (4px) for better visibility
  - Bold font weight for maximum impact
  - Magic wand emoji (🪄) prefix for easy visual scanning
  - **Self-Contained Format**: Clean, single-line logs with no dependencies
    - Before: 5-line verbose console.log statements  
    - After: `console.log(\`%c🪄 variable\`, \`style...\`, variable);`
    - No helper functions or imports required!
  
- **Function Logging Support**: Smart function detection and placement
  - Automatically detects when a function is selected
  - Inserts logs after function body instead of inside for better debugging
  - Supports multiple function types:
    - Named functions (`function myFunc() {}`)
    - Arrow functions (`const myFunc = () => {}`)
    - React hooks (`useCallback`, `useMemo`, `useEffect`)
    - Object methods
  - Uses function name as log identifier

### 🛠️ Enhancements

- Enhanced AST parsing for better function detection
- **Auto-Formatter Compatibility**: Full support for Prettier and other formatters
  - Detects magic logs whether single-line or multi-line formatted
  - Delete/comment/uncomment works on Prettier-formatted logs
- Improved multi-line log statement handling in cleanup operations
- Updated all management commands to work with new styled format
- Backward compatibility with existing v1.0.0 logs

### 📝 Breaking Changes

- Console log format changed from simple string to styled format
- Function logging now places logs after function body (not inside)

## [1.0.0] - 2025-07-22

### Added

- 🪄 Insert Magic Log: Quick console.log insertion with function context detection
- 🗑️ Delete All Magic Logs: Remove all magic logs from current file
- 💬 Comment/Uncomment Magic Logs: Toggle comments on all magic logs
- Support for JavaScript, TypeScript, JSX, and TSX files
- Smart function name detection using Babel AST parsing
- Fallback regex-based function detection for edge cases
- Cross-platform keyboard shortcuts (Windows, Linux, macOS)

### Features

- `Ctrl + Alt + L`: Insert magic console.log
- `Shift + Ctrl + Alt/Cmd + D`: Delete all magic logs
- `Shift + Ctrl + Alt/Cmd + C`: Comment all magic logs
- `Shift + Ctrl + Alt/Cmd + U`: Uncomment all magic logs
- Context-aware logging with function names
- Automatic indentation matching
- Magic emoji (🪄) for easy identification
