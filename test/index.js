import expect from 'expect';

import {mergeFragments, fragmentToQL, buildQueryAndVariables} from '../lib/index';

describe('Fragments', () => {
  it('merges fragments', () => {
    const result = mergeFragments({
      page: {
        _id: 1,
        name: 1,
        createdBy: {
          _id: 1
        }
      },
      pages: {
        _id: 1
      },
      pagesCount: 1
    }, {
      page: {
        title: 1,
        createdBy: {
          name: 1
        }
      },
      pages: {
        title: 1,
        date: 1,
        author: {
          _id: 1
        }
      }
    });
    expect(result).toEqual({
      page: {
        _id: 1,
        name: 1,
        title: 1,
        createdBy: {
          _id: 1,
          name: 1
        }
      },
      pages: {
        _id: 1,
        title: 1,
        date: 1,
        author: {
          _id: 1
        }
      },
      pagesCount: 1
    });
  });

  it('turns a fragment to GraphQL', () => {
    const result = fragmentToQL({
      _id: 1,
      name: 1,
      createdBy: {
        _id: 1,
        nested: {
          title: 1
        }
      }
    });
    expect(result).toEqual('_id,name,createdBy { _id,nested { title } }');
  });

  it('builds a simple GraphQL query with no variables', () => {
    const fragments = {
      page: {
        _id: 1,
        title: 1
      }
    };
    const result = buildQueryAndVariables(fragments);
    expect(result).toEqual({
      query: 'query { page { _id,title } }',
      variables: {}
    });
  });

  it('builds a simple GraphQL query with variables', () => {
    const fragments = {
      page: {
        _id: 1,
        title: 1
      }
    };
    const variables = {
      page: {
        _id: {
          value: '1',
          type: 'ID!'
        }
      }
    };
    const result = buildQueryAndVariables(fragments, variables);
    expect(result).toEqual({
      query: 'query ($_id0: ID!) { page (_id: $_id0) { _id,title } }',
      variables: {
        _id0: '1'
      }
    });
  });

  it('builds a simple GraphQL mutation with variables', () => {
    const fragments = {
      page: {
        _id: 1,
        title: 1
      }
    };
    const variables = {
      page: {
        _id: {
          value: '1',
          type: 'ID!'
        }
      }
    };
    const result = buildQueryAndVariables(fragments, variables, 'mutation');
    expect(result).toEqual({
      query: 'mutation ($_id0: ID!) { page (_id: $_id0) { _id,title } }',
      variables: {
        _id0: '1'
      }
    });
  });

  it('builds a more complex GraphQL query with variables', () => {
    const fragments = {
      page: {
        _id: 1,
        title: 1
      },
      pages: {
        _id: 1,
        date: 1
      },
      pagesCount: 1
    };
    const variables = {
      page: {
        _id: {
          value: '1',
          type: 'ID!'
        }
      }
    };
    const result = buildQueryAndVariables(fragments, variables);
    expect(result).toEqual({
      query: 'query ($_id0: ID!) { page (_id: $_id0) { _id,title },pages { _id,date },pagesCount }',
      variables: {
        _id0: '1'
      }
    });
  });

  it('builds a more complex GraphQL query with nexted queries with variables', () => {
    const fragments = {
      page: {
        _id: 1,
        title: 1,
        revisions: {
          _id: 1,
          date: 1
        }
      },
      pages: {
        _id: 1,
        date: 1,
        count: 1
      },
      pagesCount: 1
    };
    const variables = {
      page: {
        _id: {
          value: '1',
          type: 'ID!'
        },
        revisions: {
          date: {
            value: '2',
            type: 'String!'
          }
        }
      },
      pages: {
        count: {
          date: {
            value: '3',
            type: 'String!'
          }
        }
      }
    };
    const result = buildQueryAndVariables(fragments, variables);
    expect(result).toEqual({
      query: 'query ($_id0: ID!,$date1: String!,$date2: String!) { page (_id: $_id0) { _id,title,revisions (date: $date1) { _id,date } },pages { _id,date,count (date: $date2) },pagesCount }',
      variables: {
        _id0: '1',
        date1: '2',
        date2: '3'
      }
    });
  });

  it('builds a GraphQL query with scoped fragments', () => {
    const fragments = {
      page: {
        _id: 1,
        title: 1
      },
      'another: page': {
        _id: 1,
        title: 1,
        date: 1
      }
    };
    const result = buildQueryAndVariables(fragments);
    expect(result).toEqual({
      query: 'query { page { _id,title },another: page { _id,title,date } }',
      variables: {}
    });
  });

  it('builds a GraphQL query with scoped fragments and variables', () => {
    const fragments = {
      page: {
        _id: 1,
        title: 1
      },
      'another: page': {
        _id: 1,
        title: 1,
        date: 1
      }
    };
    const variables = {
      page: {
        _id: {
          value: '1',
          type: 'ID!'
        }
      },
      'another: page': {
        _id: {
          value: '2',
          type: 'ID!'
        }
      }
    };
    const result = buildQueryAndVariables(fragments, variables);
    expect(result).toEqual({
      query: 'query ($_id0: ID!,$_id1: ID!) { page (_id: $_id0) { _id,title },another: page (_id: $_id1) { _id,title,date } }',
      variables: {
        _id0: '1',
        _id1: '2'
      }
    });
  });
});
