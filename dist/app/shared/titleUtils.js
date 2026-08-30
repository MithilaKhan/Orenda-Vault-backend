"use strict";
/**
 * Title Utility Helpers
 * Provides reusable sanitization and regex generation for title uniqueness checks across Notes & Collections.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripSuffixWord = exports.cleanTitleString = exports.createTitleRegex = void 0;
/**
 * Creates a case-insensitive, exact-match RegExp for MongoDB title queries.
 * Escapes any special regex characters.
 */
const createTitleRegex = (title) => {
    const escaped = title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${escaped}$`, 'i');
};
exports.createTitleRegex = createTitleRegex;
/**
 * Cleans user-provided title/name string by trimming quotes and whitespace.
 */
const cleanTitleString = (rawTitle) => {
    if (!rawTitle)
        return '';
    return String(rawTitle).trim().replace(/^["']|["']$/g, '');
};
exports.cleanTitleString = cleanTitleString;
/**
 * Strips common suffix words like "collection", "folder", "vault", "note", "document"
 * from user input to improve title matching accuracy.
 */
const stripSuffixWord = (title, type) => {
    const clean = (0, exports.cleanTitleString)(title);
    if (!clean)
        return '';
    const pattern = type === 'collection'
        ? /\s+(collection|folder|vault)$/i
        : /\s+(note|document)$/i;
    return clean.replace(pattern, '').trim();
};
exports.stripSuffixWord = stripSuffixWord;
