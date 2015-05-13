var dict = dict_PL //jesus this is awful, need 2 remove it asap

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
    this.set('texObj', new TexObj(this))

    this.history = new HistoryObj(this.attributes.texObj.translArr,
                                  Array.prototype.slice.bind(this.attributes.texObj.translArr))

    this.on('change:mode', function(data) {
      if (data._previousAttributes.mode !== 'pause') {
        this.set('prevmode', data._previousAttributes.mode)
      }
    })


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
  back: function() {
    var arr = this.history.back();
    this.parseArr(arr)
  },

  forward: function() {
    var arr = this.history.forward();
    this.parseArr(arr);
  },

  historyPush: function() {
   this.history.push(this.attributes.texObj.translArr);
  },

  input: function(textInput) {
    if (textInput !== '#TIMEOUT#') this.idleTimer.reset()

    console.log('new text input: ', textInput)
    console.time('search word') // time result for speech recog

    textInput = textInput.split(' ').map(
      function(a) {
        return fixInput(a);
      }).join(' ');

    this.set('currInput', (/^#/.test(textInput) ? '' : textInput));

    this.set('transcr', (this.get('transcr') ? this.get('transcr') + ' ' + textInput : textInput));
    var history = this.attributes.texObj.input(textInput);
    console.timeEnd('search word');
    this.set('tex', this.getTex());
    //would like some fix for multiple useless inputs
    if (history) {
      this.historyPush()
    } // history only if word had effect
  },
  parseArr: function(arr) {
    var to = new TexObj(this, arr)
    this.set('texObj', to)
    this.set('tex', this.getTex());
  },
  remove: function(amount) {
    amount = amount || 1
    this.attributes.texObj.remove(amount);
    this.set('tex', this.getTex());
    this.historyPush()
  },
  getTex: function() {
    return this.attributes.texObj.toTex()
  },

  save: function(name) {
    var self = this;
    (typeof name !== 'undefined') ? this.set('name', name): this.set('name', prompt('name'));
    console.log('save');
    var obj = this.attributes.texObj.toJSON();
    var str = JSON.stringify(obj);
    window.localStorage[self.attributes.name] = str
  },

  load: function(name) {
    var name = (typeof name !== 'undefined') ? name : prompt('name')
    console.log('load');
    var arr = JSON.parse(window.localStorage[name]);
    this.parseArr(TexObj.prototype.fromJSON(arr))
  },

  getArg: function() {
    var args = Array.prototype.slice.call(arguments);
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
    console.log('MENU PLEASE')
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
      this.set('mode', this.get('prevmode'));
    }
  },

  noteMode: function() {
    this.set('mode', 'note');
    console.log('note mode');
  },

  mathMode: function() {
    this.set('mode', 'math');
    console.log('math mode');
  },
  fontSize: function(num) {
    MathJax.Hub.Queue(function() {
      var math = document.getElementById("editor");
      math.style.fontSize = num + 'px'
      MathJax.Hub.Queue(["Rerender", MathJax.Hub, math]);
    })
    console.log('set font size :', num)
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
    console.log('calling function: ', name);
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




$(function() {

  // this one shouldnt be there
  $(window).on('keydown', function(ev) {
    if (ev.keyCode === 27) {
      ed.input('#BREAK#')
    }
  })

  $('#menu').html(menuv.render().el);

  $('#editor').html(edv.render().el);

  $('#currInput').html(currIn.render().el);
  $('#currInput>div>input').focus()


  speech.init(dict, ed);

});
