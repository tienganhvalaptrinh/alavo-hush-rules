# <Service name>

## Status

<!-- One line: unmeasured, partly measured, or measured on <date>. -->

## Packages

| Package | App | Checked on |
|---|---|---|
| `com.example.app` | Name of the app | YYYY-MM-DD |

Check a package name on a device with `adb shell pm list packages | grep -i <word>`, or in the app's Google Play address, which ends with `?id=<package>`.

## Measurements

Device and Android version:

| Date | App version | Action | Hostnames seen | Belongs to |
|---|---|---|---|---|
| YYYY-MM-DD | 1.2.3 | Send text message | `example.com` | chat |

## Known limits

<!-- What the rules cannot do, for example a feed that shares every hostname with chat. -->
