export const P = <T>(property: (object: T) => void) => {
  const chaine = property.toString();
  const arr = chaine.match(/(\.)[\S]+/);
  return arr[0].slice(1);
};
