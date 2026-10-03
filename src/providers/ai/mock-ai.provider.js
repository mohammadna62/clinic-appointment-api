const appointmentKeywords = [
  "وقت",
  "نوبت",
  "appointment",
  "available",
  "availability",
  "slot",
];

const generalKeywords = [
  "چیست",
  "چیه",
  "what is",
  "what are",
  "توضیح",
  "explain",
];

const stopWords = new Set([
  "برای",
  "من",
  "می",
  "خوام",
  "میخوام",
  "می‌خوام",
  "دارید",
  "دارین",
  "میشه",
  "می‌شود",
  "وقت",
  "نوبت",
  "خالی",
  "available",
  "appointment",
  "tomorrow",
  "today",
  "فردا",
  "امروز",
  "صبح",
  "ظهر",
  "عصر",
  "بعدازظهر",
  "شب",
  "morning",
  "afternoon",
  "evening",
  "night",
  "برای",
  "the",
  "a",
  "an",
  "doctor",
  "specialist",
  "متخصص",
  "تخصص",
]);

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[؟?!.,،]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function extractAfterKeyword(text, keywords, maxWords = 5) {
  for (const keyword of keywords) {
    const index = text.indexOf(keyword);

    if (index === -1) {
      continue;
    }

    const afterKeyword = text
      .slice(index + keyword.length)
      .trim();

    const words = afterKeyword.split(/\s+/);
    const result = [];

    for (const word of words) {
      if (stopWords.has(word)) {
        break;
      }

      result.push(word);

      if (result.length >= maxWords) {
        break;
      }
    }

    if (result.length) {
      return result.join(" ");
    }
  }

  return null;
}

function extractTimeRange(text) {
  if (
    text.includes("صبح") ||
    text.includes("morning")
  ) {
    return "morning";
  }

  if (
    text.includes("بعدازظهر") ||
    text.includes("عصر") ||
    text.includes("afternoon")
  ) {
    return "afternoon";
  }

  if (
    text.includes("شب") ||
    text.includes("evening") ||
    text.includes("night")
  ) {
    return "evening";
  }

  return null;
}

function extractDate(text) {
  if (text.includes("امروز") || text.includes("today")) {
    return { type: "today" };
  }

  if (text.includes("فردا") || text.includes("tomorrow")) {
    return { type: "tomorrow" };
  }

  const weekdays = {
    شنبه: "saturday",
    یکشنبه: "sunday",
    دوشنبه: "monday",
    سه‌شنبه: "tuesday",
    سهشنبه: "tuesday",
    چهارشنبه: "wednesday",
    پنجشنبه: "thursday",
    جمعه: "friday",

    saturday: "saturday",
    sunday: "sunday",
    monday: "monday",
    tuesday: "tuesday",
    wednesday: "wednesday",
    thursday: "thursday",
    friday: "friday",
  };

  for (const [word, weekday] of Object.entries(weekdays)) {
    if (text.includes(word)) {
      return {
        type: "weekday",
        weekday,
      };
    }
  }

  return null;
}

function extractCriteria(text) {
  return {
    specialty: extractAfterKeyword(
      text,
      ["متخصص", "تخصص", "specialist", "specialty"],
    ),

    doctor: extractAfterKeyword(
      text,
      ["دکتر", "پزشک", "doctor", "dr"],
      3,
    ),

    clinic: extractAfterKeyword(
      text,
      ["کلینیک", "درمانگاه", "clinic"],
      3,
    ),

    date: extractDate(text),

    timeRange: extractTimeRange(text),
  };
}

export default class MockAIProvider {
  async chat({ message, history = [] }) {
    const historyText = history
      .filter((item) => item.role === "user")
      .map((item) => item.content)
      .join(" ");

    const combinedText = normalizeText(
      `${historyText} ${message}`,
    );

    if (containsKeyword(combinedText, appointmentKeywords)) {
      const criteria = extractCriteria(combinedText);

      if (!criteria.date) {
        return {
          type: "appointment_search",
          criteria,
          message: "حتماً. چه روزی مدنظرتان است؟",
        };
      }

      return {
        type: "appointment_search",
        criteria,
        message: null,
      };
    }

    if (containsKeyword(combinedText, generalKeywords)) {
      return {
        type: "general",
        criteria: null,
        message:
          "در نسخه فعلی Assistant، پاسخ عمومی به‌صورت شبیه‌سازی‌شده ارائه می‌شود. پس از اتصال مدل زبانی، این بخش توسط AI پاسخ داده خواهد شد.",
      };
    }

    return {
      type: "general",
      criteria: null,
      message:
        "می‌توانم برای پیدا کردن پزشک، تخصص، کلینیک و نوبت‌های آزاد به شما کمک کنم.",
    };
  }
}