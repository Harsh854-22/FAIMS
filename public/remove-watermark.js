// Remove v0.dev watermark
(function() {
  function removeWatermark() {
    // Common selectors for v0 watermarks
    const selectors = [
      '[data-v0-watermark]',
      '.v0-watermark',
      'div[style*="Built with v0"]',
      'a[href*="v0.dev"]',
      'div:has(> a[href*="v0.dev"])',
      'div[class*="watermark"]',
      '*[style*="position: fixed"][style*="bottom"]',
      '*[style*="position: fixed"][style*="right"]',
      '*[style*="z-index: 9999"]'
    ];

    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
          el.style.opacity = '0';
          el.remove();
        });
      } catch (e) {
        // Ignore errors for selectors that don't work
      }
    });

    // Also check for text content containing "Built with"
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let textNode;
    const nodesToRemove = [];
    while (textNode = walker.nextNode()) {
      if (textNode.textContent.includes('Built with v0') || 
          textNode.textContent.includes('Built with')) {
        nodesToRemove.push(textNode.parentElement);
      }
    }

    nodesToRemove.forEach(node => {
      if (node) {
        node.style.display = 'none';
        node.remove();
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeWatermark);
  } else {
    removeWatermark();
  }

  // Also run periodically to catch dynamically added watermarks
  setInterval(removeWatermark, 1000);

  // Run on mutations
  const observer = new MutationObserver(removeWatermark);
  observer.observe(document.body, { childList: true, subtree: true });
})();