var dict = dict_PL //jesus this is awful, need 2 remove it asap
var TexRoot = function() {
  this.mode = dict.normal
  this.tex = '##'
  this.current = this
  this.data = []
  this.cursor = 'data'
  this.modeStack = [dict.normal]
  this.translArr = []
  this.input = function(input) {
    this.tex += input
  }
  this.toTex = function() {
    return this.text
  }
}

var Editor = Backbone.Model.extend({
  defaults: {
    transcr: '',
    currInput: '',
    tex: '',
    mode: 'math',
  },
  initialize: function() {
    var self = this
    this.set('texObj', new TexRoot())

//    this.on('change', function() {
//      console.log('changed')
//    })

    var history = [];

    var position = -1;

    this.historyPush = function(data) {
      history[++position] = data.toJSON();
      history.length = position + 1;
      console.log('history PUSH', history, position);
    };

    this.back = function() {
      console.log('history BACK', history, position);
      if (position >= 0) this.set(history[--position]);
    };

    this.forward = function() {
      console.log('history FORWARD', history, position);
      if (position < history.length - 1) this.set(history[++position]);
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
          //      annoyign during tests 
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

    if(textInput !== '#TIMEOUT#') this.idleTimer.reset()

    console.log(textInput)
    textInput = textInput.split(' ').map(
      function(a) {
        return fixInput(a);
      }).join(' ');
    this.set('currInput', textInput);
    this.set('transcr', (this.get('transcr') ? this.get('transcr') + ' ' + textInput : textInput));
    translate(this.attributes.texObj, textInput);
    console.log(this.attributes);
    console.timeEnd('search word');
    this.set('tex', this.getTex());
    //this.historyPush(this); history only if word had effect
  },
  getTex: function() {
    return this.attributes.texObj.toTex()
  },

  save: function(name) {
    var self = this;
    (typeof name !== 'undefined') ? this.set('name', name): this.getArg('name');
    console.log('save');
    window.localStorage[self.attributes.name] = JSON.stringify(self.toJSON());
  },

  load: function(name) {
    var self = this;
    (typeof name !== 'undefined') ? this.set('name', name): this.getArg('name');
    console.log('load');
    self.set(JSON.parse(window.localStorage[self.attributes.name]));
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
    var self = this;
    (typeof name !== 'undefined') ? this.set('name', name): this.getArg('name');
    var a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + self.attributes.tex;
    a.download = self.attributes.name + '.tex';
    document.body.appendChild(a);
    a.click();
    a.parentNode.removeChild(a);
  },

  showMenu: function() {
    this.trigger('showMenu', 'showMenu');
  },

  pause: function() {
    if (this.get('mode' !== 'pause')) {
      this.set('mode', 'pause');
    }
  },

  resume: function() {
    speech.resumeInput();
    if (this.get('mode' === 'pause')) {
      console.log(_previousAttributes.mode, 'mode');
      this.set('mode', _previousAttributes.mode);
    }
  },

  noteMode: function() {
    this.set('mode', 'note');
    console.log('math mode');
  },

  mathMode: function() {
    this.set('mode', 'math');
    console.log('note mode');
  }
});


var MenuView = Backbone.View.extend({
  initialize: function() {
    this.model.on('showMenu', function() {
      $('#menuBox').show();
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

  speech.init(dict, ed);

});
