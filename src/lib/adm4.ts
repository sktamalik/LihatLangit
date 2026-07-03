/**
 * adm4 code validation.
 *
 * Format: XX.XX.XX.XXXX (province.regency.district.village)
 */

const ADM4_REGEX = /^\d{2}\.\d{2}\.\d{2}\.\d{4}$/;

export function isValidAdm4(adm4: string): boolean {
  return ADM4_REGEX.test(adm4);
}
