# UndoMap privacy disclosure

Version 0.1.0 — October 10, 2026.

UndoMap does not operate a server or transmit page content, saved cards, identifiers or analytics to its developer or another service. There are no API keys, remote models, advertisements or telemetry.

After the user clicks Scan, an isolated script reads visible action labels and selected static policy elements from the current top-level webpage. Form field values, passwords, file contents, cookies and browser history are not collected. It excludes blocks inside forms or editable areas. Scanning can still include personal information already displayed in ordinary page text. Basic email, long-number and secret-pattern filtering reduces some incidental data, but is not a complete anonymization system. Inspect evidence before saving or exporting it.

Only cards explicitly saved by the user persist. They contain a title, the website origin, policy evidence and selected same-site policy links, timestamps and optional reminder time. Query strings and fragments are removed from saved policy links; their paths can still contain identifiers. Storage is local to the browser profile and is not encrypted by UndoMap. Standard browser/OS protections apply. Removing a card removes it from extension storage and clears its pending alarm. Previously exported files are not affected.

Permissions:

| Permission | Purpose |
|---|---|
| activeTab | Temporary access to the current page after user invocation |
| scripting | Inject local scanning and optional guard code |
| storage | Keep recovery cards in this browser |
| alarms | Schedule user-selected review reminders |
| notifications | Show a generic reminder without exposing card details |

The optional guard does not submit, purchase, cancel, authorize or delete anything. Opening a policy link is ordinary browser navigation to the site selected by the user. No link is fetched automatically.

JSON and calendar exports are explicit user actions; exported files can include card titles and site origins. Keep these files private. The website demo uses a separate localStorage store, fictional fixtures and no extension notifications.

Uninstalling the extension removes its local storage according to browser behavior. Store submission, legal review and broader compatibility validation remain future release steps.
