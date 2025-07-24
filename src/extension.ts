import * as vscode from "vscode";
import { parse } from "@babel/parser";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

export function activate(context: vscode.ExtensionContext) {
  // Register all commands
  const insertLogCommand = vscode.commands.registerCommand(
    "magicConsoleLogger.insertLog",
    insertLog
  );
  const deleteAllLogsCommand = vscode.commands.registerCommand(
    "magicConsoleLogger.deleteAllLogs",
    deleteAllLogs
  );
  const commentAllLogsCommand = vscode.commands.registerCommand(
    "magicConsoleLogger.commentAllLogs",
    commentAllLogs
  );
  const uncommentAllLogsCommand = vscode.commands.registerCommand(
    "magicConsoleLogger.uncommentAllLogs",
    uncommentAllLogs
  );

  context.subscriptions.push(
    insertLogCommand,
    deleteAllLogsCommand,
    commentAllLogsCommand,
    uncommentAllLogsCommand
  );
}

function insertLog() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);

  if (!selectedText.trim()) {
    vscode.window.showInformationMessage("Please select a variable to log");
    return;
  }

  // Check if selection is a function
  const functionInfo = getFunctionInfo(editor, selection);
  
  if (functionInfo) {
    // Insert log after function body
    insertFunctionLog(editor, functionInfo, selectedText);
  } else {
    // Insert regular variable log
    insertVariableLog(editor, selection, selectedText);
  }
}

function insertVariableLog(editor: vscode.TextEditor, selection: vscode.Selection, selectedText: string) {
  // Get function name context
  const functionName = getFunctionName(editor, selection.start);

  // Create the self-contained shortened log statement
  const logLabel = functionName
    ? `[${functionName}] ${selectedText}`
    : selectedText;

  const logStatement = `console.log(\`%c🪄 ${logLabel}\`, \`background: #ff6b35; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold\`, ${selectedText});`;

  // Insert the log statement on the next line
  const currentLine = selection.end.line;
  const nextLinePosition = new vscode.Position(currentLine + 1, 0);
  const indent = getIndentation(editor, currentLine);

  editor.edit((editBuilder: vscode.TextEditorEdit) => {
    editBuilder.insert(nextLinePosition, `${indent}${logStatement}\n`);
  });
}

function insertFunctionLog(editor: vscode.TextEditor, functionInfo: FunctionInfo, selectedText: string) {
  const logStatement = `console.log(\`%c🪄 ${functionInfo.name || selectedText}\`, \`background: #ff6b35; color: #fff; padding: 4px 8px; border-radius: 4px; font-weight: bold\`, ${functionInfo.name || selectedText});`;

  // Insert after the function body
  const insertPosition = new vscode.Position(functionInfo.endLine + 1, 0);
  const indent = getIndentation(editor, functionInfo.endLine);

  editor.edit((editBuilder: vscode.TextEditorEdit) => {
    editBuilder.insert(insertPosition, `${indent}${logStatement}\n`);
  });
}

interface FunctionInfo {
  name?: string;
  startLine: number;
  endLine: number;
  type: 'function' | 'arrow' | 'method' | 'hook';
}

