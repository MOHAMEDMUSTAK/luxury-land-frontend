/**
 * Shared Utility Functions for LuxuryLand Frontend
 */

/**
 * Formats a number to Indian Rupee (INR) currency format.
 */
export const formatCurrency = (value: number) => {
  if (value === undefined || value === null) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Calculates the time elapsed since listing.
 */
export const getTimeOnMarket = (date: string | Date | undefined) => {
  if (!date) return "Recently Listed";
  
  try {
    const now = new Date();
    const created = new Date(date);
    
    // Check if valid date
    if (isNaN(created.getTime())) return "Recently Listed";
    
    // Calculate difference by resetting time to midnight
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const createdDate = new Date(created.getFullYear(), created.getMonth(), created.getDate());
    
    const diffInMs = today.getTime() - createdDate.getTime();
    const diffInDays = Math.round(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Listed Today";
    if (diffInDays === 1) return "Listed Yesterday";

    // Return exact formatted date for older listings
    return `Listed ${created.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })}`;
  } catch (err) {
    return "Recently Listed";
  }
};
