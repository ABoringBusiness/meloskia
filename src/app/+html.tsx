import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/*
          This viewport disables scaling which makes the mobile website act more like a native app.
          However this does reduce built-in accessibility. If you want to enable scaling, use this instead:
            <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        */}
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1.00001,viewport-fit=cover"
        />
        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Add midi-parser-js script for MIDI file parsing */}
        <script src="https://cdn.jsdelivr.net/npm/midi-parser-js@4.0.4/src/midi-parser.min.js"></script>
        
        {/* Fallback script for midi-parser-js */}
        <script dangerouslySetInnerHTML={{ __html: `
          // Check if MidiParser is loaded
          if (typeof window !== 'undefined' && typeof window.MidiParser === 'undefined') {
            console.warn('MidiParser not loaded from primary CDN, trying fallback...');
            // Create a script element for the fallback
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/midi-parser-js@4.0.4/src/midi-parser.min.js';
            script.async = true;
            document.head.appendChild(script);
          }
        ` }} />

        {/* Fix for color scheme error */}
        <script src="/patchColorScheme.js"></script>

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        {/* eslint-disable-next-line @typescript-eslint/no-use-before-define */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}



const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}
body.dark {
  background-color: #000;
}
`;
