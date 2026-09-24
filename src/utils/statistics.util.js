export function getStatisticsDateRange(period = "month") {
  const endDate = new Date();
  const startDate = new Date(endDate);

  switch (period) {
    case "day":
      startDate.setDate(startDate.getDate() - 1);
      break;

    case "week":
      startDate.setDate(startDate.getDate() - 7);
      break;

    case "month":
      startDate.setMonth(startDate.getMonth() - 1);
      break;

    case "3months":
      startDate.setMonth(startDate.getMonth() - 3);
      break;

    case "6months":
      startDate.setMonth(startDate.getMonth() - 6);
      break;

    case "year":
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;

    default:
      startDate.setMonth(startDate.getMonth() - 1);
  }

  return {
    startDate,
    endDate,
  };
}