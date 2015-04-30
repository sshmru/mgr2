var dict = dict_PL //jesus this is awful, need 2 remove it asap
var TexRoot = function() {
  this.mode = dict.normal
  this.tex = '##'
  this.current = this
  this.data = []
  this.cursor = 'data' //current input 
  this.modeStack = [dict.normal]
  this.translArr = [] //plays key role to rebuilding object(history)
  this.toTex = function() {
    return this.text
  }
}

var Editor = Backbone.Model.extend({
  defaults: {
    transcr: '',
    currInput: '',
    tex: '',
    mode: 'none',
    prevmode: 'normal'
  },
  initialize: function() {
    var self = this
    this.set('texObj', new TexRoot())

    this.on('change:mode', function(data) {
      console.log(data)
      if (data._previousAttributes.mode !== 'pause') {
        this.set('prevmode', data._previousAttributes.mode)
      }
    })

    var history = [];

    var position = -1;

    //history coudl have been more efficient by just slicing proper part of array to apply
    this.historyPush = function(data) {
      var json = this.toJSON()
      history[++position] = {
        editor: {
          transcr: json.transcr,
          mode: json.mode
        },
        arr: data.attributes.texObj.translArr.slice(0)
      };
      history.length = position + 1;
      console.log('history PUSH', history, position);
    };

    this.back = function() {
      console.log('history BACK', history, position);
      if (position >= 0) {
        var obj = history[--position]
        this.set(obj.editor);
        var to = new TexRoot()
        this.set('texObj', to)

        this.parseArr(obj.arr)
      }
    };

    this.forward = function() {
      console.log('history FORWARD', history, position);
      if (position < history.length - 1) {
        var obj = history[++position]
        this.set(obj.editor);
        var to = new TexRoot()
        this.set('texObj', to)

        this.parseArr(obj.arr);
      }
    };

    this.historyPush(this);

    this.idleTimer.setCB(function() {
      self.input('#TIMEOUT#')
    }, 20000);

  },
  idleTimer: (function() {
    var timer = null
    var cv = function() {}
    var delay = 5000
    var idleTimer = {
      start: function() {
        timer = window.setTimeout(function() {
          //      cb()
          //      annoyign during tests --------------------------------------------
        }, delay)
      },
      stop: function() {
        window.clearTimeout(timer)
      },
      setCB: function(newCB, newDelay) {
        cb = newCB || cb
        delay = newDelay || delay
      },
      reset: function(delay) {
        idleTimer.stop()
        idleTimer.start(delay, cb)
      }
    }
    return idleTimer
  })(),

  input: function(textInput) {

    if (textInput !== '#TIMEOUT#') this.idleTimer.reset()

    console.log(textInput)
    textInput = textInput.split(' ').map(
      function(a) {
        return fixInput(a);
      }).join(' ');
    if (textInput[0] !== '#') {
      this.set('currInput', textInput);
    }
    this.set('transcr', (this.get('transcr') ? this.get('transcr') + ' ' + textInput : textInput));
    translate.input(this.attributes.texObj, textInput, this);
    console.log(this.attributes);
    console.timeEnd('search word');
    this.set('tex', this.getTex());
    //would like some fix for multiple useless inputs
    this.historyPush(this); // history only if word had effect
  },
  parseArr: function(arr) {
    translate.arrToObj(this.attributes.texObj, arr);
    this.set('tex', this.getTex());
  },
  getTex: function() {
    return this.attributes.texObj.toTex()
  },

  save: function(name) {
    var self = this;
    (typeof name !== 'undefined') ? this.set('name', name): this.set('name', prompt('name'));
    console.log('save');
    var str = JSON.stringify(compressTranslArr(this.attributes.texObj.translArr));
    window.localStorage[self.attributes.name] = str
  },

  load: function(name) {
    var name = (typeof name !== 'undefined') ? name : prompt('name')
    console.log('load');
    var to = new TexRoot()
    var arr = JSON.parse(window.localStorage[name]);
    var to = new TexRoot()
    arr = uncompressTranslArr(arr)
    this.parseArr(arr)
  },

  getArg: function() {
    var args = Array.prototype.slice.call(arguments);
    console.log(args);
    while (args.length) {
      var arg = args.shift();
      if (!this.attributes[arg]) this.set(arg, prompt(arg));
    }
  },

  export: function(name) {
    (typeof name !== 'undefined') ? this.set('name', name): this.set('name', prompt('name'));
    var a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + this.get('tex');
    a.download = this.get('name') + '.tex';
    document.body.appendChild(a);
    a.click();
    a.parentNode.removeChild(a);
  },

  showMenu: function() {
    this.trigger('showMenu', 'showMenu');
  },

  pause: function() {
    if (this.get('mode') !== 'pause') {
      this.set('mode', 'pause');
    } else {
      this.set('mode', this.get('prevmode'));
    }
  },

  resume: function() {
    speech.resumeInput();
    if (this.get('mode') === 'pause') {
      console.log(this.get('prevmode'), 'mode');
      this.set('mode', this.get('prevmode'));
    }
  },

  noteMode: function() {
    this.set('mode', 'note');
    console.log('math mode');
  },

  mathMode: function() {
    this.set('mode', 'math');
    console.log('note mode');
  },
    fontSize: function(num) {
      MathJax.Hub.Queue(function() {
        var math = document.getElementById("editor");
        math.style.fontSize = num + 'px'
        MathJax.Hub.Queue(["Rerender", MathJax.Hub, math]);
      })
      console.log('font size', num)
    }
});


