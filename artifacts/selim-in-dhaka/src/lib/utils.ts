import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";

/**
 * Convert Western Arabic digits (0-9) in any string/number to Bengali digits.
 * Used to keep numerals consistent with surrounding Bangla copy
 * (e.g. "দিন ৩/১৫" instead of the jarring "দিন 3/১৫").
 */
export function toBn(value: number | string): string {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[+d]);
}
