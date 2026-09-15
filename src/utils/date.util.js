import env from "./../config/env.js";
const PROJECT_TIME_ZONE = env.PROJECT_TIME_ZONE;

export function getTodayLocalDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PROJECT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year").value;

  const month = parts.find((part) => part.type === "month").value;

  const day = parts.find((part) => part.type === "day").value;

  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
}

export function addDays(date, days) {
  const result = new Date(date);

  result.setUTCDate(result.getUTCDate() + days);

  return result;
}

export function getProjectDayOfWeek(date) {
  const javascriptDay = date.getUTCDay();

  return (javascriptDay + 1) % 7;
}

//* Get Current Project Time In Minutes
export function getCurrentProjectTimeInMinutes() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: PROJECT_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const hour = Number(parts.find((part) => part.type === "hour").value);

  const minute = Number(parts.find((part) => part.type === "minute").value);

  return hour * 60 + minute;
}
