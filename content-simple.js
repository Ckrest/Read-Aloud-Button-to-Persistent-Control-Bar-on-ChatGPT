// Read Aloud Button Extension for ChatGPT
// Adds a persistent "Read aloud" button to the bottom toolbar

function findButtonContainer() {
  const textarea = document.querySelector('textarea');
  if (!textarea) return null;

  let el = textarea;
  for (let i = 0; i < 10; i++) {
    el = el.parentElement;
    if (el && el.tagName === 'FORM') {
      const container = el.querySelector('div[class*="flex"]');
      return container;
    }
  }
  return null;
}

function findLastMoreActionsButton() {
  const buttons = Array.from(document.querySelectorAll('button[aria-label="More actions"]'));
  const messageButtons = buttons.filter(btn => {
    let el = btn;
    for (let i = 0; i < 10; i++) {
      el = el.parentElement;
      if (!el) break;
      if (el.tagName === 'FORM') return false;
    }
    return true;
  });
  return messageButtons[messageButtons.length - 1] || null;
}

function findReadAloudInMenu() {
  const menu = document.querySelector('[role="menu"]');
  if (!menu) return null;

  const items = menu.querySelectorAll('[role="menuitem"]');
  for (const item of items) {
    const label = item.getAttribute('aria-label');
    const isDisabled = item.getAttribute('aria-disabled') === 'true';
    const isLoading = label === 'Loading';

    // Only return if it's a Read Aloud button that's NOT disabled or loading
    if (label && (label.includes('Read') || label.includes('read') || label.includes('Stop')) && !isDisabled && !isLoading) {
      return item;
    }
  }
  return null;
}

function createCustomButton() {
  const button = document.createElement('button');
  button.className = 'text-token-text-secondary hover:bg-token-bg-secondary flex h-8 w-8 items-center justify-center rounded-lg';
  button.setAttribute('aria-label', 'Read aloud');
  button.id = 'custom-read-aloud-btn';

  // Speaker icon with sound waves
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.75122 4.09203C9.75122 3.61482 9.19308 3.35352 8.84449 3.65479L5.2183 6.875H3.125C2.77982 6.875 2.5 7.15482 2.5 7.5V12.5C2.5 12.8452 2.77982 13.125 3.125 13.125H5.2183L8.84449 16.3452C9.19308 16.6465 9.75122 16.3852 9.75122 15.908V4.09203Z"/>
      <path d="M12.5 6.875C12.1548 6.875 11.875 7.15482 11.875 7.5C11.875 7.84518 12.1548 8.125 12.5 8.125C13.5355 8.125 14.375 8.96447 14.375 10C14.375 11.0355 13.5355 11.875 12.5 11.875C12.1548 11.875 11.875 12.1548 11.875 12.5C11.875 12.8452 12.1548 13.125 12.5 13.125C14.2259 13.125 15.625 11.7259 15.625 10C15.625 8.27411 14.2259 6.875 12.5 6.875Z"/>
      <path d="M12.5 3.75C12.1548 3.75 11.875 4.02982 11.875 4.375C11.875 4.72018 12.1548 5 12.5 5C15.1234 5 17.25 7.12665 17.25 9.75C17.25 12.3734 15.1234 14.5 12.5 14.5C12.1548 14.5 11.875 14.7798 11.875 15.125C11.875 15.4702 12.1548 15.75 12.5 15.75C15.8142 15.75 18.5 13.0642 18.5 9.75C18.5 6.43579 15.8142 3.75 12.5 3.75Z"/>
    </svg>
  `;

  button.addEventListener('click', handleButtonClick);
  return button;
}

function handleButtonClick(e) {
  e.preventDefault();
  e.stopPropagation();

  const moreActionsBtn = findLastMoreActionsButton();
  if (!moreActionsBtn) return;

  // Hide menu completely before opening
  const hideStyle = document.createElement('style');
  hideStyle.id = 'hide-menu-temp';
  hideStyle.textContent = `
    [role="menu"],
    div[role="menu"],
    [role="menu"] * {
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
      position: fixed !important;
      left: -9999px !important;
      top: -9999px !important;
      z-index: -9999 !important;
    }
  `;
  document.head.appendChild(hideStyle);

  // Simulate click to open menu
  const rect = moreActionsBtn.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(eventType => {
    const isPointer = eventType.includes('pointer');
    const event = isPointer
      ? new PointerEvent(eventType, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: 1, pointerType: 'mouse' })
      : new MouseEvent(eventType, { bubbles: true, cancelable: true, clientX: x, clientY: y });
    moreActionsBtn.dispatchEvent(event);
  });

  // Retry logic: Menu takes time to open and populate (async rendering)
  let attempts = 0;
  const maxAttempts = 5;
  const retryDelay = 100;

  const tryClick = () => {
    attempts++;
    const readAloudBtn = findReadAloudInMenu();

    if (readAloudBtn) {
      readAloudBtn.click();

      // Clean up - remove hiding styles and close menu
      setTimeout(() => {
        const style = document.getElementById('hide-menu-temp');
        if (style) style.remove();
        if (moreActionsBtn.getAttribute('aria-expanded') === 'true') {
          moreActionsBtn.click();
        }
      }, 50);
    } else if (attempts < maxAttempts) {
      setTimeout(tryClick, retryDelay);
    } else {
      // Clean up anyway after max attempts
      const style = document.getElementById('hide-menu-temp');
      if (style) style.remove();
      if (moreActionsBtn.getAttribute('aria-expanded') === 'true') {
        moreActionsBtn.click();
      }
    }
  };

  setTimeout(tryClick, 150);
}

// Update button to show "Stop" icon
function setButtonToStop() {
  const button = document.getElementById('custom-read-aloud-btn');
  if (!button) return;

  // Use simple hardcoded stop icon
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M4.16667 4.16667C4.16667 3.24619 4.91286 2.5 5.83333 2.5H14.1667C15.0871 2.5 15.8333 3.24619 15.8333 4.16667V15.8333C15.8333 16.7538 15.0871 17.5 14.1667 17.5H5.83333C4.91286 17.5 4.16667 16.7538 4.16667 15.8333V4.16667Z"/>
    </svg>
  `;
  button.setAttribute('aria-label', 'Stop');
}

