function getMaxProperty(obj) {
  let lastMax = {};
  let lastMaxLength = 0;

  for (let key in obj) {
    if (obj[key].length > lastMaxLength) lastMax = obj[key];
    lastMaxLength = obj[key].length;
  }

  return lastMax;
}

function averageObj(arrays, propertyName) {
  const pp = {};

  for (let i = 0; i < arrays.length; i++) {
    const property = arrays[i] && arrays[i][propertyName];

    if (property) {
      if (pp[property]) {
        pp[property].push(i);
      } else {
        pp[property] = [i];
      }
    }
  }

  const arrIndexes = getMaxProperty(pp);

  return { result: arrays[arrIndexes[0]], arrIndexes };
}

export function averageArr(arrays, propertyName) {
  const resultLength = Math.max.apply(
    {},
    arrays.map(a => a.length),
  );

  const res = [];

  for (let i = 0; i < resultLength; i++) {
    res[i] = averageObj(
      arrays.map(arr => arr[i]),
      propertyName,
    ).result;
  }

  return res;
}

const getMaxEntry = array => {
  const obj = array.reduce((acc, num) => {
    acc[num] ? acc[num]++ : (acc[num] = 1);
    return acc;
  }, {});

  let property;

  for (let key in obj) {
    if (!property || obj[key] > obj[property]) {
      property = key;
    }
  }

  return property;
};

export function getCorrectArr(arrays, propertyName) {
  const resultLength = getMaxEntry(arrays.map(a => a.length));

  let indexes = [];

  for (let i = 0; i < resultLength; i++) {
    const { arrIndexes } = averageObj(
      arrays.map(arr => arr[i]),
      propertyName,
    );

    indexes = indexes.concat(arrIndexes);
  }

  return getMaxEntry(indexes);
}
