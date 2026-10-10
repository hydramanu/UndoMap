# UndoMap

A local-first browser extension for reviewing recovery evidence **before** a subscription, purchase, or account deletion, and keeping a recovery plan afterward.

## What works

- User-triggered scanning of visible English action labels and policy blocks.
- Exact policy clauses for time windows, financial terms and recovery instructions, with unknown and conditional states.
- An optional page-local click guard. It pauses supported clicks and requires a fresh user click to proceed; it never performs an action for the user.
- Manual policy-text analysis when scanning is unavailable.
- Local recovery cards, user-selected reminders, completion/removal, search and category filters.
- JSON evidence export and calendar `.ics` export.
- Chromium MV3 and Firefox MV3 packages, built from the same source without runtime dependencies.
- A fictional demo and safe storefront fixture for development.

This release uses transparent deterministic rules. It does **not** contain a trained ML model, embeddings, an LLM, crowdsourced recovery paths or a calibrated UndoScore. The 0–4 indicator counts evidence categories, not reversibility or confidence. Model training requires a labeled, consented benchmark and separate evaluation.

## Install

Build with `python tools/build.py`, or use the ZIPs in `dist/`.

**Chrome / Edge / Brave / compatible Chromium browsers:** extract `undomap-chromium.zip`; open the browser's Extensions page; enable Developer mode; choose **Load unpacked**; select the extracted folder containing `manifest.json`. Alternatively load `dist/chromium` directly. Pin the toolbar icon, open a regular webpage, and choose **Scan this page**.

**Firefox:** extract `undomap-firefox.zip`; open `about:debugging#/runtime/this-firefox`; choose **Load Temporary Add-on** and select `manifest.json` inside the folder. This build requires Firefox 142+. Temporary installations disappear on restart. Persistent distribution requires Mozilla signing.

Safari is not packaged: it requires an Apple application wrapper and signing. These builds are not published to browser extension stores. Browser-specific runtime compatibility beyond the checks in `docs/VALIDATION.md` is not claimed.

## Try the web demo

Run `start-demo.bat`, or `npm run demo`, then open:

`http://127.0.0.1:8770/demo/index.html`

The demo reuses the actual analysis and UI code with fictional data and localStorage. It does not inject into webpages, show system notifications or access the extension's cards. For real scanning after installation, use `demo/fixture.html` served on localhost as a harmless test page.

## Privacy and limitations

No account, backend, telemetry, external fonts or remote code. Permissions are `activeTab`, `scripting`, `storage`, `alarms`, and `notifications`. There are no persistent all-site permissions. See `PRIVACY.md`.

The scanner only reads top-document visible policy elements and action labels after the user invokes it. Form controls and contenteditable ancestors are excluded. It can miss text in custom layouts, shadow roots, frames, authenticated policies, non-English content, or pages with no relevant policy blocks. It may combine clauses from different products on the same page: always check scope. It never fetches linked policies automatically.

The click guard is a best-effort reminder, not a security boundary. It does not cover keyboard form submissions, earlier event handlers, frames or custom controls. Navigation removes it. Scanning does not enable it automatically.

Reminder dates are chosen by the user. Relative durations are retained as text and are not converted to deadlines because the start event and timezone may be unknown. Notifications can be delayed while a browser/device is closed or asleep, or blocked by OS settings. The extension reconstructs pending alarms at browser startup. Export calendar reminders for a separate reminder channel.

Saved cards are evidence snapshots, not proof of a completed transaction. Cards may be stale and do not establish eligibility or enforce a policy. Refund/cancellation actions always remain under the user's control.

## Develop and test

Requires Node 20+ for tests and Python 3 for packaging/demo. No npm install is needed.

```text
npm test
npm run build
npm run demo
```

`extension/core.js`: action rules, policy extraction and card validation.
`extension/content.js`: on-demand DOM scan and optional click guard.
`extension/background.js`: serialized storage and reminder lifecycle.
`extension/popup.*`: scan/review/save interface.
`extension/dashboard.*`: recovery vault and exports.
`tools/build.py`: separate manifests, icons and ZIPs.

## Browser documentation

- [Chrome activeTab](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab)
- [Chrome alarms](https://developer.chrome.com/docs/extensions/reference/api/alarms)
- [Mozilla background scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/background)
- [Mozilla browser-specific settings](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings)
