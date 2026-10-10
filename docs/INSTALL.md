# Load UndoMap on your computer

## Chrome, Edge, Brave

1. Open the browser's Extensions page (`chrome://extensions`, `edge://extensions`, or `brave://extensions`).
2. Enable Developer mode.
3. Click **Load unpacked**.
4. Select `C:\min sih\undomap\dist\chromium`.
5. Pin UndoMap, open an ordinary webpage, click its icon and choose **Scan this page**.

For another computer, extract `undomap-chromium.zip` first and select that extracted folder instead.

## Firefox 142 or later

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on**.
3. Select `C:\min sih\undomap\dist\firefox\manifest.json`.

This is a temporary developer install; Firefox removes it on restart. Permanent installation requires a signed package from Mozilla.

## Safe first test

Run `start-demo.bat`, then open `http://127.0.0.1:8770/demo/fixture.html` in the browser where UndoMap is installed. These fictional action buttons do nothing. Scan them, enable the optional guard, and review the popup before trying the extension on actual sites.

The web demo at `/demo/index.html` is useful for exploring the interface without installing anything. It cannot read other tabs or send desktop reminders.

If a scan fails, use **Or paste a policy** to review relevant text manually. Unsupported browser pages, iframe content and some custom layouts cannot be scanned. No installation or browser-store publication has been performed automatically.
