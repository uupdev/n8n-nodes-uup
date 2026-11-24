# Changelog

## 0.2.0

- **Breaking:** the **You Up? Heartbeat** node is now part of the **You Up?** node, as **Heartbeat → Send**, as n8n's verification asks for one action node per package. It works as before: one call per run, the same Options, and no credentials. A workflow that used **You Up? Heartbeat** needs that node replaced with **You Up?**, set to Heartbeat → Send.

## 0.1.2

- Fix: the Project list failed with "Invalid URL" when the **You Up?** node is used as an AI Agent tool. The list now loads in both places.

## 0.1.1

- No change to the nodes. This release is published with npm trusted publishing, without a token.

## 0.1.0

- First release: the **You Up? Heartbeat** node, and the **You Up?** node with Status, Project, Monitor and Incident reads.
