// src/utils/stemmer.js
/**
 * Simple rule-based stemmer for English.
 * Removes common suffixes to reduce words to their root form.
 * Based on Porter algorithm simplified.
 */
function stem(word) {
  if (!word || word.length < 3) return word;

  let w = word.toLowerCase();

  // Step 1: Plurals and past tense - remove common suffixes
  if (w.endsWith('sses')) w = w.slice(0, -2);      // stresses -> stress
  else if (w.endsWith('ies')) w = w.slice(0, -3) + 'y';  // babies -> baby
  else if (w.endsWith('ss')) w = w;                 // pass -> pass (no change)
  else if (w.endsWith('s')) w = w.slice(0, -1);    // cats -> cat

  // Step 2: Remove -ed, -ing, -ly, -ment, -tion
  if (w.endsWith('ing')) w = w.slice(0, -3);
  else if (w.endsWith('ed')) w = w.slice(0, -2);
  else if (w.endsWith('ly')) w = w.slice(0, -2);
  else if (w.endsWith('ment')) w = w.slice(0, -4);
  else if (w.endsWith('tion')) w = w.slice(0, -3) + 'te'; // e.g., information -> informate (simplified)

  // Step 3: Remove -al, -ance, -ence, -er, -ic, -able, -ible
  if (w.endsWith('al')) w = w.slice(0, -2);
  else if (w.endsWith('ance')) w = w.slice(0, -4);
  else if (w.endsWith('ence')) w = w.slice(0, -4);
  else if (w.endsWith('er')) w = w.slice(0, -2);
  else if (w.endsWith('ic')) w = w.slice(0, -2);
  else if (w.endsWith('able')) w = w.slice(0, -4);
  else if (w.endsWith('ible')) w = w.slice(0, -4);

  // Step 4: Remove -e at end (if long enough)
  if (w.endsWith('e') && w.length > 4) w = w.slice(0, -1);

  // Step 5: Handle double consonants (e.g., running -> run)
  if (w.length > 3 && w[w.length-1] === w[w.length-2] && !isVowel(w[w.length-1])) {
    w = w.slice(0, -1);
  }

  return w;
}

function isVowel(ch) {
  return 'aeiou'.includes(ch);
}

module.exports = { stem };