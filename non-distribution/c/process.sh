#!/bin/bash

# Convert input to a stream of non-stopword terms
# Usage: input > ./process.sh > output

# Convert each line to one word per line, **remove non-letter characters**, make lowercase, convert to ASCII; then remove stopwords (inside d/stopwords.txt)
# Commands that will be useful: tr, iconv, grep

tr '[:upper:]' '[:lower:]' | \
  iconv -f utf8 -t ascii//TRANSLIT | \
  tr -cs '[:alpha:]' '\n' | \
  grep -v -w -f d/stopwords.txt | \
  grep -v '^$'
