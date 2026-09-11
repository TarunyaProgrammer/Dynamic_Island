# Beacon Media Companion

Load this directory with `chrome://extensions` → **Developer mode** → **Load unpacked**. In Beacon, select **Pair Chrome companion** and paste the single `beacon://pair/...` link into the extension popup. The port and short-lived pairing token are embedded in that link; manual fields remain available only as a recovery option.

The extension observes `audio` and `video` elements only on YouTube, YouTube Music, Spotify Web, SoundCloud, and Bandcamp (including artist subdomains). It has no blanket host permission. The popup's **Observe this tab** action uses Chrome's temporary `activeTab` permission for the current tab; reload or revisit to grant it again. The extension sends only playback metadata and the Chrome window/tab/frame identity to `127.0.0.1`, after pairing. It does not send page content.

This is source-only MV3 development packaging: Chrome loads the plain JavaScript directly, so no build step is required. Before store publication, bundle/minify only if source maps and the reviewed permission set remain equivalent.
