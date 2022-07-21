const DEFAULT_DELAY = 500;
let timerMap = {};

export default function(ns, delay){
  return new Promise((resolve, reject) => {
    if(timerMap[ns]){
      clearTimeout(timerMap[ns])
    }
    timerMap[ns] = setTimeout(() => {
      resolve()
    }, delay || DEFAULT_DELAY)
  })
}