var MenuView = Backbone.View.extend({
  initialize: function() {
    this.model.on('showMenu', function() {
      $('#menuBox').toggle();
    }, this);
  },

  events: {
    'click': 'toggleView',
    'click li': 'menuFunc'
  },

  toggleView: function() {
    $('#menuBox').toggle();
  },

  menuFunc: function(e) {
    var name = e.target.innerHTML;
    console.log(name);
    this.model[name]();
    e.preventDefault();
  },

  render: function() {
    var menuBox = $('<div id="menuBox"><ul>' + '<li>back</li>' +
      '<li>forward</li>' +
      '<li>pause</li>' +
      '<li>resume</li>' +
      '<li>export</li>' +
      '<li>save</li>' + '<li>load</li>' + '</ul></div>');

    this.$el.html('&#x2630');
    this.$el.append(menuBox);
    menuBox.hide();
    return this;
  }
});


var EditorView = Backbone.View.extend({
  initialize: function() {
    this.model.on('change', function() {
      this.render();
      MathJax.Hub.Queue(["Typeset", MathJax.Hub], this.el);
    }, this);
  },

  render: function() {
    this.$el.html(this.model.attributes.tex);
    return this;
  }
});


var InputLine = Backbone.View.extend({
  initialize: function() {
    this.model.on('change', function(data) {
      this.$el.find('input').val(data.attributes.currInput)
      this.$el.find('div').html(data.attributes.mode)
    }, this);
  },
  events: {
    'keydown input': function(ev) {
      if (ev.keyCode === 13) {
        var input = this.$el.find('input').val()
        this.model.input(input)
        this.$el.find('input').val('')
      }
    },
    'focusin input': function(ev) {
      this.$el.find('input').val('')
    },
  },
  render: function() {
    this.$el.html(
      '<input type="text" />' +
      '<div>' + this.model.attributes.mode + '</div>'
    );
    return this;
  }
});


var ed = new Editor({
  //  tex: ''
});


var edv = new EditorView({
  model: ed
});


var menuv = new MenuView({
  model: ed
});

var currIn = new InputLine({
  model: ed
});


function compressTranslArr(arr) {
  var cloned = []

  function cloneObj(obj) {
    var cloned = {}
    if (obj && obj.item && obj.item.path) {
      cloned.item = obj.item.path
    }
    for (var o in obj) {
      if (obj.hasOwnProperty(o)) {
        if (obj[o] && typeof obj[o] === 'object' || o === 'cursor') {
          //
        } else {
          cloned[o] = obj[o]
        }
      }
    }
    return cloned
  }
  arr.forEach(function(a) {
    cloned.push(cloneObj(a))
  })
  return cloned
}

function uncompressTranslArr(arr) {
  function getFrom(obj, str) {
    str = str.match(/\w+/g)
    while (str.length) {
      obj = obj[str.shift()]
    }
    return obj
  }
  return arr.map(function(a) {
    if (a.item) a.item = getFrom(dict, a.item)
    return a
  })
}


$(function() {

  // this one shouldnt be there
  $(window).on('keydown', function(ev) {
    if (ev.keyCode === 27) {
      console.log('break, esc key pressed')
      ed.input('#BREAK#')
    }
  })

  $('#menu').html(menuv.render().el);

  $('#editor').html(edv.render().el);

  $('#currInput').html(currIn.render().el);
  $('#currInput>div>input').focus()


  speech.init(dict, ed);

});
