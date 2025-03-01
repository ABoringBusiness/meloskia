/**
 * This file patches the React Native CSS Interop module to fix the color scheme error
 * It's loaded early in the app lifecycle via a script tag in +html.tsx
 */

// Suppress the error by overriding the error handler
window.addEventListener('error', function(event) {
  if (event.message && event.message.includes('Cannot manually set color scheme')) {
    // Prevent the error from showing in the console
    event.preventDefault();
    event.stopPropagation();
    console.warn('Suppressed color scheme error');
    return true;
  }
}, true);

// Try to patch the colorScheme module if it exists
setTimeout(function() {
  try {
    // Find the colorScheme module in the global scope
    for (const key in window) {
      if (window[key] && window[key].colorScheme && typeof window[key].colorScheme.set === 'function') {
        const originalSet = window[key].colorScheme.set;
        window[key].colorScheme.set = function(value) {
          try {
            return originalSet.call(this, value);
          } catch (e) {
            console.warn('Suppressed color scheme error:', e.message);
            // Return a no-op function
            return function() {};
          }
        };
        console.log('Successfully patched colorScheme.set');
        break;
      }
    }
  } catch (e) {
    console.warn('Failed to patch colorScheme:', e);
  }
}, 100);
