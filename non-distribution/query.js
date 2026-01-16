#!/usr/bin/env node

const fs = require('fs');
const {execSync,
} = require('child_process');
const path = require('path');

/**
 * Searches the global index for the processed version of the provided arguments.
 * @param {string} indexFile - Path to the global index file.
 * @param {string[]} args - The raw search terms from the command line.
 */
function query(indexFile, args) {
  try {
    const input = args.join(' ');

    // 1. Process the query using your pipeline
    const rawProcessed = execSync(
        `echo "${input}" | ./c/process.sh | ./c/stem.js`,
        {
          encoding: 'utf-8',
        },
    );

    // Normalize whitespace to a single string
    const processedQuery = rawProcessed.trim().replace(/\s+/g, ' ');

    if (!processedQuery) return;

    if (!fs.existsSync(indexFile)) {
      console.error(`Error: Index file not found at ${indexFile
      }`);
      return;
    }
    // 2. Search the global index file
    const indexContent = fs.readFileSync(indexFile, 'utf-8');
    const lines = indexContent.split('\n');

    for (const line of lines) {
      // Split line into [term, data]
      const parts = line.split('|');
      if (parts.length < 2) continue;

      const termPart = parts[
          0
      ].trim();

      // Check if the termPart contains the processedQuery
      // This mimics the grep behavior mentioned in your instructions
      if (termPart.includes(processedQuery)) {
        console.log(line.trim());
      }
    }
  } catch (error) {
    console.error('An error occurred during the query:', error.message);
  }
}

const args = process.argv.slice(2); // Get command-line arguments

const indexFile = 'd/global-index.txt'; // Path to the global index file
query(indexFile, args);
