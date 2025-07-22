# Change Log

## [1.0.0] - 2024-07-22

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
