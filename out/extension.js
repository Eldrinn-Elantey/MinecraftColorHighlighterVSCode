"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const minecraftFormatting_1 = require("./minecraftFormatting");
const FORMAT_REGEX = /(\u00a7([0-9a-fk-orA-FK-OR]))/g;
const AUTO_COMPLETE_MAP = (0, minecraftFormatting_1.getAllForAutoComplete)();
const KEY_DECORATION = vscode.window.createTextEditorDecorationType({
    color: "#c88c00"
});
const EQUALS_DECORATION = vscode.window.createTextEditorDecorationType({
    color: "#c88c00"
});
const FORMAT_DECORATIONS = new Map();
for (const formatting of minecraftFormatting_1.ALL_FORMATTINGS) {
    const options = {
        backgroundColor: formatting.backgroundColor,
        color: formatting.foregroundColor
    };
    switch (formatting.code) {
        case "l":
            options.fontWeight = "bold";
            break;
        case "o":
            options.fontStyle = "italic";
            break;
        case "n":
            options.textDecoration = "underline";
            break;
        case "m":
            options.textDecoration = "line-through";
            break;
        case "k":
            options.border = "1px solid #444";
            break;
        default:
            break;
    }
    FORMAT_DECORATIONS.set(formatting.code, vscode.window.createTextEditorDecorationType(options));
}
let isApplyingEdit = false;
let updateTimer;
const triggerUpdateDecorations = () => {
    if (updateTimer) {
        clearTimeout(updateTimer);
    }
    updateTimer = setTimeout(() => {
        for (const editor of vscode.window.visibleTextEditors) {
            updateEditorDecorations(editor);
        }
    }, 150);
};
const clearDecorations = (editor) => {
    editor.setDecorations(KEY_DECORATION, []);
    editor.setDecorations(EQUALS_DECORATION, []);
    for (const decoration of FORMAT_DECORATIONS.values()) {
        editor.setDecorations(decoration, []);
    }
};
const updateEditorDecorations = (editor) => {
    const document = editor.document;
    const fileName = document.fileName.toLowerCase();
    if (!fileName.endsWith(".lang")) {
        clearDecorations(editor);
        return;
    }
    const keyRanges = [];
    const equalsRanges = [];
    const formatRanges = new Map();
    for (const formatting of minecraftFormatting_1.ALL_FORMATTINGS) {
        formatRanges.set(formatting.code, []);
    }
    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
        const line = document.lineAt(lineIndex);
        const text = line.text;
        const trimmed = text.trim();
        if (trimmed.length === 0 || trimmed.startsWith("#")) {
            continue;
        }
        const equalsIndex = text.indexOf("=");
        const lineStartOffset = document.offsetAt(line.range.start);
        if (equalsIndex !== -1) {
            const keyStartOffset = lineStartOffset;
            const keyEndOffset = lineStartOffset + equalsIndex;
            if (keyEndOffset > keyStartOffset) {
                keyRanges.push(new vscode.Range(document.positionAt(keyStartOffset), document.positionAt(keyEndOffset)));
            }
            equalsRanges.push(new vscode.Range(document.positionAt(lineStartOffset + equalsIndex), document.positionAt(lineStartOffset + equalsIndex + 1)));
            const valueText = text.slice(equalsIndex + 1);
            const valueOffset = lineStartOffset + equalsIndex + 1;
            addFormattingRanges(valueText, valueOffset, document, formatRanges);
        }
        else {
            addFormattingRanges(text, lineStartOffset, document, formatRanges);
        }
    }
    editor.setDecorations(KEY_DECORATION, keyRanges);
    editor.setDecorations(EQUALS_DECORATION, equalsRanges);
    for (const [code, ranges] of formatRanges.entries()) {
        const decoration = FORMAT_DECORATIONS.get(code);
        if (decoration) {
            editor.setDecorations(decoration, ranges);
        }
    }
};
const addFormattingRanges = (text, startOffset, document, formatRanges) => {
    FORMAT_REGEX.lastIndex = 0;
    const matches = [];
    let match;
    while ((match = FORMAT_REGEX.exec(text)) !== null) {
        matches.push(match);
    }
    for (let i = 0; i < matches.length; i++) {
        const current = matches[i];
        const next = matches[i + 1];
        const code = current[2].toLowerCase();
        const rangeStart = startOffset + current.index;
        const rangeEnd = next
            ? startOffset + next.index
            : startOffset + text.length;
        const ranges = formatRanges.get(code);
        if (ranges && rangeEnd > rangeStart) {
            ranges.push(new vscode.Range(document.positionAt(rangeStart), document.positionAt(rangeEnd)));
        }
    }
};
const checkAndReplaceLastWord = async (editor, document, offset) => {
    if (offset <= 0) {
        return;
    }
    const position = document.positionAt(offset);
    const line = document.lineAt(position.line);
    const lineText = line.text;
    const equalsIndex = lineText.indexOf("=");
    if (equalsIndex === -1) {
        return;
    }
    const cursorInLine = position.character;
    if (cursorInLine <= equalsIndex) {
        return;
    }
    const textAfterEquals = lineText.substring(equalsIndex + 1, cursorInLine);
    const words = textAfterEquals.split(/[\s\t]+/).filter((word) => word.length > 0);
    if (words.length === 0) {
        return;
    }
    const lastWord = words[words.length - 1];
    const code = AUTO_COMPLETE_MAP[lastWord.toLowerCase()];
    if (!code) {
        return;
    }
    const wordStartInText = textAfterEquals.lastIndexOf(lastWord);
    if (wordStartInText === -1) {
        return;
    }
    const wordStartOffset = line.range.start.character + equalsIndex + 1 + wordStartInText;
    const wordEndOffset = wordStartOffset + lastWord.length;
    isApplyingEdit = true;
    await editor.edit((editBuilder) => {
        editBuilder.replace(new vscode.Range(line.range.start.line, wordStartOffset, line.range.start.line, wordEndOffset), code);
    });
    const newCursor = new vscode.Position(line.range.start.line, wordStartOffset + code.length);
    editor.selection = new vscode.Selection(newCursor, newCursor);
    isApplyingEdit = false;
};
const isLikelyLangKey = (text) => {
    return text.includes(".") || text.includes("_") || text.includes("-");
};
const getStringLiteralAtPosition = (document, position) => {
    const line = document.lineAt(position.line).text;
    const offset = position.character;
    const scanQuote = (quote) => {
        let start = -1;
        for (let i = offset; i >= 0; i--) {
            if (line[i] === quote && (i === 0 || line[i - 1] !== "\\")) {
                start = i;
                break;
            }
        }
        if (start === -1) {
            return null;
        }
        for (let i = offset; i < line.length; i++) {
            if (line[i] === quote && (i === 0 || line[i - 1] !== "\\")) {
                if (i > start) {
                    return { start, end: i };
                }
            }
        }
        return null;
    };
    const doubleMatch = scanQuote("\"");
    const singleMatch = scanQuote("'");
    const match = doubleMatch ?? singleMatch;
    if (!match) {
        return null;
    }
    if (offset <= match.start || offset >= match.end) {
        return null;
    }
    const text = line.slice(match.start + 1, match.end);
    const range = new vscode.Range(new vscode.Position(position.line, match.start + 1), new vscode.Position(position.line, match.end));
    return { text, range };
};
const findKeyInLine = (line, searchKey) => {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) {
        return null;
    }
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
        return null;
    }
    const lineKey = trimmed.substring(0, equalsIndex).trim();
    if (lineKey === searchKey) {
        return { matchType: 1, matchedKey: lineKey };
    }
    if (lineKey.endsWith(`.${searchKey}`)) {
        return { matchType: 2, matchedKey: lineKey };
    }
    if (lineKey.includes(searchKey) && searchKey.length >= 3) {
        return { matchType: 4, matchedKey: lineKey };
    }
    if (searchKey.includes(".")) {
        const searchParts = searchKey.split(".");
        const lineParts = lineKey.split(".");
        let searchIndex = 0;
        for (const part of lineParts) {
            if (searchIndex < searchParts.length && part === searchParts[searchIndex]) {
                searchIndex++;
            }
        }
        if (searchIndex === searchParts.length) {
            return { matchType: 3, matchedKey: lineKey };
        }
    }
    return null;
};
const provideDefinition = async (document, position) => {
    const literal = getStringLiteralAtPosition(document, position);
    if (!literal) {
        return undefined;
    }
    const key = literal.text;
    if (!isLikelyLangKey(key)) {
        return undefined;
    }
    const langFiles = await vscode.workspace.findFiles("**/*.lang");
    const matches = [];
    for (const file of langFiles) {
        const content = await vscode.workspace.fs.readFile(file);
        const text = content.toString();
        const lines = text.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
            const result = findKeyInLine(lines[i], key);
            if (!result) {
                continue;
            }
            const location = new vscode.Location(file, new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, 0)));
            matches.push({ priority: result.matchType, location });
        }
    }
    matches.sort((a, b) => a.priority - b.priority);
    if (matches.length === 0) {
        return undefined;
    }
    return matches.map((match) => match.location);
};
const activate = (context) => {
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(async (event) => {
        if (isApplyingEdit) {
            return;
        }
        const document = event.document;
        if (!document.fileName.toLowerCase().endsWith(".lang")) {
            return;
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== document) {
            return;
        }
        for (const change of event.contentChanges) {
            if (!change.text.includes(" ") && !change.text.includes("\n") && !change.text.includes("\r")) {
                continue;
            }
            const offset = document.offsetAt(change.range.start) + change.text.length;
            await checkAndReplaceLastWord(editor, document, Math.max(0, offset - 1));
        }
        triggerUpdateDecorations();
    }));
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
        triggerUpdateDecorations();
    }));
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => {
        triggerUpdateDecorations();
    }));
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider({ language: "minecraft-lang" }, {
        provideCompletionItems(document, position) {
            const line = document.lineAt(position.line).text;
            const beforeCursor = line.substring(0, position.character);
            if (!beforeCursor.includes("=")) {
                return undefined;
            }
            const items = [];
            for (const [name, code] of Object.entries(AUTO_COMPLETE_MAP)) {
                const item = new vscode.CompletionItem(name, vscode.CompletionItemKind.Color);
                item.insertText = code;
                item.detail = code;
                items.push(item);
            }
            return items;
        }
    }));
    context.subscriptions.push(vscode.languages.registerDefinitionProvider([{ scheme: "file" }, { scheme: "untitled" }], {
        provideDefinition
    }));
    triggerUpdateDecorations();
};
exports.activate = activate;
const deactivate = () => {
    return undefined;
};
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map