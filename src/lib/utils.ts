import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanTableName(tableName: string | undefined): string {
  if (!tableName) return '';
  // Remove GUID suffix if present (e.g., LocalDateTable_e9fc8ccc-f97b-4356-9f53-95b869d235bd -> LocalDateTable)
  return tableName.replace(/_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, '');
}