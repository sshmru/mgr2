function getFrom(obj, str) {
  str = str.match(/\w/g)
  while (str.length) {
    obj = obj[str.shift()]
  }
  return obj
}

function addParents(obj, str) {
  for (var item in obj) {
    if (obj.hasOwnProperty(item) &&
      typeof obj[item] === 'object' &&
      obj[item] !== null &&
      obj[item].constructor === {}.constructor) {
      addParents(obj[item], str + ' ' + item)
      obj[item].parent = str + ' ' + item
    }
  }
}

a = {
  a: {},
  b: {
    a: {},
    b: {
      a: {},
      b: {}
    },
    c: {
      a: 5
    }
  },
  c: {
    a: {
      a: 3
    },
    d: 4
  },
  d: {
    a: {
      a: 1
    },
    b: 2
  }
}