function getFunctionInfo(editor: vscode.TextEditor, selection: vscode.Selection): FunctionInfo | null {
  try {
    const document = editor.document;
    const text = document.getText();
    const selectedText = document.getText(selection);

    // Parse the code using Babel
    const ast = parse(text, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    let functionInfo: FunctionInfo | null = null;
    const selectionStart = selection.start.line + 1; // Babel uses 1-based line numbers
    const selectionEnd = selection.end.line + 1;

    traverse(ast, {
      Function(path: NodePath<t.Function>) {
        const node = path.node;
        if (
          node.loc &&
          node.loc.start.line <= selectionStart &&
          node.loc.end.line >= selectionEnd
        ) {
          let name: string | undefined;
          let type: FunctionInfo['type'] = 'function';

          if (t.isFunctionDeclaration(node) && node.id) {
            name = node.id.name;
            type = 'function';
          } else if (t.isArrowFunctionExpression(node) || t.isFunctionExpression(node)) {
            const parent = path.parent;
            if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
              name = parent.id.name;
              type = 'arrow';
              
              // Check for React hooks
              if (name.startsWith('use') || 
                  selectedText.includes('useCallback') || 
                  selectedText.includes('useMemo') || 
                  selectedText.includes('useEffect')) {
                type = 'hook';
              }
            } else if (t.isObjectMethod(parent) && t.isIdentifier(parent.key)) {
              name = parent.key.name;
              type = 'method';
            } else if (t.isProperty(parent) && t.isIdentifier(parent.key)) {
              name = parent.key.name;
              type = 'method';
            }
          } else if (t.isObjectMethod(node) && t.isIdentifier(node.key)) {
            name = node.key.name;
            type = 'method';
          }

          functionInfo = {
            name,
            startLine: node.loc.start.line - 1, // Convert back to 0-based
            endLine: node.loc.end.line - 1,
            type
          };
        }
      },
      
      // Handle CallExpression for hooks like useCallback, useMemo, useEffect
      CallExpression(path: NodePath<t.CallExpression>) {
        const node = path.node;
        if (
          node.loc &&
          node.loc.start.line <= selectionStart &&
          node.loc.end.line >= selectionEnd &&
          t.isIdentifier(node.callee)
        ) {
          const hookNames = ['useCallback', 'useMemo', 'useEffect', 'useLayoutEffect'];
          if (hookNames.includes(node.callee.name)) {
            const parent = path.parent;
            let name: string | undefined;
            
            if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
              name = parent.id.name;
            }

            functionInfo = {
              name: name || node.callee.name,
              startLine: node.loc.start.line - 1,
              endLine: node.loc.end.line - 1,
              type: 'hook'
            };
          }
        }
      }
    });

    return functionInfo;
  } catch (error) {
    // Fallback to regex-based detection
    return getFunctionInfoFallback(editor, selection);
  }
}

function getFunctionInfoFallback(editor: vscode.TextEditor, selection: vscode.Selection): FunctionInfo | null {
  const document = editor.document;
  const selectedText = document.getText(selection);
  
  // Check if selection contains function keywords
  const functionPatterns = [
    /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/,
    /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=.*=>/,
    /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=.*=>/,
    /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=.*=>/,
    /(useCallback|useMemo|useEffect)\s*\(/,
    /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:=]\s*(?:function|\(.*\)\s*=>)/
  ];

  for (const pattern of functionPatterns) {
    if (pattern.test(selectedText)) {
      // Find the end of the function by looking for closing braces
      let endLine = selection.end.line;
      let braceCount = 0;
      let foundOpenBrace = false;

      for (let i = selection.start.line; i <= Math.min(selection.end.line + 20, document.lineCount - 1); i++) {
        const line = document.lineAt(i).text;
        for (const char of line) {
          if (char === '{') {
            braceCount++;
            foundOpenBrace = true;
          } else if (char === '}') {
            braceCount--;
            if (foundOpenBrace && braceCount === 0) {
              endLine = i;
              break;
            }
          }
        }
        if (foundOpenBrace && braceCount === 0) break;
      }

      const match = selectedText.match(pattern);
      return {
        name: match?.[1],
        startLine: selection.start.line,
        endLine: endLine,
        type: selectedText.includes('use') ? 'hook' : 'function'
      };
    }
  }

  return null;
}

