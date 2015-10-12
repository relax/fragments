import merge from 'lodash.merge';

// Example usage:
//
//     mergeFragments({
//       page: {
//         _id: 1,
//         name: 1,
//         createdBy: {
//           _id: 1
//         }
//       }
//     }, {
//       page: {
//         title: 1,
//         createdBy: {
//           name: 1
//         }
//       }
//     }))
//
// Outputs:
//
//     { page: { _id: 1, name: 1, createdBy: { _id: 1, name: 1 }, title: 1 } }
//
export function mergeFragments () {
  return merge({}, ...arguments);
}

// Example usage:
//
//     fragmentToQL({
//       _id: 1,
//       name: 1,
//       createdBy: {
//         _id: 1
//       }
//     })
//
// Outputs:
//
//     _id,name,createdBy { _id }
//
export function fragmentToQL (fragment) {
  const iterate = (i) => {
    return Object
      .keys(i)
      .map((key) => {
        var result;
        const value = i[key];
        if (typeof value === 'object') {
          result = `${key} { ${iterate(value)} }`;
        } else {
          result = key;
        }
        return result;
      })
      .join(',');

  };
  return iterate(fragment);
}
