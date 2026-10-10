# Validation record

The initial implementation is a local developer build, not a store-reviewed release.

Validated October 10, 2026:

- `npm test`: **25 passed, 0 failed**.
- Mozilla `web-ext lint --source-dir dist/firefox`: **0 errors, 0 warnings, 0 notices** (Firefox 142+ manifest).
- JavaScript syntax checks passed for all extension scripts.
- Browser demo: saved a fictional subscription card with a chosen reminder date, opened its persisted evidence in the vault, and exported a calendar file. The exported file contained the correct UTC timestamp and a `VALARM` display reminder.
- Actual installed-extension scanning, OS notifications, and all-browser runtime validation remain unchecked; use the checklist below before store distribution.

- 25 automated Node tests cover action rules, unknown evidence, negative/conditional clauses, redaction, safe links, card validation, serialized saves, message-origin checks, completion/removal alarm cleanup, duplicate notifications, and startup alarm reconstruction.
- Background tests use mocked WebExtension APIs; they do not prove operating-system notification delivery.
- Chromium and Firefox manifests use separate background configurations (service worker vs script array).
- All analysis and UI logic executes locally. No runtime npm dependencies or remote code.

Manual installed-browser release checklist:

1. Load the unpacked Chromium build and temporary Firefox build.
2. Open the localhost fixture and scan all three actions.
3. Enable the guard, close the popup and click a fixture button. Keep reviewing must dismiss; Allow my next click must allow one subsequent user click within 15 seconds.
4. Verify no form field text appears in the report.
5. Save a card with a future reminder; check the browser's alarm and OS notification behavior.
6. Restart the browser and confirm pending reminders are recreated.
7. Complete/remove a card and confirm the alarm disappears.
8. Test blocked browser/store pages, navigation, keyboard interactions and narrow UI layouts.

Passing local rules tests does not establish policy accuracy across arbitrary sites. A consented labeled corpus, precision/recall measurement, policy-scope annotation and adversarial negation tests are needed before ML or accuracy claims.

Browser preview: verified fictional policy scanning, saving a card with a user-selected date, and persistence into the vault using the actual shared UI. The preview is not an installed-extension runtime test.
