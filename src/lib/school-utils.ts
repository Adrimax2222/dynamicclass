import { SCHOOL_NAME } from "./constants";

/**
 * Normalizes a given school name input to a canonical form if it matches a known school.
 * This function is case-insensitive and accent-insensitive.
 * @param input The raw school name from user input.
 * @returns The canonical school name if it's a match, otherwise the original input.
 */
export function normalizeSchoolName(input: string): string {
  const normalizedInput = input
    .toLowerCase()
    .normalize("NFD") // Decompose accents from characters
    .replace(/[\u0300-\u036f]/g, "") // Remove accent characters
    .replace(/[^a-z0-9\s]/g, '') // Remove non-alphanumeric characters except spaces
    .trim();

  const schoolKeywords = [
    "ies torre del palau",
    "torre del palau",
    "ins torre del palau",
  ];

  if (schoolKeywords.some(keyword => normalizedInput.includes(keyword))) {
    return SCHOOL_NAME;
  }

  return input;
}
