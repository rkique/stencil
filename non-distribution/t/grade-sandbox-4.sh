#!/bin/bash

cd "$(dirname "$0")/.." || exit

cat /dev/null >d/visited.txt
cat /dev/null >d/global-index.txt
echo https://cs.brown.edu/courses/csci1380/sandbox/4 >d/urls.txt

./engine_timed.sh

ts=(
    "mark twain"
    "adulthood"
    "advers affect"
    "journal"
    "prize accept speech"
)
us=(
    https://cs.brown.edu/courses/csci1380/sandbox/4/tag/truth/index.html
    https://cs.brown.edu/courses/csci1380/sandbox/4/tag/adulthood/page/1/index.html
    https://cs.brown.edu/courses/csci1380/sandbox/4/author/Eleanor-Roosevelt.html
    https://cs.brown.edu/courses/csci1380/sandbox/4/author/George-R-R-Martin.html
    https://cs.brown.edu/courses/csci1380/sandbox/4/author/Pablo-Neruda.html
)
vs=(
    https://cs.brown.edu/courses/csci1380/sandbox/4/author/George-Bernard-Shaw.html
    https://cs.brown.edu/courses/csci1380/sandbox/4/tag/aliteracy/page/1/index.html
    https://cs.brown.edu/courses/csci1380/sandbox/4/tag/imagination/page/1/index.html
    https://cs.brown.edu/courses/csci1380/sandbox/4/tag/lying/page/1/index.html
    https://cs.brown.edu/courses/csci1380/sandbox/4/tag/the-hunger-games/page/1/index.html
)


for t in "${ts[@]}"; do
    if grep -q "$t" d/global-index.txt;
    then
        echo "$0 success: $t in global index"
    else
        echo "$0 failure: $t not in global index"
    fi
done

for u in "${us[@]}"; do
    if grep -q "$u" d/global-index.txt;
    then
        echo "$0 success: $u in global index"
    else
        echo "$0 failure: $u not in global index"
    fi
done

for v in "${vs[@]}"; do
    if grep -q "$v" d/visited.txt;
    then
        echo "$0 success: $v in visited urls"
    else
        echo "$0 failure: $v not in visited urls"
    fi
done

elapsed_query_time=0
for term in "${ts[@]}"; do
    start_query_time=$(date +%s)
    ./query.js "$term"
    end_query_time=$(date +%s)
    elapsed_query_time=$((elapsed_query_time + end_query_time - start_query_time))
done

echo "[grade-sandbox-4] total query time (s): $elapsed_query_time" >&2
echo "[grade-sandbox-4] total queries: ${#ts[@]}))" >&2