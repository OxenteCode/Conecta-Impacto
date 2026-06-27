import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitário para combinar classes Tailwind de forma segura,
 * resolvendo conflitos entre classes de mesmo grupo.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
