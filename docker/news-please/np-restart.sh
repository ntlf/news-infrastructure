#!/bin/bash

# docker run -d -v ${PWD}/config/:/app/newsplease/config/ -v ${PWD}/data/:/app/data/ --name news-please ntlf/news-please
# docker run -d --network=elk_elk  -v ${PWD}/config/:/app/newsplease/config/ --name news-please ntlf/news-please

curl \
  -X POST \
  -H "Content-Type: application/json" \
  --data '{ "query": "{ allConfigs(first: 1, orderBy: createdAt_DESC) { data } }" }' \
  https://api.graph.cool/simple/v1/cjcol6bod1cuh0170hkw0xf51 | \
  python3 \
    -c "import sys, json; print(json.dumps(json.load(sys.stdin)['data']['allConfigs'][0]['data']))" > \
    /home/a/docker/news-please/config/sitelist.hjson
docker restart news-please