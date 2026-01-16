#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

// The `compare` function used for sorting based on frequency descending.
const compare = (a, b) => {
  if (a.freq > b.freq) {
    return -1;
  } else if (a.freq < b.freq) {
    return 1;
  } else {
    return 0;
  }
};

const rl = readline.createInterface({
  input: process.stdin,
});

// 1. Read the incoming local index data from standard input (stdin)
let localIndex = '';
rl.on('line', (line) => {
  localIndex += line + '\n';
});

rl.on('close', () => {
  // 2. Read the global index name/location from process.argv
  const globalIndexFile = process.argv[
      2
  ];

  if (!globalIndexFile) {
    console.error('Usage: input > ./merge.js <global-index-file>');
    process.exit(1);
  }
  // Check if file exists to handle the first run gracefully
  if (!fs.existsSync(globalIndexFile)) {
    printMerged(null, ''); // Pass empty string if global file doesn't exist yet
  } else {
    fs.readFile(globalIndexFile, 'utf8', (err, data) => {
      printMerged(err, data);
    });
  }
});

const printMerged = (err, data) => {
  if (err) {
    console.error('Error reading global index file:', err);
    return;
  }
  // Split the data into arrays and filter out empty lines
  const localIndexLines = localIndex.split('\n').filter((line) => line.trim() !== '');
  const globalIndexLines = data.split('\n').filter((line) => line.trim() !== '');

  const local = {};
  const global = {};

  // 3. Parse Local Index: <word/ngram> | <frequency> | <url>
  for (const line of localIndexLines) {
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length === 3) {
      const term = parts[
          0
      ];
      const freq = parseInt(parts[
          1
      ],
      10);
      const url = parts[
          2
      ];
      local[term
      ] = {
        url, freq,
      };
    }
  }
  // 4. Parse Global Index: <word/ngram> | <url_1> <frequency_1> ...
  for (const line of globalIndexLines) {
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length === 2) {
      const term = parts[
          0
      ];
      const pairs = parts[
          1
      ].split(/\s+/);
      const urlfs = [];

      for (let i = 0; i < pairs.length; i += 2) {
        if (pairs[i
        ] && pairs[i + 1
        ]) {
          urlfs.push({
            url: pairs[i
            ], freq: parseInt(pairs[i + 1
            ],
            10),
          });
        }
      }
      global[term
      ] = urlfs;
    }
  }
  // 5. Merge the local index into the global index
  for (const term in local) {
    const localEntry = local[term
    ];

    if (global[term
    ]) {
      // Check if this URL already exists for this term to avoid duplicates
      const existingUrlIndex = global[term
      ].findIndex((e) => e.url === localEntry.url);
      if (existingUrlIndex !== -1) {
        global[term
        ][existingUrlIndex
        ].freq += localEntry.freq;
      } else {
        global[term
        ].push(localEntry);
      }
      // Sort by frequency descending
      global[term
      ].sort(compare);
    } else {
      // New term for the global index
      global[term
      ] = [localEntry,
      ];
    }
  }
  // 6. Print the merged index
  for (const term in global) {
    const dataString = global[term
    ]
        .map((entry) => `${entry.url
        } ${entry.freq
        }`)
        .join(' ');
    console.log(`${term
    } | ${dataString
    }`);
  }
};
