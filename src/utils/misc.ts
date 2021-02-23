export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const isEmptyObject = (obj: Object) => {
  for(let i in obj) {
    return false;
  }
  return true;
}