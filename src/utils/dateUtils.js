import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Parses a date string and returns a Date object
 * Handles date format: "2025:08:04 13:34:43"
 * @param {string} date - Date string
 * @returns {Date} Parsed Date object or null if error
 */
export function parseDate(date) {
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
 * @param {string} date - Date string
 * @returns {string} Formatted date string or empty string if error
 */
export function formatDate(date) {
  try {
    let dateObj = null;

    if (!dateObj) {
      dateObj = parseDate(date);
    }

    if (!dateObj) return "";

    return format(dateObj, "dd/MM/yyyy", { locale: fr });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}
