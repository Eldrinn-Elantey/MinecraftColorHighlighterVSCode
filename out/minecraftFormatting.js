"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllForAutoComplete = exports.formattingFromCode = exports.ALL_FORMATTINGS = void 0;
const rgba = (r, g, b, a = 0.58) => {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
};
const FORMATTINGS = [
    { code: "0", displayName: "Black", backgroundColor: rgba(0, 0, 0), foregroundColor: "#ffffff" },
    { code: "1", displayName: "Dark Blue", backgroundColor: rgba(0, 0, 170), foregroundColor: "#ffffff" },
    { code: "2", displayName: "Dark Green", backgroundColor: rgba(0, 170, 0), foregroundColor: "#ffffff" },
    { code: "3", displayName: "Dark Aqua", backgroundColor: rgba(0, 170, 170), foregroundColor: "#ffffff" },
    { code: "4", displayName: "Dark Red", backgroundColor: rgba(170, 0, 0), foregroundColor: "#ffffff" },
    { code: "5", displayName: "Dark Purple", backgroundColor: rgba(170, 0, 170), foregroundColor: "#ffffff" },
    { code: "6", displayName: "Gold", backgroundColor: rgba(255, 170, 0), foregroundColor: "#000000" },
    { code: "7", displayName: "Gray", backgroundColor: rgba(170, 170, 170), foregroundColor: "#000000" },
    { code: "8", displayName: "Dark Gray", backgroundColor: rgba(85, 85, 85), foregroundColor: "#ffffff" },
    { code: "9", displayName: "Blue", backgroundColor: rgba(85, 85, 255), foregroundColor: "#ffffff" },
    { code: "a", displayName: "Green", backgroundColor: rgba(85, 255, 85), foregroundColor: "#000000" },
    { code: "b", displayName: "Aqua", backgroundColor: rgba(85, 255, 255), foregroundColor: "#000000" },
    { code: "c", displayName: "Red", backgroundColor: rgba(255, 85, 85), foregroundColor: "#000000" },
    { code: "d", displayName: "Light Purple", backgroundColor: rgba(255, 85, 255), foregroundColor: "#000000" },
    { code: "e", displayName: "Yellow", backgroundColor: rgba(255, 255, 85), foregroundColor: "#000000" },
    { code: "f", displayName: "White", backgroundColor: rgba(255, 255, 255), foregroundColor: "#000000" },
    { code: "k", displayName: "Obfuscated", backgroundColor: rgba(50, 50, 50), foregroundColor: "#c8c8c8" },
    { code: "l", displayName: "Bold", backgroundColor: rgba(240, 240, 240), foregroundColor: "#333333" },
    { code: "m", displayName: "Strikethrough", backgroundColor: rgba(255, 200, 200), foregroundColor: "#640000" },
    { code: "n", displayName: "Underline", backgroundColor: rgba(200, 220, 255), foregroundColor: "#000096" },
    { code: "o", displayName: "Italic", backgroundColor: rgba(255, 255, 220), foregroundColor: "#646400" },
    { code: "r", displayName: "Reset", backgroundColor: rgba(200, 200, 200), foregroundColor: "#000000" }
];
const BY_CODE = new Map(FORMATTINGS.map((format) => [format.code, format]));
exports.ALL_FORMATTINGS = FORMATTINGS;
const formattingFromCode = (code) => {
    return BY_CODE.get(code.toLowerCase());
};
exports.formattingFromCode = formattingFromCode;
const getAllForAutoComplete = () => {
    const result = {};
    for (const format of FORMATTINGS) {
        const name = format.displayName.toLowerCase().replace(/\s+/g, "_");
        result[name] = `\u00a7${format.code}`;
    }
    return result;
};
exports.getAllForAutoComplete = getAllForAutoComplete;
//# sourceMappingURL=minecraftFormatting.js.map