function deleteAllLogs() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const document = editor.document;
  const text = document.getText();
  const lines = text.split("\n");

  const edits: vscode.TextEdit[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line starts a console.log
    if (line.includes('console.log(')) {
      let isMagicLog = false;
      let endLine = i;
      
      // Look ahead to see if this is a magic log (contains 🪄 in the next few lines)
      for (let j = i; j < Math.min(i + 10, lines.length); j++) {
        if (lines[j].includes('🪄')) {
          isMagicLog = true;
          break;
        }
      }
      
      if (isMagicLog) {
        // Find the end of the console.log by counting parentheses
        let openParens = 0;
        let inString = false;
        let stringChar = '';
        
        for (let j = i; j < lines.length; j++) {
          const currentLine = lines[j];
          
          for (let k = 0; k < currentLine.length; k++) {
            const char = currentLine[k];
            const prevChar = k > 0 ? currentLine[k - 1] : '';
            
            // Handle string literals (skip parentheses inside strings)
            if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
              if (!inString) {
                inString = true;
                stringChar = char;
              } else if (char === stringChar) {
                inString = false;
                stringChar = '';
              }
            }
            
            if (!inString) {
              if (char === '(') {
                openParens++;
              } else if (char === ')') {
                openParens--;
                if (openParens === 0) {
                  endLine = j;
                  break;
                }
              }
            }
          }
          
          if (openParens === 0) break;
        }

        const range = new vscode.Range(
          new vscode.Position(i, 0),
          new vscode.Position(endLine + 1, 0)
        );
        edits.push(vscode.TextEdit.delete(range));
        i = endLine; // Skip processed lines
      }
    }
  }

  if (edits.length > 0) {
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.set(document.uri, edits);
    vscode.workspace.applyEdit(workspaceEdit);
    vscode.window.showInformationMessage(
      `Deleted ${edits.length} magic log(s)`
    );
  } else {
    vscode.window.showInformationMessage("No magic logs found");
  }
}

function commentAllLogs() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const document = editor.document;
  const text = document.getText();
  const lines = text.split("\n");

  const edits: vscode.TextEdit[] = [];
  let logCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line starts a console.log and is not already commented
    if (line.includes('console.log(') && !line.trim().startsWith("//")) {
      let isMagicLog = false;
      let endLine = i;
      
      // Look ahead to see if this is a magic log (contains 🪄 in the next few lines)
      for (let j = i; j < Math.min(i + 10, lines.length); j++) {
        if (lines[j].includes('🪄')) {
          isMagicLog = true;
          break;
        }
      }
      
      if (isMagicLog) {
        // Find the end of the console.log by counting parentheses
        let openParens = 0;
        let inString = false;
        let stringChar = '';
        
        for (let j = i; j < lines.length; j++) {
          const currentLine = lines[j];
          
          for (let k = 0; k < currentLine.length; k++) {
            const char = currentLine[k];
            const prevChar = k > 0 ? currentLine[k - 1] : '';
            
            if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
              if (!inString) {
                inString = true;
                stringChar = char;
              } else if (char === stringChar) {
                inString = false;
                stringChar = '';
              }
            }
            
            if (!inString) {
              if (char === '(') {
                openParens++;
              } else if (char === ')') {
                openParens--;
                if (openParens === 0) {
                  endLine = j;
                  break;
                }
              }
            }
          }
          
          if (openParens === 0) break;
        }
        
        // Comment all lines of this log statement
        for (let lineIndex = i; lineIndex <= endLine; lineIndex++) {
          const currentLine = lines[lineIndex];
          if (!currentLine.trim().startsWith("//")) {
            const firstNonWhitespaceIndex = currentLine.search(/\S/);
            if (firstNonWhitespaceIndex !== -1) {
              const position = new vscode.Position(lineIndex, firstNonWhitespaceIndex);
              edits.push(vscode.TextEdit.insert(position, "// "));
            }
          }
        }
        
        logCount++;
        i = endLine; // Skip processed lines
      }
    }
  }

  if (edits.length > 0) {
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.set(document.uri, edits);
    vscode.workspace.applyEdit(workspaceEdit);
    vscode.window.showInformationMessage(
      `Commented ${logCount} magic log(s)`
    );
  } else {
    vscode.window.showInformationMessage("No uncommented magic logs found");
  }
}

