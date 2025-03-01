/**
 * Workaround for React Native CSS Interop color scheme error
 * This file is imported early in the app lifecycle to fix the error:
 * "Cannot manually set color scheme, as dark mode is type 'media'. Please use StyleSheet.setFlag('darkMode', 'class')"
 */

// Only run in web environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  try {
    // Add a custom style to handle dark mode via CSS classes instead of media queries
    const style = document.createElement('style');
    style.textContent = `
      /* Force light mode by default */
      body {
        color-scheme: light;
      }
      
      /* Add dark mode support via classes */
      body.dark {
        color-scheme: dark;
      }
    `;
    document.head.appendChild(style);
    
    // Add a script to handle dark mode toggle
    const script = document.createElement('script');
    script.textContent = `
      // Check for user preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.body.classList.add('dark');
      }
      
      // Listen for changes in preference
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (e.matches) {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
      });
    `;
    document.head.appendChild(script);
  } catch (error) {
    console.warn('Failed to set up color scheme workaround:', error);
  }
}

export default {};
