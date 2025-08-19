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
 * Parses an ISO date string and returns a Date object
 * Handles ISO date format: "2021-08-19T07:42:12Z"
 * @param {string} date - Date string in ISO format
 * @returns {Date} Parsed Date object or null if error
 */
export function parseIsoDate(date) {
  try {
    return new Date(date);
  } catch (error) {
    console.error("Error parsing ISO date:", error);
    return null;
  }
}

/**
 * Formats a date string to French locale format (dd/MM/yyyy)
 * Handles both EXIF date format: "2025:08:04 13:34:43"
 * and ISO date format: "2021-08-19T07:42:12Z"
 * @param {string} date - Date string in EXIF or ISO format
 * @returns {string} Formatted date string or empty string if error
 */
export function formatDate(date) {
  try {
    let dateObj = null;

    // Try parsing as ISO date first (more common)
    if (date.includes("T") || date.includes("Z")) {
      dateObj = parseIsoDate(date);
    }

    // If not ISO, try EXIF format
    if (!dateObj) {
      dateObj = parseExifDate(date);
    }

    if (!dateObj) return "";

    return format(dateObj, "dd/MM/yyyy", { locale: fr });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

/**
 * Formats an ISO date string to French locale format (dd/MM/yyyy)
 * Specifically for ISO date format: "2021-08-19T07:42:12Z"
 * @param {string} date - Date string in ISO format
 * @returns {string} Formatted date string or empty string if error
 */
export function formatIsoDate(date) {
  try {
    const dateObj = parseIsoDate(date);
    if (!dateObj) return "";

    return format(dateObj, "dd/MM/yyyy", { locale: fr });
  } catch (error) {
    console.error("Error formatting ISO date:", error);
    return "";
  }
}
