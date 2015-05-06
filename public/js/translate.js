var translate = (function(dict) {


  var dictCheck = function(word, texObj, file) {
    var modeStack = texObj.modeStack.slice(0);
    //    var modeStack = context.modeStack.slice(0);

    var result = prioritySearch(word, file) ||
      findInMode(word, modeStack[modeStack.length - 1], modeStack, file.modeStack) ||
      finalSearch(word, file)

    return new WordItem(word, result.type, result)

  };

  var findInMode = function(word, mode, modeStack) {
    //    console.log(word, mode, modeStack)
    for (var item in mode) {
      var words = mode[item].words;
      if (words && words.indexOf(word) !== -1) {
        return mode[item]
      }
      if (mode[item].type === 'mode') {
        console.log('is mode')
      }
    }
    for (var item in mode) {
      var rxp = mode[item].rxp;
      if (rxp && rxp.test(word) === true) {
        return mode[item]
      }
    }
    // 2 prevents seraching in dict normal
    if (modeStack && modeStack.length > 1) {
      modeStack.pop();
      return findInMode(word, modeStack[modeStack.length - 1], modeStack);
    } else {
      return null
    }
  };

  var finalSearch = function(word, file) {
    var mode = file.get('mode')
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
    if (mode === 'text') {
      return {
        type: 'text',
        tex: word
      }
    }
    return {
      type: 'none'
    }
  };

  var prioritySearch = function(word, file) {
    var commands = dict.commands
    for (var command in commands) {
      if (commands[command].words.indexOf(word) !== -1) {
        return {
          type: 'func',
          tex: '',
          func: commands[command].func,
          args: commands[command].args
        }
      }
    }

    var mode = file.get('mode')
    if (mode === 'pause') {
      return {
        type: 'none',
        tex: ''
      }
      console.log('PAUSE, no inputs accepted')
    }

    if (!isNaN(word)) return {
      type: 'number',
      tex: word
    }

    var result = findInMode(word, dict.priority)
    if (result) {
      return result
    }

    if (dict.endBlock.indexOf(word) !== -1) {
      return {
        type: 'end',
        tex: ''
      }
    }

    return null
  };

  function InputEnd() {
    this.word = '#END#'
    this.tex = ''
    this.type = 'InputEnd'
    this.item = ''
  }

  function WordItem(word, type, obj) {
    this.tex = ''
    this.type = type || 'none'
    this.word = word
    this.item = null
    if (type !== 'none') {
      this.tex = obj.tex
      this.item = obj
    }
    if (type === 'text' || type === 'number') {
      this.tex = word + ' '
    }
    this.func = obj.func || undefined
    this.args = obj.args || undefined
  }
  var determineMode = function(word, file) {
    var found = findInMode(word, dict.normal)
    if (found) {
      file.set('mode', found.name)
      return {
        mode: new WordItem(word, 'mode', found)
      }
    }

    for (var mode in dict.modes) {
      var found = findInMode(word, dict.modes[mode])
      if (found) {
        file.set('mode', mode)
        return {
          mode: new WordItem(word, 'mode', dict.modes[mode]),
          found: new WordItem(word, found.type, found)
        }
      }
    }
  }

  var fitWord = function(elem, texObj, file) {
    var current = texObj.current;
    var modeStack = texObj.modeStack

    //removes the expectation when cursor not empty
    if (current[current.cursor].length && current.expect) {
      var index = current.expect.indexOf(current.cursor)
      if (index !== -1) {
        current.expect.splice(index, 1)
      }
    }

    if (elem.item && elem.item.func && elem.type !== 'modifier') {
      console.log('in-dict function running ', elem)
      elem.item.func()
        //if args, create temp obj and wait for args, if complete, call function
    }

    if (elem.type === 'mode') {
      var result = {
        tex: elem.tex,
        mode: elem.item,
        data: [],
        expect: ['##'],
        cursor: 'data',
        parent: texObj.current
      };

      texObj.data.push(result);
      texObj.current = result;

      file.set('mode', elem.item.name)
        //clear stack and add mode dictionary
      modeStack = [dict.normal]
      texObj.modeStack = modeStack
      modeStack.push(elem.item);
      //close previous, push to main obj array, set cursor, update stack
    }


    if (elem.type === 'override') {
      var result = elem
      modeStack.push(elem.item);
      //fit at cursor, create new obj if needed
    }

    if (elem.type === 'modifier') {
      console.log(elem)
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
      //      var result = {
      //        tex: elem.tex,
      //        mode: elem.item,
      //        data: [],
      //        expect: [],
      //        cursor: elem.item.cursor || 'data',
      //        parent: current
      //      };
      var result = elem;
      elem.data = []
      elem.expect = []
      elem.cursor = elem.item.cursor || 'data'
      elem.parent = current

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
      //      IS THIS EVEN NEEDED ? 
      //      if (elem.item.cursor) {
      //        modeStack.push(elem.item.cursor)
      //      }
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




  var extractTex = function(obj, file) {
    //mark cursor position
    var mode = file.get('mode')
    var atCursor = obj.current[obj.current.cursor]
    var visualCursor = '\\class{cursor}{ \\heartsuit }'
    if (mode === 'text') {
      visualCursor = '$' + visualCursor + '$'
    }
    atCursor.push(visualCursor)

    var extractArr = function(arr) {
      if (arr.constructor === [].constructor && arr.length > 0) {
        return arr.reduce(function(a, b) {
          a += ' '
          return (typeof b === 'string') ? a + b : a + extractObj(b)
        }, '')
      } else {
        console.log('warning: expected to be an array ', arr)
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
            return (obj[a] && obj[a].length > 0) ? extractArr(obj[a]) : a
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

  var applyElem = function(curr, arr, texObj) {
    var prev = arr[arr.length - 1]
    if (prev && ['override', 'modifier'].indexOf(prev.type) !== -1) {
      texObj.modeStack.pop()
    }

    if (prev && prev.type === 'letter' && curr.type === 'number') {
      curr.tex = '_{ ' + curr.tex + ' }'
      curr.type = 'operator' // change this later on 
      arr.push(curr);
    } else if (prev && prev.type === 'number' && curr.type === 'number') {
      //multiword numbers(90 3 -> 93)
      if (prev.tex === '0' || prev.tex === 0) {
        //make fractions from 0 34 -> 0.34
        prev.tex += '.' + curr.tex
        prev.word += ' ' + curr.wrod
      } else {
        prev.tex += curr.tex
        prev.word += ' ' + curr.wrod
      }
    } else if (prev && prev.type === 'modifier' && curr.type === 'letter') {
      console.log(prev, curr)
      if (prev.func) {
        prev.func(curr)
      }
      arr.push(curr);
    } else if (prev && curr.type === 'override') {
      // lesser equal, '<' -> \\leq
      prev.tex = curr.tex
      prev.word += ' ' + curr.word
    } else {
      arr.push(curr);
    }
  }

  var remove = function(texObj, amount, file) {
    //      texObj.translArr.length - 1
    var currArr = texObj.current[texObj.current.cursor]
    if (currArr.length > 0) {
      currArr.pop()
    } else {
      if (texObj.current.parent) {
        texObj.current = texObj.current.parent
        amount++
      } else {
        texObj.current = texObj
      }
    }
    if (--amount) {
      remove(texObj, amount, file)
    } else {
      var tex = extractTex(texObj, file)
      texObj['text'] = tex
    }
  }

  var arrToObj = function(texObj, arr, file) {
    console.log('parsing array input: ', texObj, arr)
    var i = 0
    var len = arr.length
    while (i < len) {
      texObj.translArr.push(arr[i])
      fitWord(arr[i++], texObj, file)
    }
    var tex = extractTex(texObj, file)
    texObj['text'] = tex
  }

  var applyFun = function(elem, file) {
    if (elem.args.length === 0) {
      file[elem.func].call(file)
    } else {
      file.set({
        'mode': 'func',
        'func': file[elem.func],
        'args': elem.args
      })
    }
  }

  var applyArgs = function(arg, file) {
    func = file.get('func')
    if (func.length === 1) {
      console.log('running command func', arg)
      func.call(file, arg)
      file.set({
        'mode': file.get('prevmode'),
        'func': null,
        'args': []
      })
    } else {
      file.attributes.args.pop()
      file.set({
        'func': file.get('func').bind(file, arg),
      })
    }
  }

  var translate = function(texObj, textInput, file) {
    var history = false
    var translArr = texObj.translArr
    var newInput = textInput.trim().split(/\s+/);

    newInput.forEach(function(word) {
      if (file.get('mode') === 'func') {
        applyArgs(word, file)
      } else if (file.get('mode') === 'none') {
        var res = determineMode(word, file)
        if (res) {
          history = true
          applyElem(res.mode, translArr, texObj)
          fitWord(translArr[translArr.length - 1], texObj, file);
          if (res.found) {
            applyElem(res.found, translArr, texObj)
            fitWord(translArr[translArr.length - 1], texObj, file);
          }
        }
      } else {
        var elem = dictCheck(word, texObj, file);
        if (elem.type === 'func') {
          applyFun(elem, file)
        } else {
          history = true
          var prevLength = translArr.length
          applyElem(elem, translArr, texObj)
            //fit only if array length increased
          if (prevLength !== translArr.length) {
            fitWord(translArr[translArr.length - 1], texObj, file);
          }
        }
      }
    });

    //mark input pauses
    translArr.push(new InputEnd());

    console.log(texObj);
    //    console.log('translateArr');
    //    console.log(file.translArr);
    var tex = extractTex(texObj, file)
    texObj['text'] = tex
    return history
  };

  return {
    input: translate,
    arrToObj: arrToObj,
    remove: remove,
  }
})(dict_PL);
