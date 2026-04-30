const React = require('./node_modules/react');
const ReactDOM = require('./node_modules/react-dom');
console.log('React version:', React.version);
console.log('ReactDOM version:', ReactDOM.version);
console.log('React.useRef:', typeof React.useRef);
console.log('React.useState:', typeof React.useState);
console.log('React.useEffect:', typeof React.useEffect);

const rr = require('./node_modules/react-router');
console.log('\nreact-router BrowserRouter:', typeof rr.BrowserRouter);

// Check if react-router's internal React reference is the same
const rrPkg = require('./node_modules/react-router/package.json');
console.log('react-router version:', rrPkg.version);
