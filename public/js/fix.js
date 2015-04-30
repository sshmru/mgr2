var fixInput = function(word) {
  word = word.trim();
  if (!isNaN(word)) {
    if (/^0\d+$/.test(word)) return '0.' + word.substr(1, word.length);
    return word;
  }
  var fixes = {
    0: ['zerowy', 'zerowej', 'zero', 'zerowego'],
    1: ['pierwszy', 'pierwszej', 'jeden', 'pierwszego'],
    2: ['drugi', 'drugiej', 'dwa', 'drugiego', 'o2'],
    3: ['trzeci', 'trzeciej', 'trzy', 'trzeciego', 'trzech'],
    4: ['czwarty', 'czwartej', 'cztery', 'czwartego'],
    5: ['piąty', 'piątej', 'pięć', 'piątego'],
    6: ['szósty', 'szóstej', 'sześć', 'szóstego'],
    7: ['siódmy', 'siódmej', 'siedem', 'siódmego'],
    8: ['ósmej', 'ósmej', 'osiem', 'ósmego'],
    9: ['dziewiąty', 'dziewiątej', 'dziewięć', 'dziewiątego'],
    10: ['dziesiąty', 'dziesiątej', 'dziesięć', 'dziesiątego'],
    11: ['jedenasty', 'jedenastej', 'jedenascie', 'jedenastego'],
    12: ['dwunasty', 'dwunastej', 'dwanaście', 'dwunastego'],
    13: ['trzynasty', 'trzynastej', 'trzynaście', 'trzynstego'],
    14: ['czternasty', 'czernastej', 'czternaście', 'czternastego'],
    15: ['piętnasty', 'piętnastej', 'piętnaście', 'piętnastego'],
    16: ['szesnasty', 'szesnastej', 'szesnaście', 'szesnastego'],
    17: ['osiemnasty', 'osiemnastej', 'osiemnaście', 'osiemnastego'],
    18: ['siedemnasty', 'siedemnastej', 'siedemnaście', 'siedemnastego'],
    19: ['dziewiętnasty', 'dziewiętnastej', 'dziewiętnaście', 'dziewiętnastego'],
    20: ['dwudziesty', 'dwudziestej', 'dwadzieścia', 'dwudziestego'],
    30: ['trzydziesty', 'trzydziestej', 'trzydzieści', 'trzydziestego '],
    40: ['czterdziesty', 'czterdziestej', 'czterdzieści', 'czterdziestego'],
    50: ['pięćdziesiąty', 'pięćdziesiątej', 'pięćdziesiąt', 'pięćdziesiątego'],
    60: ['sześćdziesiąty', 'sześćdziesiątej', 'sześćdziesiąt', 'sześćdziesiątego'],
    70: ['siedemdziesiąty', 'siedemdziesiątej', 'siedemdziesiąt', 'siedemdziesiątego'],
    80: ['osiemdziesiąty', 'osiemdziesiątej', 'oiemdziesiąt', 'osiemdziesiątego'],
    90: ['dziewięćdziesiąty', 'dziewięćdziesiątej', 'dziewięćdziesiąt', 'dziewięćdziesiątego'],
    100: ['setny', 'setnej', 'sto', 'setnego'],
    '2 pi r': ['o2pl'],
    'pi r kwadrat': ['prawda2']
  };
  for (var entry in fixes) {
    if (fixes[entry].indexOf(word) !== -1) return entry;
  }
  if (/\d/.test(word)) return word.replace(/[a-zZ-Z]+/g, function(a) {
    return ' ' + a + ' ';
  }).trim();
  return word;
};
