const PROJECT_TIME_ZONE = "Asia/Tehran";

export function getTodayLocalDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PROJECT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find(
    (part) => part.type === "year",
  ).value;

  const month = parts.find(
    (part) => part.type === "month",
  ).value;

  const day = parts.find(
    (part) => part.type === "day",
  ).value;

  return new Date(
    `${year}-${month}-${day}T00:00:00.000Z`,
  );
}

export function addDays(date, days) {
  const result = new Date(date);

  result.setUTCDate(
    result.getUTCDate() + days,
  );

  return result;
}

export function getProjectDayOfWeek(date) {
  const javascriptDay = date.getUTCDay();

  // Project:
  // Saturday = 0
  // Sunday = 1
  // Monday = 2
  // Tuesday = 3
  // Wednesday = 4
  // Thursday = 5
  // Friday = 6

  return (javascriptDay + 1) % 7;
}