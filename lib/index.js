import forEach from 'lodash.foreach';
import merge from 'lodash.merge';
//
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
//
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
//
// Example usage:
//
// const {query, variables} = buildQueryAndVariables(
//   {
//     session: {
//       _id: 1,
//       email: 1
//     },
//     page: {
//       _id: 1,
//       title: 1,
//       slug: 1,
//       createdBy: {
//         name: 1
//       }
//     }
//   },
//   {
//     page: {
//       slug: 'landing'
//     }
//   },
//   {
//     page: {
//       slug: 'String!'
//     }
//   }
// );
//
// Outputs:
//
// {
//   query: `
//     query ($slug0: String!) {
//       session {
//         _id,
//         email
//       },
//       page (slug: $slug0) {
//         _id,
//         title,
//         slug,
//         createdBy {
//           name
//         }
//       }
//     }
//   `,
//   variables: {
//     slug0: 'landing'
//   }
// }
//
// TODO Support nested queries (only root query support as of now)
export function buildQueryAndVariables (fragments, variables, variablesTypes) {
  const finalVariables = {};
  const queries = [];
  let it = 0;

  const varsTypes = []; // $slug: String!

  forEach(fragments, (fragment, key) => {
    var queryStr = '';
    const vars = variables[key];
    const varsString = []; // slug: $slug

    forEach(vars, (varValue, varKey) => {
      const name = varKey + it;
      varsTypes.push(`$${name}: ${variablesTypes[key][varKey]}`);
      varsString.push(`${varKey}: $${name}`);
      finalVariables[name] = varValue;
      it += 1;
    });

    if (varsString.length) {
      queryStr += `${key} (${varsString.join(',')}) {`;
    } else {
      queryStr += `${key} {`;
    }

    queryStr += `${fragmentToQL(fragment)}}`;

    queries.push(queryStr);
  });

  var query;
  if (varsTypes.length) {
    query = `query (${varsTypes.join(',')}){ ${queries.join(',')} }`;
  } else {
    query = `query { ${queries.join(',')} }`;
  }

  return {
    query,
    variables: finalVariables
  };
}
