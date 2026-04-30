const fs = require('fs');
const path = require('path');
const dir = 'node_modules/react-router/dist/development/';
const files = fs.readdirSync(dir);
console.log('Files in react-router dist:', files);

// Find the chunk that has BrowserRouter
for (const f of files) {
  if (f.endsWith('.mjs')) {
    const c = fs.readFileSync(path.join(dir, f), 'utf8');
    if (c.includes('function BrowserRouter')) {
      console.log('\nBrowserRouter found in:', f);
      // Find how React is imported
      const reactImports = c.match(/from\s+["']react["']/g);
      console.log('React imports:', reactImports);
      
      const importLines = c.split('\n').filter(l => l.includes('from "react"') || l.includes("from 'react'") || l.includes('import React') || l.includes('import * as React'));
      console.log('\nReact import lines:');
      importLines.forEach(l => console.log(' ', l.trim().substring(0, 150)));
      
      // Show BrowserRouter function
      const idx = c.indexOf('function BrowserRouter');
      console.log('\nBrowserRouter source:');
      console.log(c.substring(idx, idx + 500));
      break;
    }
  }
}
