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

// Example usage:
//
//     const {query, variables} = buildQueryAndVariables(
//       {
//         session: {
//           _id: 1,
//           email: 1
//         },
//         page: {
//           _id: 1,
//           title: 1,
//           slug: 1,
//           createdBy: {
//             name: 1
//           }
//         }
//       },
//       {
//         page: {
//           slug: {
//             value: 'landing',
//             type: 'String!'
//           }
//         }
//       }
//     );
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
let iterator;
let variables;
let variablesTypes;

function _buildQuery (fragments, inputVariables = {}) {
  const queries = [];

  forEach(fragments, (fragment, key) => {
    let queryStr = '';
    const vars = inputVariables[key];
    const variablesMap = []; // slug: $slug
    const hasFragments = typeof fragment === 'object';

    // variables calculation
    if (vars) {
      forEach(vars, (varValue, varKey) => {
        if (varValue.hasOwnProperty('type') && varValue.hasOwnProperty('value') && typeof varValue.type === 'string') {
          const name = varKey + iterator;
          variablesTypes.push(`$${name}: ${varValue.type}`);
          variablesMap.push(`${varKey}: $${name}`);
          variables[name] = varValue.value;
          iterator ++;
        }
      });
    }

    // Make query variables string
    let variablesString = '';
    if (variablesMap.length) {
      variablesString = ` (${variablesMap.join(',')})`;
    }

    queryStr += `${key}${variablesString}`;

    if (hasFragments) {
      queryStr += ` { ${_buildQuery(fragment, vars)} }`;
    }

    queries.push(queryStr);
  });

  return queries.join(',');
}

export function buildQueryAndVariables (fragments, inputVariables = {}, type = 'query') {
  variables = {};
  variablesTypes = [];
  iterator = 0;

  const queries = _buildQuery(fragments, inputVariables);

  let query;
  if (variablesTypes.length) {
    query = `${type} (${variablesTypes.join(',')}) { ${queries} }`;
  } else {
    query = `${type} { ${queries} }`;
  }

  return {
    query,
    variables
  };
}
