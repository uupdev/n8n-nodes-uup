# n8n-nodes-uup

You Up? is an uptime monitoring service that checks your websites, APIs, servers and cron jobs from several locations and alerts you by email, Slack, WhatsApp, SMS and more, only when an outage is confirmed.

This package adds the **You Up?** node to [n8n](https://n8n.io/), for [You Up?](https://uup.dev/):

- **Heartbeat → Send** calls a Heartbeat URL when your workflow succeeds. If a run fails, or the workflow stops running, no call arrives and You Up? alerts you.
- **Status**, **Project**, **Monitor** and **Incident** read from the [You Up? API](https://docs.uup.dev/api/).

[Installation](#installation) · [Heartbeat](#heartbeat) · [Operations](#operations) · [Credentials](#credentials) · [Compatibility](#compatibility) · [Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation, and install `n8n-nodes-uup`.

## Heartbeat

Use this node to find out when a scheduled workflow stops working.

1. In You Up?, create a **Heartbeat** Monitor. Give it the same schedule as your workflow.
2. Copy the **Heartbeat URL** from the Monitor's **Checks** card.
3. In n8n, add the **You Up?** node as the last node of the workflow, choose **Heartbeat** and **Send**, and paste the URL.

The node runs only when every node before it succeeded, so a failed run sends nothing. If no call arrives in time, You Up? opens an Incident and alerts you.

Things to know:

- The node calls the URL **once per run**, however many items reach it. It returns one item: `status` (`sent` or `failed`), `statusCode`, `attempts` and `sentAt`.
- Each try waits up to 10 seconds. After a network error or a server error, the node tries up to 3 more times. You can change both under **Options**.
- By default, a failed call does not stop the workflow, and the node reports the failure in its output. To stop the workflow instead, turn on **Options → Fail on Error**.
- n8n does not run a node that gets no items. If the node before the Heartbeat can return no items on a good run, turn on **Settings → Always Output Data** on that node.
- Anyone who has the Heartbeat URL can call it. Keep it private: the node masks it like a password.

Heartbeat → Send needs no credentials, and never sends your API token.

## Operations

Apart from Heartbeat → Send, the **You Up?** node only reads data. It does not change anything in your account.

| Resource | Operation | What it returns |
| --- | --- | --- |
| Heartbeat | Send | One item: whether the call got through. See [Heartbeat](#heartbeat). |
| Status | Get | One item for each Project: its Monitors that are not ok, its open Incidents and its open Regional outages. You can limit it to one Project. |
| Project | Get Many | The Projects your API token can read. |
| Monitor | Get | One Monitor, with its Checks, their status and any open Incident. |
| Monitor | Get Many | A Project's Monitors. Filter by type, state, or words in the name or target. |
| Incident | Get | One Incident, with who acknowledged it and who ended it. |
| Incident | Get Evidence | Where an Incident stopped, in plain words, and what each location saw. |
| Incident | Get Many | A Project's Incidents, newest first. Filter by Monitor, and by open or ended. |

The node can also be used as a tool by n8n's AI Agent.

## Credentials

Every operation except Heartbeat → Send needs a You Up? API token.

1. Sign in to [You Up?](https://app.uup.dev/). In the sidebar, open **API tokens** and press **New token**.
2. Choose the Project it reaches, or every Project. A **Read-only** token is enough for this node.
3. Copy the token (`uup_api_…`). You Up? shows it only once.
4. In n8n, create a **You Up? API** credential and paste the token.

Only the owner and admins of an Organization can make tokens. See [API tokens](https://docs.uup.dev/api/tokens/).

## Compatibility

Needs n8n 2.46.1 or later.

## Resources

- [You Up?](https://uup.dev/)
- [You Up? documentation](https://docs.uup.dev/)
- [Heartbeat Monitors](https://docs.uup.dev/monitors/heartbeat/)
- [You Up? API reference](https://docs.uup.dev/api/)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## License

[MIT](LICENSE)
