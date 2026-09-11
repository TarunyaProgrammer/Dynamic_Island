import { parsePairingLink } from './protocol.js';

// DOM Elements
const statusPill = document.querySelector('#status-pill');
const statusLabel = document.querySelector('#status-label');
const statusMsg = document.querySelector('#status-msg');
const portBadge = document.querySelector('#port-badge');
const keyTokenInput = document.querySelector('#key-token-input');
const toggleKeyBtn = document.querySelector('#toggle-key-visibility-btn');
const eyeIcon = document.querySelector('#eye-icon');
const eyeOffIcon = document.querySelector('#eye-off-icon');
const copyKeyBtn = document.querySelector('#copy-key-btn');
const copyIcon = document.querySelector('#copy-icon');
const copyCheckIcon = document.querySelector('#copy-check-icon');

const pasteAndConnectBtn = document.querySelector('#paste-and-connect-btn');
const activeTabBtn = document.querySelector('#active-tab-btn');
const pairingLinkInput = document.querySelector('#pairing-link-input');
const manualConnectBtn = document.querySelector('#manual-connect-btn');
const unpairBtn = document.querySelector('#unpair-btn');

// Media Card Elements
const mediaCard = document.querySelector('#media-card');
const mediaArt = document.querySelector('#media-art');
const mediaArtFallback = document.querySelector('#media-art-fallback');
const mediaTitle = document.querySelector('#media-title');
const mediaArtist = document.querySelector('#media-artist');
const mediaPlayBtn = document.querySelector('#media-play-btn');
const mediaPlayIcon = document.querySelector('#media-play-icon');
const mediaPauseIcon = document.querySelector('#media-pause-icon');

let currentToken = '';
let currentPort = null;

// Helpers
function showStatus(message, isError = false) {
  statusMsg.textContent = message;
  statusMsg.classList.toggle('error', isError);
}

function updateStatusPill(state) {
  statusPill.className = 'status-pill';
  if (state === 'connected') {
    statusPill.classList.add('connected');
    statusLabel.textContent = 'Connected';
  } else if (state === 'connecting') {
    statusPill.classList.add('connecting');
    statusLabel.textContent = 'Connecting';
  } else if (state === 'rejected') {
    statusPill.classList.add('error');
    statusLabel.textContent = 'Rejected';
  } else {
    statusLabel.textContent = 'Ready';
  }
}

function updateCredentialsDisplay(port, token) {
  currentPort = port;
  currentToken = token || '';
  if (port) {
    portBadge.textContent = `Port ${port}`;
  } else {
    portBadge.textContent = 'Port --';
  }
  keyTokenInput.value = currentToken;
}

function updateMediaSession(session) {
  if (session && (session.title || session.isPlaying)) {
    mediaCard.classList.add('visible');
    mediaTitle.textContent = session.title || 'Playing Audio';
    mediaArtist.textContent = session.artist || (session.origin ? new URL(session.origin).hostname : 'Browser Media');

    if (session.artworkUrl) {
      mediaArt.src = session.artworkUrl;
      mediaArt.style.display = 'block';
      mediaArtFallback.style.display = 'none';
      mediaArt.onerror = () => {
        mediaArt.style.display = 'none';
        mediaArtFallback.style.display = 'grid';
      };
    } else {
      mediaArt.style.display = 'none';
      mediaArtFallback.style.display = 'grid';
    }

    if (session.isPlaying) {
      mediaPlayIcon.style.display = 'none';
      mediaPauseIcon.style.display = 'block';
    } else {
      mediaPlayIcon.style.display = 'block';
      mediaPauseIcon.style.display = 'none';
    }
  } else {
    mediaCard.classList.remove('visible');
  }
}

