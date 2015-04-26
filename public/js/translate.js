var translate = (function(dict) {


  var dictCheck = function(word, texObj) {
    var modeStack = texObj.modeStack.slice(0);
    //    var modeStack = context.modeStack.slice(0);


    var findInMode = function(word, mode) {
      for (var item in mode) {
        var words = mode[item].words;
        if (words && words.indexOf(word) !== -1) {
          console.log(word);
          return {
            word: word + ' ',
            func: mode[item].func,
            type: mode[item].type,
            item: mode[item],
            tex: mode[item].tex
          };
        }
      }
      for (var item in mode) {
        var rxp = mode[item].rxp;
        if (rxp && rxp.test(word) === true) {
          return {
            word: word + ' ',
            func: mode[item].func,
            type: mode[item].type,
            item: mode[item],
            tex: mode[item].tex
          };
        }
      }
      if (modeStack.length > 1) {
        modeStack.pop();
        return findInMode(word, modeStack[modeStack.length - 1]);
      } else {
        return 0;
      }
    };


    return findInMode(word, modeStack[modeStack.length - 1]);
  };

  function InputEnd() {
    return {
      word: '',
      tex: '',
      type: 'InputEnd',
      item: ''
    };
  }


  function WordItem(word, texObj) {
    var elem = {
      word: word + ' ',
      tex: '',
      type: 'none',
      item: ''
    };
    if (!isNaN(word)) {
      elem.type = 'number';
      elem.tex = word;
      return elem;
    } else {
      //might be broken number transcript
      for (var item in dict.numbers) {
        if (dict.numbers[item].words.indexOf(word) !== -1) {
          elem.type = "number";
          elem.tex = item;
          return elem;
        }
      }

      var dictItem = dictCheck(word, texObj);
      if (dictItem) {
        elem = dictItem;
      }
    }

    return elem;
  }


  var fitWord = function(elem, texObj) {
    var current = texObj.current;
    var modeStack = texObj.modeStack

    console.log('-------------------------------------------------')
    console.log(current.cursor)
    console.log(current[current.cursor])
    console.log('-------------------------------------------------')
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

    if (['number', 'character', 'operator', 'letter', 'text'].indexOf(elem.type) !== -1) {
      var result = elem.tex || elem.word;
      current[current.cursor].push(result);
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
      while (current && current.expect && current.expect.indexOf(elem.type) === -1) {
        texObj.current = current.parent;
        current = texObj.current;
        modeStack.pop();
      }
      modeStack.push(elem.item);
      if (!current[elem.type]) {
        current[elem.type] = [];
      }
      current.cursor = elem.type;
      //fit nearest block of given name, close all on its way
    }

    if (elem.type === 'end') {
      texObj.current = current.parent;
      current = texObj.current;
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
            if (arr[index - 1][arr[index - 1].length - 1] === '[' && arr[index + 1][0] === ']') {
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
      arr.push(curr);
    } else if (prev && prev.type === 'number' && curr.type === 'number') {
      prev.tex += curr.tex
    } else {
      arr.push(curr);
    }
  }

  var translate = function(texObj, textInput) {
    var translArr = texObj.translArr

    var newInput = textInput.trim().split(/\s+/);
    newInput.forEach(function(word) {
      var elem = new WordItem(word, texObj);
      applyElem(elem, translArr)
        //file.translArr.push(elem);
      fitWord(translArr[translArr.length - 1], texObj);
    });

    //mark input pauses
    translArr.push(new InputEnd());

    console.log('translateObj: ');
    console.log(texObj);
    //    console.log('translateArr');
    //    console.log(file.translArr);
    var text = extractTex(texObj)
    console.log('result text: ')
    console.log(text)
    texObj['text'] = text

  };

  return translate;
})(dict_PL);
