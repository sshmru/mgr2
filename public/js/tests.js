var tests = (function() {
  var cases = [{
    fun: translate,
    arg: 'matematyka',
    exp: '$${ ## }$$',
    err: 'something went wrong',
    succ: 'working as intended'
  }];
  var tests = {
    run: function(obj) {
      if (!obj) {console.log('no obj stated');}
      cases.forEach(function(a) {
        if (typeof obj[fun] === 'function') {
          var res = obj[fun](a.arg);
          if (res === a.exp) {
            console.log(a.succ);
          } else {
            console.error(a.err);
          }
          console.log(a.arg);
        }
      });
    },
  };
  return tests;
})();
