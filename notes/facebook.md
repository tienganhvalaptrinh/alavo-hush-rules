# Facebook

## Status

Unmeasured. No hostname has been observed on a device yet. The web rules for `facebook.com` and `fb.com` are the public domains of the service. The `webview-in-messenger` component is experimental and off by default until it is measured.

## Packages

| Package | App | Checked on |
|---|---|---|
| `com.facebook.katana` | Facebook | not checked on a device |
| `com.facebook.orca` | Messenger | not checked on a device |

Both names appear in several third-party package lists. Confirm them with `adb shell pm list packages | grep facebook`.

## Measurements

None yet. Things to measure first:

- Every way to open Facebook from inside Messenger: the Facebook icon, a Facebook link in a message, the button that views a profile, a shared post. For each, record where it opens (a web view inside Messenger, the Facebook app, or the browser) and the hostnames it calls.
- Whether `www.facebook.com`, `m.facebook.com` and `web.facebook.com` are called during chat. If they are, the `webview-in-messenger` rules would break chat and must stay off.

## Known limits

Messenger and Facebook share hostnames such as `graph.facebook.com`. The web rule blocks `facebook.com` for every app, and the `messenger` chat component allows everything for Messenger, which wins for that app because a rule scoped to one app beats a rule scoped to all apps. Anything that Messenger needs but that is also blocked by a more specific Messenger rule would break, so keep Messenger-scoped block rules narrow.
