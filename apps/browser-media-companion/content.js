(() => {
  if (globalThis.__beaconMediaObserver) return;
  globalThis.__beaconMediaObserver = true;
  const media = () => [...document.querySelectorAll('audio,video')];
  const current = () => media().find((item) => !item.paused && !item.ended) || media()[0];
  const observed = new WeakSet();
  let reportTimer;
  let activityAt = Date.now();
  const artworkUrl = () => {
    const artwork = navigator.mediaSession?.metadata?.artwork;
    const candidate = Array.isArray(artwork) ? artwork.at(-1)?.src : document.querySelector('meta[property="og:image"], meta[name="twitter:image"]')?.content;
    try { return candidate ? new URL(candidate, document.baseURI).href : undefined; } catch { return undefined; }
  };
  const firstText = (...selectors) => {
    for (const selector of selectors) {
      const text = document.querySelector(selector)?.textContent?.trim();
      if (text) return text;
    }
    return undefined;
  };
  const pageTitle = () => {
    const explicit = navigator.mediaSession?.metadata?.title || firstText('h1.ytd-watch-metadata', 'h1.title', '[data-testid="context-item-info-title"]');
    const fallback = document.title.replace(/\s+[-|]\s+(YouTube|YouTube Music|SoundCloud|Spotify|Bandcamp)$/i, '').trim();
    return explicit || fallback || 'Web Media';
  };
  const pageArtist = () => navigator.mediaSession?.metadata?.artist
    || firstText('#owner #channel-name a', 'ytd-channel-name a', '.soundTitle__username', '[data-testid="context-item-info-artist"]');
  const snapshot = () => {
    const item = current();
    return { hasMedia: Boolean(item), isPlaying: Boolean(item && !item.paused && !item.ended), position: item?.currentTime || 0, duration: Number.isFinite(item?.duration) ? item.duration : undefined, title: pageTitle(), artist: pageArtist(), artworkUrl: artworkUrl(), activityAt };
  };
  const report = () => chrome.runtime.sendMessage({ type: 'beacon-observe', snapshot: snapshot() }).catch(() => undefined);
  const scheduleReport = (immediate = false) => {
    if (immediate) { clearTimeout(reportTimer); reportTimer = undefined; report(); return; }
    if (!reportTimer) reportTimer = setTimeout(() => { reportTimer = undefined; report(); }, 500);
  };
  const observe = (item) => {
    if (observed.has(item)) return;
    observed.add(item);
    ['play', 'pause', 'ended', 'timeupdate', 'durationchange', 'volumechange', 'loadedmetadata'].forEach((event) => item.addEventListener(event, () => { if (event !== 'timeupdate') activityAt = Date.now(); scheduleReport(); }));
  };
  media().forEach(observe); scheduleReport(true);
  new MutationObserver(() => { media().forEach(observe); scheduleReport(); }).observe(document.documentElement, { childList: true, subtree: true });
  chrome.runtime.onMessage.addListener((message, _sender, respond) => {
    if (message.type === 'beacon-media-snapshot-query') { scheduleReport(true); return; }
    if (message.type !== 'beacon-media-command') return;
    const item = current();
    if (!item) { respond({ status: 'unsupported' }); return; }
    if (message.command === 'playPause') { (item.paused ? item.play() : (item.pause(), Promise.resolve())).then(() => { report(); respond({ status: 'confirmed' }); }).catch(() => respond({ status: 'permission-denied' })); return true; }
    respond({ status: 'unsupported' });
  });
  setInterval(() => scheduleReport(), 15_000);
  addEventListener('pagehide', () => chrome.runtime.sendMessage({ type: 'beacon-session-removed' }).catch(() => undefined), { once: true });
})();
