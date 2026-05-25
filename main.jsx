import React from 'react';
import * as ReactDOMClient from 'react-dom/client';

// Expose React and ReactDOM globally so that components can access them
window.React = React;
window.ReactDOM = ReactDOMClient;

// Import our files in the correct order
import './tweaks-panel.jsx';
import './placeholders.jsx';
import './sections.jsx';
import './app.jsx';
