/**
 * Production Input Data Validation & Sanitization Service
 */

/**
 * Validate ISBN-10 or ISBN-13
 */
export const isValidISBN = (isbnStr) => {
  if (!isbnStr) return false;
  const clean = isbnStr.replace(/[- ]/g, '');
  return clean.length === 10 || clean.length === 13;
};

/**
 * Validate Email Address Format
 */
export const isValidEmail = (emailStr) => {
  if (!emailStr) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(emailStr.trim());
};

/**
 * Validate Student Register Number (e.g. REG-2024-8842 or 91002401)
 */
export const isValidRegisterNumber = (regStr) => {
  if (!regStr) return false;
  return regStr.trim().length >= 4;
};

/**
 * Validate Copy ID format (e.g. CPY-235088-001)
 */
export const isValidCopyId = (copyIdStr) => {
  if (!copyIdStr) return false;
  return copyIdStr.trim().startsWith('CPY-') || copyIdStr.trim().length >= 6;
};

/**
 * Sanitize String Input against XSS / Script Injection
 */
export const sanitizeInputString = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[<>]/g, '').trim();
};
