jedna druga trzecia czwarta piąta szósta siódma ósma dziewiąta dziesiąta 
na ga cia ta ta ta ma ta ta nasta 
dwie drugie trzecie czwarte piąta szósta siódme ósme dziewiąte dziesiąte
ie ie ie te ta ta me me te te naste
sześć drugich trzecich czwartch piątych szóstych siódmych ósmych dziewiątych dziesiątych 
ich ich ch ch ch ych ych ych ych ych nastych


if(/(na|ga|cia|ta|ma|ie|te|me|ch)$/.test(curr.word)){
  prev.tex = '{ \\frac { '+prev.tex +' } { ' + curr.tex+ ' } }'
  prev.word += curr.word
}


 var countZeros = function(num){
   for(var i = 0; num>0 && num%10===0; i++) num=num/10
   return i
 }
if((curr.tex+'').length <= countZeros(prev.tex)){
  prev.tex += curr.tex
  prev.word += ' ' + curr.word
}



//      var countZeros = function(num) {
//        for (var i = 0; num > 0 && num % 10 === 0; i++) num = num / 10
//        return i
//      }
//      if ((curr.tex + '').length <= countZeros(prev.tex)) {
//        prev.tex = ~~prev.tex + ~~curr.tex
//        prev.tex = '' + prev.tex
//        prev.word += ' ' + curr.word
//      } else
