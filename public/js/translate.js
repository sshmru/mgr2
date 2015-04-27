var translate = (function(dict) {


  var dictCheck = function(word, texObj) {
    var modeStack = texObj.modeStack.slice(0);
    //    var modeStack = context.modeStack.slice(0);

    var result = prioritySearch(word) ||
      findInMode(word, modeStack[modeStack.length - 1], modeStack) ||
      finalSearch(word)

    return new WordItem(word, result.type, result)

  };

  var findInMode = function(word, mode, modeStack) {
    for (var item in mode) {
      var words = mode[item].words;
      if (words && words.indexOf(word) !== -1) {
        return mode[item]
      }
    }
    for (var item in mode) {
      var rxp = mode[item].rxp;
      if (rxp && rxp.test(word) === true) {
        return mode[item]
      }
    }
    if (modeStack.length > 1) {
      modeStack.pop();
      return findInMode(word, modeStack[modeStack.length - 1], modeStack);
    } else {
      return null
    }
  };

  var finalSearch = function(word, mode) {
    if (dict.letters.indexOf(word) !== -1) {
      return {
        type: 'letter',
        tex: word
      }
    }
    var greekLetters = dict.greekLetters
    for (var letter in greekLetters) {
      if (greekLetters[letter].indexOf(word) !== -1) {
        return {
          type: 'letter',
          tex: '{\\' + letter + '}'
        }
      }
    }
    //    if (mode === 'note') {
    //      return new Txt(word);
    //    }
    return {
      type: 'none'
    }
  };

  var prioritySearch = function(word, mode) {
    //    if (mode === 'pause') {
    //      if (dict.modes.pause.resume.words.indexOf(word) !== -1) {
    //        return new Func(word, 'resume', [])
    //      } else {
    //        return new Nil(word)
    //      }
    //    }

    if (!isNaN(word)) return {
      type: 'number',
      tex: word
    }

    if (dict.endBlock.indexOf(word) !== -1) {
      console.log('END BLOCK HIT')
      return {
        type: 'end',
      }
    }

    //    var commands = dict.commands
    //    for (var command in commands) {
    //      if (commands[command].words.indexOf(word) !== -1) {
    //        return new Func(word, commands[command].func, commands[command].args);
    //      }
    //    }

    return null
  };

  function InputEnd() {
    return {
      word: '',
      tex: '',
      type: 'InputEnd',
      item: ''
    };
  }

  function WordItem(word, type, obj) {
    this.tex = ''
    this.type = type || 'none'
    this.word = word,
      this.item = null
    if (type !== 'none') {
      this.tex = obj.tex,
        this.item = obj
    }
    if (type === 'text') {
      this.tex = word
    }
  }

  var fitWord = function(elem, texObj) {
    console.log(elem)
    var current = texObj.current;
    var modeStack = texObj.modeStack

    //removes the expectation when cursor not empty
    if (current[current.cursor].length && current.expect) {
      current.expect.splice(current.expect.indexOf(current.cursor), 1);
    }

    if (elem.type === 'mode') {
      var result = {
        tex: elem.tex,
        mode: elem.item,
        data: [],
        expect: ['##'],
        cursor: 'data'
      };

      texObj.data.push(result);
      texObj.current = result;

      //clear stack and add mode dictionary
      modeStack = [dict.normal]
      texObj.modeStack = modeStack
      modeStack.push(elem.item);
      //close previous, push to main obj array, set cursor, update stack
    }

    if (elem.func) {
      //if args, create temp obj and wait for args, if complete, call function
    }

    if (elem.type === 'override') {
      var result = elem
      modeStack.push(elem.item);
      //fit at cursor, create new obj if needed
    }

    if (elem.type === 'modifier') {
      var result = elem
      modeStack.push(elem.item);
      //fit at cursor, create new obj if needed
    }

    if (['number', 'character', 'operator', 'letter', 'text'].indexOf(elem.type) !== -1) {
      var result = elem
      current[current.cursor].push(result);
      if (elem.item) {
        modeStack.push(elem.item);
      }
      //fit at cursor, create new obj if needed
    }

    if (elem.type === 'block') {
      var result = {
        tex: elem.tex,
        mode: elem.item,
        data: [],
        expect: [],
        cursor: elem.item.cursor || 'data',
        parent: current
      };

      //expectations array - push everything starting with # to expectations
      elem.tex.match(/#[^\s]*/g).forEach(function(a) {
        if (a[1] === '_') {
          result[a] = [];
          result[a].push(current[current.cursor].pop())
        } else {
          result.expect.push(a);
          result[a] = []
        }
      });
      //pull arguments

      current[current.cursor].push(result);
      modeStack.push(elem.item);
      if (elem.item.cursor) {
        modeStack.push(elem.item.cursor)
      }
      texObj.current = result;
      //close previous, push to main obj array, set cursor, update stack
    }

    if (elem.type[0] === '#') {
      modeStack.pop();
      //searches down the object for occurrences
      var saveCurrent = current
      var saveModeStack = modeStack.slice(0)
      while (current && current.expect && current.expect.indexOf(elem.type) === -1) {
        texObj.current = current.parent;
        current = texObj.current;
        modeStack.pop();
      }
      if (!current) {
        texObj.current = saveCurrent
        current = saveCurrent
        while (saveModeStack.length) {
          modeStack.push(saveModeStack.shift())
        }
      }

      modeStack.push(elem.item);
      if (!current[elem.type]) {
        current[elem.type] = [];
      }
      current.cursor = elem.type;
      //fit nearest block of given name, close all on its way
    }

    if (elem.type === 'end') {
      if (current.parent) {
        texObj.current = current.parent;
        current = texObj.current;
      }
      modeStack.pop();
      //move cursor down to parent
    }

    if (elem.type === 'none') {
      //dont apply at all unless mode set to 'note all
    }

  };




  var extractTex = function(obj) {
    //mark cursor position
    var atCursor = obj.current[obj.current.cursor]
    atCursor.push('\\heartsuit')

    var extractArr = function(arr) {
      if (arr.constructor = [].constructor && arr.length > 0) {
        return arr.reduce(function(a, b) {
          a += ' '
          return (typeof b === 'string') ? a + b : a + extractObj(b)
        }, '')
      } else {
        console.log('error, object is not an array')
        return ''
      }

    }

    var extractObj = function(obj) {
      if (typeof obj === 'undefined') {
        return ''
      }
      var result = obj.tex.split(' ').map(function(a) {
        if (a[0] === '#') {
          if (a === '##') {
            return extractArr(obj.data)
          } else {
            return (obj[a].length > 0) ? extractArr(obj[a]) : a
          }
        }
        return a;
      }).join(' ')

      return result
    }

    var fixTex = function(str) {
      if (str.indexOf('#') !== -1) {
        str = str.split(' ').map(function(a, index, arr) {
          if (a[0] === '#') {
            //if (arr[index - 1][arr[index - 1].length - 1] === '[' && arr[index + 1][0] === ']') {
            if (/\[$/.test(arr[index - 1]) && /^\]/.test(arr[index + 1])) {
              return '';
            } else {
              return '{\\text{' + a + '}}'
            }

          } else {
            return a
          }
        }).join(' ')
      }
      return str;
    }

    var result = fixTex(extractObj(obj))

    //remove cursor marker from obj
    atCursor.pop();

    return result;

  }

  var applyElem = function(curr, arr) {
    var prev = arr[arr.length - 1]
    if (prev && prev.type === 'letter' && curr.type === 'number') {
      curr.tex = '_{ ' + curr.tex + ' }'
      curr.type = 'operator' // change this later on 
      arr.push(curr);
    } else if (prev && prev.type === 'number' && curr.type === 'number') {
      //make fractions from 0 34 -> 0.34
      if (prev.tex === '0' || prev.tex === 0) {
        prev.tex += '.' + curr.tex
        prev.word += ' ' + curr.wrod
      } else {
        prev.tex += curr.tex
        prev.word += ' ' + curr.wrod
      }
    } else if (prev && curr.type === 'override') {
      // lesser -> equal, '<' -> \\leq
      prev.tex = curr.tex
      prev.word += ' ' + curr.wrod
    } else {
      arr.push(curr);
    }
  }

  var translate = function(texObj, textInput) {
    var translArr = texObj.translArr

    var newInput = textInput.trim().split(/\s+/);
    newInput.forEach(function(word) {
      var elem = dictCheck(word, texObj);
      var prevLength = translArr.length
      applyElem(elem, translArr)
        //fit only if array length increased
      if (prevLength !== translArr.length) {
        fitWord(translArr[translArr.length - 1], texObj);
      }
    });

    //mark input pauses
    translArr.push(new InputEnd());

    console.log('translateObj: ');
    console.log(texObj);
    //    console.log('translateArr');
    //    console.log(file.translArr);
    var tex = extractTex(texObj)
    console.log('result text: ')
    console.log(tex)
    texObj['text'] = tex

  };

  return translate;
})(dict_PL);
