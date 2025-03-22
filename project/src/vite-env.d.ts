/// <reference types="vite/client" />

declare module 'react' {
  import * as React from 'react';
  export = React;
}

declare module 'react-dom' {
  import * as ReactDOM from 'react-dom';
  export = ReactDOM;
}

interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}