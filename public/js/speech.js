var speech = (function() {
  var speech = {};
  var recog = {};
  var file = {};
  var SpeechRecognition = window.webkitSpeechRecognition ||
    window.SpeechRecognition ||
    window.mozSpeechRecognition ||
    window.oSpeechRecognition;

  speech.test = function() {
    if (typeof SpeechRecognition === 'undefined') {
      console.log("speech not detected, please use chrome/chromium");
      return false;
    } else {
      console.log("speech recognition detected");
      return true;
    }
  };

  speech.transcribe = function(ev) {
//    console.log(ev)
    //accepts string or event
    var result = (typeof ev === 'string') ? ev : ev.results[ev.results.length - 1][0].transcript;
    file.input(result);
  };


  speech.resumeInput = function() {
    if (!recog.running) {
      recog.start();
    }
    console.log('RESUMED');
  };

  speech.init = function(setdict, setfile) {
    file = setfile;
    dict = setdict;
    if (speech.test()) {
      recog = new SpeechRecognition();
      if (location.protocol === 'https:') {
        recog.onend = function() {
          recog.running = false;
          speech.resumeInput();
//          console.log('recognition ended');
        };
      } else {
        console.log('plese use https protocol for better results');
        recog.continuous = true;
        recog.onend = function() {
          recog.running = false;
          speech.resumeInput();
//          console.log('recognition ended');
        };
      }
      recog.maxAlternatives = 3;
      recog.lang = dict.lang;
      recog.onstart = function() {
        recog.running = true;
//        console.log('recognition started');
      };
      recog.onsoundstart = function() {
        console.time('speech input')// start counting speech recog time
      };
      recog.onresult = function(ev) {
        console.timeEnd('speech input')
        console.time('search word')// time result for speech recog
        speech.transcribe(ev);
//        console.log('received input');
      };
    } else {

    }
  };
  return speech;
})();
