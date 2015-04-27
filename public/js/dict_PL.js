var dict_PL = (function() {
  var dict = {};
  dict.lang = 'pl-PL';

  dict.modes = {
    math: {
      tex: '$$ { ## } $$',
      type: 'mode',
      words: ['matematyka', 'matematyczny'],
      end: {
        type: 'end',
        words: ['koniec', 'normal', 'escape']
      },

      plus: {
        tex: '+',
        type: 'operator',
        words: ['+', 'plus', 'dodać']
      },

      minus: {
        tex: '-',
        type: 'operator',
        words: ['-', 'minus', 'odejmij', 'odjąć']
      },

      equal: {
        tex: '=',
        type: 'character',
        words: ['=', 'równa', 'równe']
      },

      not: {
        tex: '',
        words: ['nie'],
        type: 'modifier',
        neq: {
          tex: '\\neq',
          type: 'character',
          words: ['!=', 'równe', 'równa']
        },
      },

      greater: {
        type: 'character',
        words: ['>', 'większe'],
        equal: {
          tex: '//geq',
          type: 'character',
          words: ['=', 'równe', 'równa']
        },
        default: {
          tex: '>',
          type: 'character',
        }
      },

      lesser: {
        type: 'character',
        words: ['<', 'mniejsze'],
        equal: {
          tex: '\\leq',
          type: 'character',
          words: ['=', 'równe', 'równa']
        },
        default: {
          tex: '>',
          type: 'character',
        }
      },

      percent: {
        tex: '%',
        type: 'character',
        words: ['%', 'procent', 'procentów']
      },

      division: {
        tex: '{\\frac { #_block } { ## } }',
        type: 'block',
        words: ['przez', 'podzielone'],
        banned: {
          tex: '',
          words: ['przez', 'na']
        },
      },

      multiplication: {
        tex: '*',
        type: 'operator',
        words: ['*', 'mnożenie', 'razy', 'pomnożone', 'pomnożyć'],
        banned: {
          tex: '',
          words: ['przez']
        },
      },

      frac: {
        tex: '{\\frac { #numerator } { #denominator } }',
        cursor: '#numerator',
        type: 'block',
        words: ['\\', 'ułamek', 'kreska'],
        denominator: {
          type: '#denominator',
          words: ['mianownik', 'mianowniku'],
        },
        numerator: {
          type: '#numerator',
          words: ['licznik', 'liczniku'],
        },
      },

      sqrt: {
        tex: '{\\sqrt [ #root ] { #data } }',
        cursor: '#data',
        type: 'block',
        words: ['\\sqrt', 'pierwiastek', 'pierwiastków', 'pierwiastki'],
        root: {
          type: '#root',
          words: ['stopnia', 'stopien', 'stopniu']
        },
        block: {
          type: '#data',
          words: ['z', 'Z'],
        },
      },

      index: {
        tex: '_{ ## }',
        type: 'block',
        words: ['indeks', 'indeksem'],
      },

      power: {
        tex: '^{ ## }',
        type: 'block',
        words: ['potęga', 'potęgi'],
      },

      square: {
        tex: '^{2}',
        type: 'operator',
        words: ['kwadrat', 'kwadratu'],
      },

      brace: {
        tex: '( ## )',
        type: 'block',
        words: ['(', 'nawias', 'nawiasie', 'nawiasie'],
        end: {
          type: 'end',
          words: ['koniec', 'za']
        }
      },

      sum: {
        tex: '{\\sum ^{ #to } _{ #from } { #where } }',
        cursor: '#from',
        type: 'block',
        words: ['suma'],
        from: {
          type: '#from',
          words: ['od']
        },
        to: {
          type: '#to',
          words: ['do']
        },
        where: {
          type: '#where',
          words: ['gdzie', 'takich']
        },
      },

      bracketBlock: {
        tex: '{ \\left\\{ \\begin{array}{l} ## \\end{array} \\right.}',
        type: 'block',
        words: ['klamra'],
        newline: {
          tex: '\\\\ ',
          type: 'character',
          words: ['dalej', 'nizej']
        },
      },

      logic: {
        tex: '',
        type: '',
        words: [],
      },
      arithmetic: {
        tex: '',
        type: '',
        words: [],
      },
      algebra: {
        tex: '',
        type: '',
        words: [],
      },
      alghoritms: {
        tex: '',
        type: '',
        words: [],
      },
      sets: {
        type: '',
        words: [],
      },
    },

    text: {
      tex: '$$ \\text{ ## } $$',
      type: 'mode',
      words: ['tekstowy', 'tekst'],

      colon: {
        tex: ': ',
        type: 'operator',
        words: ['dwukropek', 'dwukropku']
      },

      newLine: {
        tex: '\\text{ ## } ',
        type: 'block',
        words: ['enter', 'linia', 'linii']
      },

      comma: {
        tex: ', ',
        type: 'operator',
        words: ['przecinek', 'przecinku']
      },

      end: {
        type: 'end',
        words: ['normal', 'escape'],
      },

      text: {
        type: 'text',
        rxp: /.*/
      },
    },

    pause: {
      func: 'pause',
      words: ['pauza', 'przerwij'],
      end: {
        type: 'end',
        func: 'resume',
        words: ['wznów', 'koniec']
      }
    },

  };

  dict.normal = {
    type: 'mode',

    pause: dict.modes.pause,
    math: dict.modes.math,
    text: dict.modes.text,

  };

  dict.commands = {
    pause: {
      func: 'pause',
      args: [],
      words: ['pauza', 'stop', 'przerwij']
    },

    save: {
      func: 'save',
      args: ['name'],
      words: ['zapisz', 'save'],
    },

    load: {
      func: 'load',
      args: ['name'],
      words: ['wczytaj', 'load', 'otwórz'],
    },

    export: {
      func: 'export',
      args: ['name'],
      words: ['eksportuj', 'eksport'],
    },

    back: {
      func: 'back',
      args: [],
      words: ['cofnij', 'wstecz', 'back', 'undo'],
    },

    forward: {
      func: 'forward',
      args: [],
      words: ['dalej', 'przód', 'redo'],
    },

    menu: {
      func: 'showMenu',
      args: [],
      words: ['menu', 'many', 'help'],
    },

    note: {
      func: 'noteMode',
      args: [],
      words: ['notuj', 'notacji', 'notatki', 'notacja'],
    },

    math: {
      func: 'mathMode',
      args: [],
      words: ['matematyka', 'matematyczny', 'obliczenia'],
    },
  };

  dict.endBlock = ['koniec', 'escape', 'esc', '#BREAK#']

  dict.letters = ['A', 'Ą', 'B', 'C', 'Ć', 'D', 'E', 'Ę', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'Ł', 'M', 'N', 'Ń', 'O', 'Ó', 'P', 'Q', 'R', 'S', 'Ś', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Ź', 'Ż', 'a', 'ą', 'b', 'c', 'ć', 'd', 'e', 'ę', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'ł', 'm', 'n', 'ń', 'o', 'ó', 'p', 'q', 'r', 's', 'ś', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ź', 'ż'];

  dict.greekLetters = {
    'alpha': ['alpha', 'alfa'],
    'theta': [],
    'tau': [],
    'beta': [],
    'vartheta': [],
    'pi': [],
    'upsilon': [],
    'gamma': [],
    'iota': [],
    'varpi': [],
    'phi': [],
    'delta': ['delta'],
    'kappa': ['kappa'],
    'rho': [],
    'varphi': [],
    'epsilon': [],
    'lambda': ['lambda'],
    'varrho': [],
    'chi': [],
    'varepsilon': [],
    'mu': [],
    'sigma': [],
    'psi': [],
    'zeta': [],
    'nu': [],
    'varsigma': [],
    'omega': [],
    'eta': [],
    'xi': [],
    'Gamma': [],
    'Lambda': [],
    'Sigma': [],
    'Psi': [],
    'Delta': [],
    'Xi': [],
    'Upsilon': [],
    'Omega': [],
    'Theta': [],
    'Pi': [],
    'Phi': []
  };



  return dict;
})();
