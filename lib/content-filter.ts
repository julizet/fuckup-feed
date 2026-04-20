/**
 * Content filter — blocks hateful, racist, homophobic, and dehumanising language.
 * The purpose of this platform is to give a voice to people who are mistreated.
 * We must prevent the platform itself from being used to spread the very hate it opposes.
 *
 * Includes terms in German, English, and common transliterations.
 */

const BLACKLIST: string[] = [
  // German racist / Nazi terms
  'neger', 'nigger', 'nigga', 'negro', 'zigeuner', 'judensau', 'jude raus',
  'nazi', 'nazis', 'heil hitler', 'sieg heil', 'dritter reich', 'nsdap',
  'ausländer raus', 'kanake', 'kanaken', 'kümmeltürke', 'kameltreiber',
  'schlitzauge', 'bimbo', 'wog', 'spic', 'spick', 'chink', 'gook',
  // Homophobic / transphobic
  'schwuchtel', 'tunte', 'warmer bruder', 'transe', 'shemale',
  'faggot', 'fag', 'dyke', 'tranny',
  // Sexist / misogynist (extreme forms)
  'schlampe', 'nutte', 'hure', 'hurensohn',
  // General extreme hate
  'untermenschen', 'untermensch', 'drecksjude', 'judenpest', 'holocaust leugner',
  'white power', 'white supremacy', 'kkk', 'ku klux klan', 'aryan nation',
  'ethnic cleansing', 'genocide',
]

/** Normalise a string: lower-case, remove diacritics, collapse spaces */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // strip diacritics
    .replace(/[^a-z0-9\s]/g, ' ')    // punctuation → space
    .replace(/\s+/g, ' ')
    .trim()
}

export interface FilterResult {
  blocked: boolean
  matches: string[]
}

export function filterContent(...fields: string[]): FilterResult {
  const combined = normalise(fields.join(' '))
  const matches: string[] = []

  for (const term of BLACKLIST) {
    const normTerm = normalise(term)
    // word-boundary match (space or start/end)
    const regex = new RegExp(`(^|\\s)${normTerm.replace(/\s+/g, '\\s+')}(\\s|$)`)
    if (regex.test(combined)) {
      matches.push(term)
    }
  }

  return {
    blocked: matches.length > 0,
    matches,
  }
}