// Update button to show "Play/Read aloud" icon
function setButtonToPlay() {
  const button = document.getElementById('custom-read-aloud-btn');
  if (!button) return;

  // Use simple hardcoded play icon
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.75122 4.09203C9.75122 3.61482 9.19308 3.35352 8.84449 3.65479L5.2183 6.875H3.125C2.77982 6.875 2.5 7.15482 2.5 7.5V12.5C2.5 12.8452 2.77982 13.125 3.125 13.125H5.2183L8.84449 16.3452C9.19308 16.6465 9.75122 16.3852 9.75122 15.908V4.09203Z"/>
      <path d="M12.5 6.875C12.1548 6.875 11.875 7.15482 11.875 7.5C11.875 7.84518 12.1548 8.125 12.5 8.125C13.5355 8.125 14.375 8.96447 14.375 10C14.375 11.0355 13.5355 11.875 12.5 11.875C12.1548 11.875 11.875 12.1548 11.875 12.5C11.875 12.8452 12.1548 13.125 12.5 13.125C14.2259 13.125 15.625 11.7259 15.625 10C15.625 8.27411 14.2259 6.875 12.5 6.875Z"/>
      <path d="M12.5 3.75C12.1548 3.75 11.875 4.02982 11.875 4.375C11.875 4.72018 12.1548 5 12.5 5C15.1234 5 17.25 7.12665 17.25 9.75C17.25 12.3734 15.1234 14.5 12.5 14.5C12.1548 14.5 11.875 14.7798 11.875 15.125C11.875 15.4702 12.1548 15.75 12.5 15.75C15.8142 15.75 18.5 13.0642 18.5 9.75C18.5 6.43579 15.8142 3.75 12.5 3.75Z"/>
    </svg>
  `;
  button.setAttribute('aria-label', 'Read aloud');
}

// Watch for audio elements and attach event listeners
function attachAudioListeners() {
  const audio = document.querySelector('audio');
  if (!audio) return;

  // Check if we've already attached listeners to this audio element
  if (audio.dataset.listenerAttached) return;
  audio.dataset.listenerAttached = 'true';

  audio.addEventListener('play', () => setButtonToStop());
  audio.addEventListener('pause', () => setButtonToPlay());
  audio.addEventListener('ended', () => setButtonToPlay());
}

// Watch for audio elements being added to the page
const audioObserver = new MutationObserver(() => {
  attachAudioListeners();
});
audioObserver.observe(document.body, { childList: true, subtree: true });

function setup() {
  if (document.getElementById('custom-read-aloud-btn')) return;

  const container = findButtonContainer();
  if (!container) return;

  const moreActionsBtn = findLastMoreActionsButton();
  if (!moreActionsBtn) return;

  // Create button
  const button = createCustomButton();

  // Find the send button container for consistent positioning
  const sendButton = container.querySelector('button[data-testid="send-button"]');

  // Insert at the start of send button container
  if (sendButton && sendButton.parentElement) {
    sendButton.parentElement.insertBefore(button, sendButton.parentElement.firstChild);
  } else {
    // Fallback: insert before microphone button
    const micButton = container.querySelector('button[aria-label*="microphone"], button[aria-label*="voice"]') ||
                      container.querySelector('button');
    if (micButton) {
      container.insertBefore(button, micButton);
    } else {
      container.appendChild(button);
    }
  }

  // Start listening for audio events
  attachAudioListeners();
}

// Run setup when page loads
setTimeout(setup, 2000);

// Watch for page changes and retry setup
new MutationObserver(() => {
  // Throttle to avoid excessive calls
  setTimeout(setup, 1000);
}).observe(document.body, { childList: true, subtree: true });
