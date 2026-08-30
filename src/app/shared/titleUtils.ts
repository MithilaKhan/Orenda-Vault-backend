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
