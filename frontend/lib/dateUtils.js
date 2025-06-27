// lib/dateUtils.js

/**
 * Calculates the number of days between two dates (inclusive)
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {number} Number of days between dates (inclusive)
 */
export function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Handle invalid dates
  if (isNaN(start.getTime())) throw new Error('Invalid start date');
  if (isNaN(end.getTime())) throw new Error('Invalid end date');
  
  // Calculate difference in days (inclusive)
  const diffTime = Math.abs(end - start);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Formats a date string to a more readable format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date (e.g., "Jan 1, 2023")
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}