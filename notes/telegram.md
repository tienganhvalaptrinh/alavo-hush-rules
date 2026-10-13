# Telegram

## Status

Chat only. The rule set keeps the app working and blocks nothing.

## Packages

| Package | App | Checked on |
|---|---|---|
| `org.telegram.messenger` | Telegram (Google Play build) | not checked on a device |
| `org.telegram.messenger.web` | Telegram (build from telegram.org) | not checked on a device |

Neither name is confirmed by a source found so far. Verify them with `adb shell pm list packages | grep telegram`.

## Measurements

None needed while the rule set only keeps Telegram working.

## Known limits

Telegram channels are a feed inside a chat app. This rule set does not try to separate them.
