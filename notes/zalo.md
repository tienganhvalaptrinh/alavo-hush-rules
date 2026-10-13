# Zalo

## Status

Chat only. The rule set keeps the app working and blocks nothing.

## Packages

| Package | App | Checked on |
|---|---|---|
| `com.zing.zalo` | Zalo | not checked on a device |

Not confirmed by any source found so far. Verify it with `adb shell pm list packages | grep zalo`.

## Measurements

None yet. The question to answer: does the Timeline section (the feed inside Zalo) use hostnames that chat does not? If it does, a block rule for those hostnames could separate them.

## Known limits

The Timeline lives inside the chat app. Until a measurement shows a split, it cannot be blocked without blocking chat.
