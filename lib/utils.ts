import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class names with conflict resolution (shadcn/ui pattern).
 * @param inputs - Class values passed to clsx
 * @returns A single merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
