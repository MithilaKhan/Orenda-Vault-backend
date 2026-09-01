/**
 * Title Utility Helpers
 * Provides reusable sanitization and regex generation for title uniqueness checks across Notes & Collections.
 */

/**
 * Creates a case-insensitive, exact-match RegExp for MongoDB title queries.
 * Escapes any special regex characters.
 */
export const createTitleRegex = (title: string): RegExp => {
  const escaped = title.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped}$`, 'i');
};

/**
 * Cleans user-provided title/name string by trimming quotes and whitespace.
 */
export const cleanTitleString = (rawTitle: string): string => {
  if (!rawTitle) return '';
  return String(rawTitle).trim().replace(/^["']|["']$/g, '');
};

/**
 * Strips common suffix words like "collection", "folder", "vault", "note", "document"
 * from user input to improve title matching accuracy.
 */
export const stripSuffixWord = (title: string, type: 'collection' | 'note'): string => {
  const clean = cleanTitleString(title);
  if (!clean) return '';
  
  const pattern = type === 'collection' 
    ? /\s+(collection|folder|vault)$/i 
    : /\s+(note|document)$/i;
    
  return clean.replace(pattern, '').trim();
};

/**
 * Builds a flexible multi-keyword fuzzy search filter for MongoDB queries.
 * Splits search terms by whitespace/punctuation to match any relevant keyword.
 */
export const buildFuzzySearchFilter = (searchTerm?: string, textFields: string[] = ['title']) => {
  if (!searchTerm || !searchTerm.trim()) return {};

  const cleanTerm = searchTerm.trim();
  const words = cleanTerm
    .replace(/['"’]/g, '')
    .split(/[\s,._-]+/)
    .filter((w) => w.length > 1);

  const termsToMatch = Array.from(new Set([cleanTerm, ...words]));

  const conditions = textFields.flatMap((field) =>
    termsToMatch.map((term) => ({
      [field]: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
    }))
  );

  return conditions.length > 0 ? { $or: conditions } : {};
};