function uncommentAllLogs() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const document = editor.document;
  const text = document.getText();
  const lines = text.split("\n");

  const edits: vscode.TextEdit[] = [];
  let logCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line starts a commented console.log
    if (line.includes('console.log(')) {
      let isMagicLog = false;
      let endLine = i;
      
      // Look ahead to see if this is a magic log (contains 🪄 in the next few lines)
      for (let j = i; j < Math.min(i + 10, lines.length); j++) {
        if (lines[j].includes('🪄')) {
          isMagicLog = true;
          break;
        }
      }
      
      if (isMagicLog) {
        const commentMatch = line.match(/^(\s*)\/\/\s*/);
        if (commentMatch) {
          // Find the end of the console.log by counting parentheses
          let openParens = 0;
          let inString = false;
          let stringChar = '';
          
          for (let j = i; j < lines.length; j++) {
            const currentLine = lines[j];
            // Remove comment prefix to parse the actual content
            const actualLine = currentLine.replace(/^\s*\/\/\s*/, '');
            
            for (let k = 0; k < actualLine.length; k++) {
              const char = actualLine[k];
              const prevChar = k > 0 ? actualLine[k - 1] : '';
              
              if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
                if (!inString) {
                  inString = true;
                  stringChar = char;
                } else if (char === stringChar) {
                  inString = false;
                  stringChar = '';
                }
              }
              
              if (!inString) {
                if (char === '(') {
                  openParens++;
                } else if (char === ')') {
                  openParens--;
                  if (openParens === 0) {
                    endLine = j;
                    break;
                  }
                }
              }
            }
            
            if (openParens === 0) break;
          }
          
          // Uncomment all lines of this log statement
          for (let lineIndex = i; lineIndex <= endLine; lineIndex++) {
            const currentLine = lines[lineIndex];
            const commentMatch = currentLine.match(/^(\s*)\/\/\s*/);
            if (commentMatch) {
              const range = new vscode.Range(
                new vscode.Position(lineIndex, commentMatch[1].length),
                new vscode.Position(lineIndex, commentMatch[0].length)
              );
              edits.push(vscode.TextEdit.delete(range));
            }
          }
          
          logCount++;
          i = endLine; // Skip processed lines
        }
      }
    }
  }

  if (edits.length > 0) {
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.set(document.uri, edits);
    vscode.workspace.applyEdit(workspaceEdit);
    vscode.window.showInformationMessage(
      `Uncommented ${logCount} magic log(s)`
    );
  } else {
    vscode.window.showInformationMessage("No commented magic logs found");
  }
}

function getFunctionName(
  editor: vscode.TextEditor,
  position: vscode.Position
): string | null {
  try {
    const document = editor.document;
    const text = document.getText();

    // Parse the code using Babel
    const ast = parse(text, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    let functionName: string | null = null;
    const targetLine = position.line + 1; // Babel uses 1-based line numbers

    traverse(ast, {
      Function(path: NodePath<t.Function>) {
        const node = path.node;
        if (
          node.loc &&
          node.loc.start.line <= targetLine &&
          node.loc.end.line >= targetLine
        ) {
          if (t.isFunctionDeclaration(node) && node.id) {
            functionName = node.id.name;
          } else if (
            t.isArrowFunctionExpression(node) ||
            t.isFunctionExpression(node)
          ) {
            // Try to get name from variable declaration or object method
            const parent = path.parent;
            if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
              functionName = parent.id.name;
            } else if (t.isObjectMethod(parent) && t.isIdentifier(parent.key)) {
              functionName = parent.key.name;
            } else if (t.isProperty(parent) && t.isIdentifier(parent.key)) {
              functionName = parent.key.name;
            }
          } else if (t.isObjectMethod(node) && t.isIdentifier(node.key)) {
            functionName = node.key.name;
          }
        }
      },
    });

    return functionName;
  } catch (error) {
    // Fallback to regex-based detection if parsing fails
    return getFunctionNameFallback(editor, position);
  }
}

function getFunctionNameFallback(
  editor: vscode.TextEditor,
  position: vscode.Position
): string | null {
  const document = editor.document;
  const currentLine = position.line;

  // Look backwards for function declarations
  for (let i = currentLine; i >= 0; i--) {
    const line = document.lineAt(i).text;

    // Match function declarations
    const functionMatch = line.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
    if (functionMatch) {
      return functionMatch[1];
    }

    // Match arrow functions assigned to variables
    const arrowMatch = line.match(
      /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=.*=>/
    );
    if (arrowMatch) {
      return arrowMatch[1];
    }

    // Match object methods
    const methodMatch = line.match(
      /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*[:=]\s*(?:function|\(.*\)\s*=>)/
    );
    if (methodMatch) {
      return methodMatch[1];
    }
  }

  return null;
}

function getIndentation(editor: vscode.TextEditor, lineNumber: number): string {
  const line = editor.document.lineAt(lineNumber).text;
  const match = line.match(/^(\s*)/);
  return match ? match[1] : "";
}

export function deactivate() {}
