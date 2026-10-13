# Measurement notes

One file per service records what has actually been observed on a real device: which hostnames an app calls during which action, on which app version, and when. The rules in `services/` are only as good as these notes, so a rule that claims `status: "stable"` or lists a measurement must be backed by a table here.

## Why measure

A service shares hostnames between its feed and its chat. For example, `graph.facebook.com` serves both the Facebook app and Messenger. Nobody publishes a list of which hostname belongs to which feature, so the only reliable source is to watch the DNS queries of one app while using one feature at a time.

## How to measure

1. Use a test device with only the app under test installed from that service. A second app from the same company writes hostnames into the same log and makes the result ambiguous.
2. Turn on the Hush measurement mode, which records queries and blocks nothing.
3. Perform these actions one at a time and note the time of each: open the app, send and receive a text message, send and receive a photo, make a voice call, open a link to another website, open a link to a page of the service itself.
4. Export the log and group the hostnames by action. A hostname that appears during pure chat actions belongs to chat. A hostname that appears only when a link opens belongs to web.
5. Write the result in `notes/<service>.md` using `_template.md`, add a `measurements` entry to `services/<service>.json`, and write the rules from it.
6. Switch the rules on, repeat step 3 and confirm that chat still works and the web page is blocked.

Hostnames change over time. Always record the app version and the date.
