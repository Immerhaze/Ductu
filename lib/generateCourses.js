function buildDefaultActiveLevels() {
  return ["B1","B2","B3","B4","B5","B6","B7","B8","M1","M2","M3","M4"];
}

function buildSections(sectionNaming, sectionCount) {
  if (sectionCount < 1) return [];
  if (sectionNaming === "NUMBERS") {
    return Array.from({ length: sectionCount }, (_, i) => String(i + 1));
  }
  // LETTERS
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  return letters.slice(0, Math.min(sectionCount, letters.length));
}

function parseLevel(levelCode) {
  // B1..B8 | M1..M4
  const type = levelCode.startsWith("B") ? "BASIC" : "MIDDLE";
  const levelNumber = Number(levelCode.slice(1));
  return { levelType: type, levelNumber };
}

function courseName({ levelCode, levelType, levelNumber, section, nameFormat }) {
  if (nameFormat === "COMPACT") {
    if (levelType === "BASIC") return `${levelNumber}${section}`; // 7A
    return `${levelNumber}M${section}`; // 1MA
  }

  if (nameFormat === "HUNDREDS") {
    // Solo para MEDIA: 1M => 101/102..., 2M => 201/202...
    if (levelType === "MIDDLE") {
      const base = levelNumber * 100; // 1->100,2->200...
      const sectionIndex = section.match(/^\d+$/) ? Number(section) : (section.charCodeAt(0) - 64); // A=1,B=2...
      return String(base + sectionIndex); // 101,102...
    }
    // Básica fallback
    return `${levelNumber}${section}`;
  }

  // CHILE_TRADITIONAL
  if (levelType === "BASIC") return `${levelNumber}° ${section}`;      // 7° A
  return `${levelNumber}° Medio ${section}`;                            // 1° Medio A
}
