# TikTok

## Status

The whole-app block does not need hostnames, because it blocks by app. The web rule covers `tiktok.com` only.

## Packages

| Package | App | Checked on |
|---|---|---|
| `com.zhiliaoapp.musically` | TikTok (most regions) | not checked on a device |
| `com.ss.android.ugc.trill` | TikTok (some Asian regions) | not checked on a device |

`com.zhiliaoapp.musically` appears in a third-party package list. `com.ss.android.ugc.trill` is not confirmed by any source found so far. Verify both with `adb shell pm list packages | grep -i -E "musically|trill|tiktok"` on a device of the target region.

## Measurements

None needed for the app block. TikTok also uses many content-delivery hostnames (`tiktokv.com`, `tiktokcdn.com` and others reported by community blocklists). They only matter if a rule ever has to block TikTok traffic inside another app, which this rule set does not do.

## Known limits

TikTok can resolve hostnames through DNS over HTTPS, which a DNS-level blocker cannot see. Blocking by app avoids that for the TikTok app itself.
