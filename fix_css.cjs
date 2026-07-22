const fs = require('fs');
let css = fs.readFileSync('src/styles/styles.css', 'utf8');

// Step 1: Remove the 17 } we appended at the end
css = css.trimEnd();
// Count trailing } characters
let trailingBraces = 0;
let i = css.length - 1;
while (i >= 0 && (css[i] === '}' || css[i] === '\n' || css[i] === '\r')) {
  if (css[i] === '}') trailingBraces++;
  i--;
}
console.log('Trailing } found:', trailingBraces);
// Remove the trailing } block
css = css.substring(0, i + 1) + '\n';

// Step 2: Track all open blocks and where they should close
const lines = css.split('\n');
console.log('Lines after removing trailing braces:', lines.length);

// Step 3: For each open block, find where it ends and insert a closing }
// We use a stack-based approach to track what's open
let blockStack = []; // { line, text }
let depth = 0;

const opens = []; // places where blocks opened

for (let li = 0; li < lines.length; li++) {
  const line = lines[li];
  const prevDepth = depth;
  let lineDepthChange = 0;
  for (const ch of line) {
    if (ch === '{') { depth++; lineDepthChange++; }
    else if (ch === '}') { depth--; lineDepthChange--; }
  }
  
  if (lineDepthChange > 0) {
    // Block(s) opened
    for (let d = 0; d < lineDepthChange; d++) {
      blockStack.push({ line: li, text: line.trim().substring(0, 60) });
    }
  } else if (lineDepthChange < 0) {
    // Block(s) closed
    for (let d = 0; d < Math.abs(lineDepthChange); d++) {
      if (blockStack.length > 0) blockStack.pop();
    }
  }
}

console.log('\nFinal depth:', depth, '(should be 0)');
console.log('Still open blocks (' + blockStack.length + '):');
blockStack.forEach(b => console.log('  Line', b.line + 1 + ':', b.text));

if (depth === 0) {
  console.log('\nNo open blocks! CSS is already balanced.');
  fs.writeFileSync('src/styles/styles.css', css);
} else {
  // Find where each open block should close by scanning for where the
  // next top-level rule starts after that block's content ends
  // Simple approach: for each unclosed block, find the line just before the next 
  // block at depth 0 or lower starts
  
  // Re-scan with per-line depth tracking to find insertion points
  const lineDepths = [];
  let d2 = 0;
  for (const line of lines) {
    const start = d2;
    for (const ch of line) {
      if (ch === '{') d2++;
      else if (ch === '}') d2--;
    }
    lineDepths.push({ start, end: d2 });
  }
  
  // Find the 17 places where the depth jumped up but never came back down
  // We need to insert } at the right spots
  // For now: insert the needed closing braces right before the last line
  const insertions = depth; // number of } to insert
  
  // Find the right insertion point for each:
  // Insert } at each transition from a "should be depth 0" area back to depth 0
  // Simple fix: spread the insertions at the natural "break" points
  
  // Find all lines that start at depth > 0 but the NEXT line starts at depth 0
  // That's where } should have been
  let insertAt = [];
  for (let li = 0; li < lineDepths.length - 1; li++) {
    const curr = lineDepths[li];
    const next = lineDepths[li + 1];
    // Look for places where current depth is 1 (inside top-level block)
    // and we're transitioning to a new top-level selector with still depth > 0
    // This is hard to detect perfectly; instead look at the block stack approach
  }
  
  // Fallback: just report the open blocks and fix them by looking at context
  console.log('\nNeed to insert', insertions, 'closing braces.');
  console.log('Inspect the file manually at these lines for missing }:');
  blockStack.forEach(b => console.log('  Line', b.line + 1));
}
