function getFrom(obj, str) {
  str = str.match(/\w/g)
  while (str.length) {
    obj = obj[str.shift()]
  }
  return obj
}

function addPaths(obj, str) {
  for (var item in obj) {
    if (obj.hasOwnProperty(item) &&
      typeof obj[item] === 'object' &&
      obj[item] !== null &&
      obj[item].constructor === {}.constructor) {
      addPaths(obj[item], str + ' ' + item)
      obj[item].path = str + ' ' + item
    }
  }
}


function cloneTranslArr(arr) {
  var cloned = []
  function cloneObj(obj) {
    var cloned = {}
    for (var o in obj) {
      if (obj.hasOwnProperty(o)) {
        if (typeof obj[o] === 'object' && obj[o]!== null) {
          if (obj[o].constructor === Array) {
            cloned[o] = []// obj[o].slice(0)
          } else {
            if(o !== 'parent'){
              cloned[o] = obj[o].path || cloneObj(obj[o])
            }
          }
        } else {
          cloned[o] = obj[o]
        }
      }
    }
    return cloned
  }
  arr.forEach(function(a){
    cloned.push(cloneObj(a))
  })
  return cloned
}
