"use strict";
/**
 * Title Utility Helpers
 * Provides reusable sanitization and regex generation for title uniqueness checks across Notes & Collections.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFuzzySearchFilter = exports.stripSuffixWord = exports.cleanTitleString = exports.createTitleRegex = void 0;
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
/**
 * Builds a flexible multi-keyword fuzzy search filter for MongoDB queries.
 * Splits search terms by whitespace/punctuation to match any relevant keyword.
 */
const buildFuzzySearchFilter = (searchTerm, textFields = ['title']) => {
    if (!searchTerm || !searchTerm.trim())
        return {};
    const cleanTerm = searchTerm.trim();
    const words = cleanTerm
        .replace(/['"’]/g, '')
        .split(/[\s,._-]+/)
        .filter((w) => w.length > 1);
    const termsToMatch = Array.from(new Set([cleanTerm, ...words]));
    const conditions = textFields.flatMap((field) => termsToMatch.map((term) => ({
        [field]: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
    })));
    return conditions.length > 0 ? { $or: conditions } : {};
};
exports.buildFuzzySearchFilter = buildFuzzySearchFilter;
