# Instagram

## Status

Unmeasured. Only the web rule for `instagram.com` is on by default. The app component blocks the whole app, direct messages included, so it is off by default.

## Packages

| Package | App | Checked on |
|---|---|---|
| `com.instagram.android` | Instagram | not checked on a device |

The name appears in a third-party package list. Confirm it with `adb shell pm list packages | grep instagram`.

## Measurements

None yet. The question to answer: do the feed and direct messages of the Instagram app use different hostnames? If they do, a rule can block the feed and keep messages. If they do not, the app can only block the web version, and the product must say so.

## Known limits

Feed and messages live in one app. Until a measurement shows a split, there is no way to block only the feed.