async function refreshStatus() {
  try {
    const res = await chrome.runtime.sendMessage({ type: 'beacon-get-status' });
    if (res) {
      updateStatusPill(res.connectionState);
      updateCredentialsDisplay(res.port, res.token);
      updateMediaSession(res.activeSession);

      if (res.connectionState === 'connected') {
        if (!statusMsg.textContent || statusMsg.classList.contains('error')) {
          showStatus(res.activeSession ? 'Connected & streaming to Dynamic Island.' : 'Connected to Beacon.');
        }
      } else if (res.connectionState === 'connecting') {
        showStatus('Connecting to Beacon on loopback…');
      } else if (res.connectionState === 'rejected') {
        showStatus('Beacon rejected link. Copy a fresh link from Beacon.', true);
      }
    }
  } catch {
    // Fallback to storage
    const saved = await chrome.storage.local.get(['port', 'token', 'connectionState']);
    updateCredentialsDisplay(saved.port, saved.token);
    updateStatusPill(saved.connectionState);
  }
}

async function doPair(port, token) {
  showStatus('Connecting to Beacon…');
  updateStatusPill('connecting');
  const result = await chrome.runtime.sendMessage({ type: 'beacon-pair', port, token });
  if (!result?.ok) {
    showStatus('Pairing link invalid or rejected by Beacon.', true);
    updateStatusPill('error');
    return;
  }
  updateCredentialsDisplay(port, token);
  showStatus('Pairing saved. Connecting to Dynamic Island…');
  setTimeout(refreshStatus, 600);
}

// 1. Paste and Connect
pasteAndConnectBtn.addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    const parsed = parsePairingLink(text);
    if (!parsed) {
      showStatus('No valid Beacon pairing link on clipboard. Copy it from Beacon first.', true);
      return;
    }
    await doPair(parsed.port, parsed.token);
  } catch {
    showStatus('Clipboard permission needed. Or paste manually below.', true);
  }
});

// 2. Observe Active Tab
activeTabBtn.addEventListener('click', async () => {
  showStatus('Checking tab media…');
  const result = await chrome.runtime.sendMessage({ type: 'beacon-enable-active-tab' });
  if (result?.ok) {
    showStatus('Observing this tab. Start audio/video to stream to Beacon.');
    setTimeout(refreshStatus, 800);
  } else {
    showStatus('Could not access this tab. Reload tab and try again.', true);
  }
});

// 3. Toggle Key Visibility
toggleKeyBtn.addEventListener('click', () => {
  if (keyTokenInput.type === 'password') {
    keyTokenInput.type = 'text';
    eyeIcon.style.display = 'none';
    eyeOffIcon.style.display = 'block';
  } else {
    keyTokenInput.type = 'password';
    eyeIcon.style.display = 'block';
    eyeOffIcon.style.display = 'none';
  }
});

// 4. Copy Key
copyKeyBtn.addEventListener('click', async () => {
  if (!currentToken) {
    showStatus('No active pairing key saved.', true);
    return;
  }
  try {
    await navigator.clipboard.writeText(currentToken);
    copyIcon.style.display = 'none';
    copyCheckIcon.style.display = 'block';
    showStatus('Pairing key copied to clipboard! ✓');
    setTimeout(() => {
      copyIcon.style.display = 'block';
      copyCheckIcon.style.display = 'none';
    }, 1800);
  } catch {
    showStatus('Failed to copy key to clipboard.', true);
  }
});

// 5. Manual Connect
manualConnectBtn.addEventListener('click', async () => {
  const text = pairingLinkInput.value.trim();
  const parsed = parsePairingLink(text);
  if (!parsed) {
    showStatus('Format must be beacon://pair/<port>/<token> or port:token', true);
    return;
  }
  pairingLinkInput.value = '';
  await doPair(parsed.port, parsed.token);
});

// 6. Unpair / Forget
unpairBtn.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'beacon-unpair' });
  updateCredentialsDisplay(null, '');
  updateStatusPill('disconnected');
  showStatus('Companion unpaired. Paired credentials cleared.');
  mediaCard.classList.remove('visible');
});

// 7. Media Play / Pause Toggle
mediaPlayBtn.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({ type: 'beacon-popup-command', command: 'playPause' });
  setTimeout(refreshStatus, 300);
});

// Initial Load
refreshStatus();
