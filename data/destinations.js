// Works out what Destinations should list, from the site's own destination data.

const contains = (field, word) => (field ?? '').toLowerCase().includes(word.toLowerCase());

/** True when every word of the search is in the destination's name, country or description. */
export function matchesSearch(destination, text) {
  return text
    .trim()
    .split(/\s+/)
    .every((word) =>
      ['name', 'country', 'desc'].some((field) => contains(destination[field], word)),
    );
}

/** The names of these destinations, in their order. */
export const names = (destinations) => destinations.map((d) => d.name);

/** The words of a text, lower case, letters only. */
export const wordsOf = (text) => (text ?? '').toLowerCase().match(/[a-z]+/g) ?? [];

/** Thirty made-up destinations, built from a real one, for more than one page of results. */
export function manyDestinations(real, count = 30) {
  return Array.from({ length: count }, (_, i) => ({
    ...real,
    id: 900000 + i,
    name: `Test destination ${i + 1}`,
  }));
}
