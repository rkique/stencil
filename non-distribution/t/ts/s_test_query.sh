#!/bin/bash
# This is a student test
# Queries the d/d7.txt global index for the word 'right', 
# and compares to the expected labels in ts/s_query.txt

T_FOLDER=${T_FOLDER:-t}
R_FOLDER=${R_FOLDER:-}

cd "$(dirname "$0")/..$R_FOLDER" || exit 1

DIFF=${DIFF:-diff}

term="right"

cat "$T_FOLDER"/d/d7.txt > d/global-index.txt

if $DIFF <(./query.js "$term") <(cat "$T_FOLDER"/d/s_query.txt) >&2;
then
    echo "$0 success: search results are identical"
    exit 0
else
    echo "$0 failure: search results are not identical"
    exit 1
fi
