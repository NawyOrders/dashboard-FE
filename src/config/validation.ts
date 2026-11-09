/**
 * Validation constants that are not tied to a single form field.
 *
 * The values live in `config/` so the field definition, the validator and the form all
 * read the same number. Every value that is not confirmed by an official source carries an
 * `// ASSUMPTION:` marker and is listed in `ASSUMPTIONS.md`.
 */

/**
 * Minimum number of digits of a commercial register number.
 * ASSUMPTION: verify with official source before production.
 */
export const commercialRegisterMinLength = 15;

/**
 * Maximum number of digits of a commercial register number.
 * ASSUMPTION: verify with official source before production.
 */
export const commercialRegisterMaxLength = 15;
