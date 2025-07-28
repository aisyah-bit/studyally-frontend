/**
 * Utility functions for date formatting in admin components
 */

/**
 * Formats a date string or timestamp into a user-friendly format
 * @param {string|Date|number} dateInput - The date to format (ISO string, Date object, or timestamp)
 * @param {string} format - The format type ('short', 'long', 'relative')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput, format = 'short') => {
  if (!dateInput) {
    return "No date available";
  }

  try {
    let date;

    // Handle different input types and Firebase formats
    if (typeof dateInput === 'string') {
      // Handle various string formats including Firebase formats
      if (dateInput.includes('at') && dateInput.includes('UTC')) {
        // Handle Firebase format like "June 6, 2025 at 1:53:48 AM UTC+8"
        const cleanedDate = dateInput.replace(/UTC[+-]\d+/, '').trim();
        date = new Date(cleanedDate);
      } else {
        date = new Date(dateInput);
      }
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else if (dateInput && typeof dateInput === 'object' && dateInput.seconds) {
      // Handle Firebase Timestamp objects
      date = new Date(dateInput.seconds * 1000);
    } else {
      return "No date available";
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "No date available";
    }

    switch (format) {
      case 'short':
        // Format: MM/DD/YYYY
        return date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        });
      
      case 'long':
        // Format: January 15, 2025
        return date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      
      case 'medium':
        // Format: Jan 15, 2025
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      
      case 'relative':
        // Format: "2 days ago", "1 week ago", etc.
        return getRelativeTime(date);
      
      case 'datetime':
        // Format: MM/DD/YYYY at HH:MM AM/PM
        return date.toLocaleDateString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric'
        }) + ' at ' + date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      
      default:
        return date.toLocaleDateString('en-US');
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return "Invalid date";
  }
};

/**
 * Gets relative time string (e.g., "2 days ago", "1 week ago")
 * @param {Date} date - The date to compare
 * @returns {string} Relative time string
 */
const getRelativeTime = (date) => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  } else {
    return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
  }
};

/**
 * Sorts an array of objects by their createdAt field
 * @param {Array} items - Array of objects with createdAt field
 * @param {string} order - 'desc' for newest first, 'asc' for oldest first
 * @returns {Array} Sorted array
 */
export const sortByCreatedAt = (items, order = 'desc') => {
  if (!Array.isArray(items)) {
    return [];
  }

  return [...items].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    
    if (order === 'desc') {
      return dateB.getTime() - dateA.getTime(); // Newest first
    } else {
      return dateA.getTime() - dateB.getTime(); // Oldest first
    }
  });
};

/**
 * Validates if a date string is valid
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Gets a formatted date range for filtering
 * @param {string} period - 'today', 'week', 'month', 'year'
 * @returns {Object} Object with start and end dates
 */
export const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setFullYear(2000); // Default to show all
  }
  
  return {
    start: start.toISOString(),
    end: now.toISOString()
  };
};
