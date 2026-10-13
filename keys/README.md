# Signing key

`rules-signing.pub` is the public half of the key that signs `index.json`. The Android app embeds this public key and rejects any rule set whose signature does not verify, so a hijacked GitHub account alone cannot push rules to users.

The key is an ECDSA P-256 pair. The public key is the base64 text of its X.509 `SubjectPublicKeyInfo` (DER), which Android can load directly with `KeyFactory.getInstance("EC")` and `X509EncodedKeySpec`. The signature is over the exact bytes of `index.json`, stored as base64 in `index.json.sig`, in the DER format that `Signature.getInstance("SHA256withECDSA")` expects.

## Create the key (maintainers only, once)

```
npm run keygen
```

The command writes `keys/rules-signing.pub` and prints the private key on the terminal. Then:

1. Commit `keys/rules-signing.pub`.
2. In the repository settings, add the printed private key as the Actions secret `RULES_SIGNING_KEY`.
3. Close the terminal without saving the private key anywhere else. `.gitignore` already excludes `*.pem` and `*.key` as a second line of defence.

Until the secret exists, the publish workflow still runs but publishes `index.json` without `index.json.sig`, and logs a warning. The app must not accept unsigned rule sets in a release build.

## Replace the key

Running `npm run keygen -- --force` makes a new pair and invalidates every released app that embeds the old public key, because those apps then reject every new rule set. Only replace the key if the private key leaked, and ship an app update that embeds the new public key first.
