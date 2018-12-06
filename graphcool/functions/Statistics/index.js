const elasticsearch = require('elasticsearch');

module.exports = function(event) {
  const client = new elasticsearch.Client({
    host: 'https://replace_me'
  });

  const indices = new Promise((resolve, reject) => {
    client.cat
      .indices({ index: 'news-please,news-please-archive', format: 'json' })
      .then(response => resolve(response));
  });

  const lastArticles = new Promise((resolve, reject) => {
    client
      .search({
        index: 'news-please',
        type: 'article',
        body: {
          size: 0,
          aggs: {
            group_by_domain: {
              terms: {
                field: 'source_domain.keyword'
              },
              aggs: {
                last_published: {
                  top_hits: {
                    _source: ['date_publish'],
                    sort: [
                      {
                        'date_publish.keyword': {
                          order: 'desc'
                        }
                      }
                    ],
                    size: 1
                  }
                }
              }
            }
          }
        }
      })
      .then(response => {
        const articles = response.aggregations.group_by_domain.buckets.map(
          bucket => ({
            domain: bucket.key,
            date: bucket.last_published.hits.hits[0]._source.date_publish,
            count: bucket.doc_count
          })
        );

        resolve(articles);
      });
  });

  return Promise.all([indices, lastArticles]).then(
    ([indices, lastArticles]) => ({
      data: {
        indices,
        lastArticles
      }
    }),
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
