import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Parses an EXIF date string and returns a Date object
 * Handles EXIF date format: "2025:08:04 13:34:43"
 * @param {string} date - Date string in EXIF format
 * @returns {Date} Parsed Date object or null if error
 */
export function parseExifDate(date) {
  try {
    const formatStr = "yyyy:MM:dd HH:mm:ss";
    return parse(date, formatStr, new Date());
  } catch (error) {
    console.error("Error parsing EXIF date:", error);
    return null;
  }
}

/**
 * Formats a date string to French locale format (dd/MM/yyyy)
 * Handles EXIF date format: "2025:08:04 13:34:43"
 * @param {string} date - Date string in EXIF format
 * @returns {string} Formatted date string or empty string if error
 */
export function formatDate(date) {
  try {
    const dateObj = parseExifDate(date);
    if (!dateObj) return "";

    return format(dateObj, "dd/MM/yyyy", { locale: fr });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}
