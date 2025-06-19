/**
 * FINAL PIXEL-PERFECT VERSION
 * This script creates a new "Read aloud" button from scratch. It includes
 * a custom tooltip and now wraps the button in a final span to perfectly
 * match the native DOM structure, ensuring identical spacing.
 */

console.log("--- Read Aloud Pixel-Perfect Script Loaded ---");

// --- One-time Style Injection ---
(function createTooltipStyle() {
  if (document.getElementById('custom-tooltip-styles')) return;
  const style = document.createElement('style');
  style.id = 'custom-tooltip-styles';
  style.innerHTML = `
    .custom-tooltip-text-body {
      visibility: hidden;
      position: fixed;
      width: max-content;
      background-color: #000000;
      color: #FFFFFF;
      font-family: sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      text-align: center;
      border-radius: 0.5rem;
      padding: 0.25rem 0.5rem;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.2s;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
})();


// Global variables
let iconObserver = null;
let currentlyObservedButton = null;

// --- Helper Functions ---
function findTargetToolbar() {
  return document.querySelector('[data-testid="composer-trailing-actions"]');
}

function findNativeButtonGroup(toolbar) {
    if (!toolbar) return null;
    return toolbar.querySelector('.ms-auto.flex.items-center.gap-1\\.5');
}

function findLatestReadAloudButton() {
  const allButtons = document.querySelectorAll('[data-testid="voice-play-turn-action-button"]');
  return allButtons.length > 0 ? allButtons[allButtons.length - 1] : null;
}

// --- Core Logic ---
function createClonedButton(nativeButtonGroup, originalButton) {
  const clonedButton = originalButton.cloneNode(true);
  const svgIcon = clonedButton.querySelector('svg');

  if (svgIcon) {
    clonedButton.innerHTML = '';
    clonedButton.appendChild(svgIcon);
  }
  
  clonedButton.className = 'composer-btn';
  clonedButton.setAttribute('data-custom-read-aloud', 'true');
  clonedButton.removeAttribute('data-testid');
  clonedButton.setAttribute('aria-label', "Read aloud");

  // --- FINAL SPACING FIX ---
  // Create the final span wrapper to match the native button structure.
  const finalWrapper = document.createElement('span');
  finalWrapper.setAttribute('data-state', 'closed'); // Copying attribute from native button
  finalWrapper.appendChild(clonedButton);


  // Tooltip Logic
  const tooltipText = document.createElement('span');
  tooltipText.className = 'custom-tooltip-text-body';
  tooltipText.textContent = "Read aloud";
  tooltipText.id = 'custom-read-aloud-tooltip';
  document.body.appendChild(tooltipText);

  clonedButton.addEventListener('mouseenter', () => {
    const tooltip = document.getElementById('custom-read-aloud-tooltip');
    if (!tooltip) return;
    const btnRect = clonedButton.getBoundingClientRect();
    tooltip.style.left = `${btnRect.left + btnRect.width / 2}px`;
    tooltip.style.top = `${btnRect.bottom + 8}px`;
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.visibility = 'visible';
    tooltip.style.opacity = '1';
  });

  clonedButton.addEventListener('mouseleave', () => {
    const tooltip = document.getElementById('custom-read-aloud-tooltip');
    if (tooltip) {
      tooltip.style.visibility = 'hidden';
      tooltip.style.opacity = '0';
    }
  });

  // Insert the fully wrapped button into the native group.
  nativeButtonGroup.insertBefore(finalWrapper, nativeButtonGroup.firstChild);
  
  clonedButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    findLatestReadAloudButton()?.click();
  });

  return clonedButton;
}

function setupStateSyncing(originalButton, clonedButton) {
  if (currentlyObservedButton === originalButton) return;
  if (iconObserver) iconObserver.disconnect();

  const syncState = () => {
    const originalSvg = originalButton.querySelector('svg');
    const clonedSvg = clonedButton.querySelector('svg');
    const originalAriaLabel = originalButton.getAttribute('aria-label');

    if (originalSvg && clonedSvg) clonedSvg.innerHTML = originalSvg.innerHTML;
    clonedButton.setAttribute('aria-label', originalAriaLabel);
    const tooltip = document.getElementById('custom-read-aloud-tooltip');
    if (tooltip) tooltip.textContent = originalAriaLabel;
  };

  iconObserver = new MutationObserver(syncState);
  iconObserver.observe(originalButton, { attributes: true, childList: true, subtree: true });
  currentlyObservedButton = originalButton;
  syncState();
}

function runExtensionLogic() {
  const toolbar = findTargetToolbar();
  if (!toolbar) {
    if(iconObserver) iconObserver.disconnect();
    currentlyObservedButton = null;
    return;
  }
  
  const nativeButtonGroup = findNativeButtonGroup(toolbar);
  const latestOriginalButton = findLatestReadAloudButton();
  
  if (!nativeButtonGroup || !latestOriginalButton) return;

  let clonedButton = toolbar.querySelector('[data-custom-read-aloud="true"]');
  if (!clonedButton) {
    clonedButton = createClonedButton(nativeButtonGroup, latestOriginalButton);
  }
  
  if (clonedButton) {
    setupStateSyncing(latestOriginalButton, clonedButton);
  }
}

// --- Entry Point ---
const pageObserver = new MutationObserver(runExtensionLogic);
pageObserver.observe(document.body, { childList: true, subtree: true });