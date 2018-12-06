const elasticsearch = require('elasticsearch');

module.exports = function(event) {
  const client = new elasticsearch.Client({
    host: 'https://replace_me'
  });

  const queries = [];

  if (event.data.text) {
    queries.push({
      multi_match: {
        query: event.data.text,
        fields: ['description', 'title', 'title_page', 'source_domain', 'text']
        //fuzziness: 'AUTO'
      }
    });
  }

  if (event.data.disabledSites) {
    queries.push({
      bool: {
        must_not: event.data.disabledSites.map(site => ({
          term: {
            source_domain: site
          }
        }))
      }
    });
  }

  return client
    .search({
      index: 'news-please',
      type: 'article',
      body: {
        query: {
          bool: {
            must: queries
          }
        },
        from: event.data.skip || 0,
        size: event.data.first || 10,
        sort: [{ 'date_publish.keyword': { order: 'desc' } }]
      }
    })
    .then(
      resp => {
        const hits = resp.hits.hits;

        let results = [];

        results = hits.map(item =>
          Object.assign({}, item._source, {
            id: item._id
          })
        );

        const filterDate = new Date(new Date().getTime() + 60 * 60 * 1000);

        return {
          data: results.filter(item => new Date(item.date_publish) < filterDate)
        };
      },
      err => {
        return {
          error: err.message
        };
      }
    );

  return {
    error: 'Something went wrong'
  };
};
