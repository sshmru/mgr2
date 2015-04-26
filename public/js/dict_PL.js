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
        end: {
          type: 'end',
          words: ['koniec']
        }
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
          end: {
            type: 'end',
            words: ['koniec']
          }
        },
        numerator: {
          type: '#numerator',
          words: ['licznik', 'liczniku'],
          end: {
            type: 'end',
            words: ['koniec']
          }
        },
        end: {
          type: 'end',
          words: ['koniec']
        }
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
        end: {
          type: 'end',
          words: ['koniec']
        }
      },

      index: {
        tex: '_{ ## }',
        type: 'block',
        words: ['indeks', 'indeksem'],
        end: {
          type: 'end',
          words: ['koniec']
        }
      },

      power: {
        tex: '^{ ## }',
        type: 'block',
        words: ['potęga', 'potęgi'],
        end: {
          type: 'end',
          words: ['koniec']
        }
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
        end: {
          type: 'end',
          words: ['koniec']
        }
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
        end: {
          type: 'end',
          words: ['koniec']
        }
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
      tex: '\n ## \n',
      type: 'mode',
      words: ['tekstowy', 'tekst'],

      colon: {
        tex: ': ',
        type: 'text',
        words: ['dwukropek', 'dwukropku']
      },

      newLine: {
        tex: ' \n ',
        type: 'text',
        words: ['enter', 'linia', 'linii']
      },

      comma: {
        tex: ', ',
        type: 'text',
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



    showMenu: {
      func: 'showMenu',
      words: ['menu'],
    },

    changeMode: {
      func: 'changeMode',
      words: ['tryby', 'tryb'],
    },

    listFiles: {
      func: 'lisFiles',
      words: ['pliki', 'plików'],
    },

    newFile: {
      func: 'newFile',
      words: ['nowy'],
    },

    save: {
      func: 'save',
      words: ['zapisz'],
    },

    undo: {
      func: 'undo',
      words: ['cofnij'],
    },

    redo: {
      func: 'redo',
      words: ['powtórz'],
    },

    find: {
      func: 'find',
      words: ['znajdź', 'szukaj'],
    },

    goTo: {
      func: 'goTo',
      words: ['idź', 'skocz'],
    },

    letters: {
      type: 'letter',
      words: ['A', 'Ą', 'B', 'C', 'Ć', 'D', 'E', 'Ę', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'Ł', 'M', 'N', 'Ń', 'O', 'Ó', 'P', 'Q', 'R', 'S', 'Ś', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Ź', 'Ż', 'a', 'ą', 'b', 'c', 'ć', 'd', 'e', 'ę', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'ł', 'm', 'n', 'ń', 'o', 'ó', 'p', 'q', 'r', 's', 'ś', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ź', 'ż']
    },

    greekLetters: {
      type: 'greekLetter',
      words: ["alpha", "thetao", "tau", "beta", "vartheta", "pi", "upsilon", "gamma", "gamma", "varpi", "phi", "delta", "kappa", "rho", "varphi", "epsilon", "lambda", "varrho", "chi", "varepsilon", "mu", "sigma", "psi", "zeta", "nu", "varsigma", "omega", "eta", "xi", "Gamma", "Lambda", "Sigma", "Psi", "Delta", "Xi", "Upsilon", "Omega", "Theta", "Pi", "Phi"]
    },

    //stupid fix for speechrecognition being dumb (dwa -> o2)
  };
  dict.numbers = {
    "2": {
      words: ['dwa', 'o2']
    },
    "3": {
      words: ['trzeciego', 'trzech']
    }
  };




  return dict;
})();
