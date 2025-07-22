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

  // Get function name context
  const functionName = getFunctionName(editor, selection.start);

  // Create the log statement
  const logStatement = functionName
    ? `console.log("🪄 [${functionName}] -> ${selectedText}", ${selectedText});`
    : `console.log("🪄 ${selectedText}", ${selectedText});`;

  // Insert the log statement on the next line
  const currentLine = selection.end.line;
  const nextLinePosition = new vscode.Position(currentLine + 1, 0);
  const indent = getIndentation(editor, currentLine);

  editor.edit((editBuilder: vscode.TextEditorEdit) => {
    editBuilder.insert(nextLinePosition, `${indent}${logStatement}\n`);
  });
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
    if (line.includes('console.log("🪄')) {
      const range = new vscode.Range(
        new vscode.Position(i, 0),
        new vscode.Position(i + 1, 0)
      );
      edits.push(vscode.TextEdit.delete(range));
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('console.log("🪄') && !line.trim().startsWith("//")) {
      const firstNonWhitespaceIndex = line.search(/\S/);
      if (firstNonWhitespaceIndex !== -1) {
        const position = new vscode.Position(i, firstNonWhitespaceIndex);
        edits.push(vscode.TextEdit.insert(position, "// "));
      }
    }
  }

  if (edits.length > 0) {
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.set(document.uri, edits);
    vscode.workspace.applyEdit(workspaceEdit);
    vscode.window.showInformationMessage(
      `Commented ${edits.length} magic log(s)`
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('console.log("🪄')) {
      const commentMatch = line.match(/^(\s*)\/\/\s*/);
      if (commentMatch) {
        const range = new vscode.Range(
          new vscode.Position(i, commentMatch[1].length),
          new vscode.Position(i, commentMatch[0].length)
        );
        edits.push(vscode.TextEdit.delete(range));
      }
    }
  }

  if (edits.length > 0) {
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.set(document.uri, edits);
    vscode.workspace.applyEdit(workspaceEdit);
    vscode.window.showInformationMessage(
      `Uncommented ${edits.length} magic log(s)`
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
