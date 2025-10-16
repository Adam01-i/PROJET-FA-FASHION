// utils/dateUtils.ts
export const getDateRange = (timeRange: "week" | "month" | "quarter" | "year") => {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (timeRange) {
    case "week":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "month":
      startDate.setDate(endDate.getDate() - 30);
      break;
    case "quarter":
      startDate.setDate(endDate.getDate() - 90);
      break;
    case "year":
      startDate.setDate(endDate.getDate() - 365);
      break;
  }
  
  return { startDate, endDate };
};