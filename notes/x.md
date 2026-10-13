# X

## Status

The app block does not need hostnames. The web rules cover `x.com` and `twitter.com`.

## Packages

| Package | App | Checked on |
|---|---|---|
| `com.twitter.android` | X (Twitter) | not checked on a device |

The name appears in a third-party integration document. Confirm it with `adb shell pm list packages | grep twitter`.

## Measurements

None needed for now.

## Known limits

`t.co` is not blocked. It is the link shortener that many websites and apps use, so blocking it breaks unrelated links. Direct messages are part of the X app and are blocked with it.
