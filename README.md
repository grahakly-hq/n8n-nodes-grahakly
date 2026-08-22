# n8n-nodes-grahakly

An [n8n](https://n8n.io) community node for [Grahakly](https://grahakly.com) — send WhatsApp
messages and templates, and create contacts, from your n8n workflows.

[Grahakly](https://grahakly.com) is an AI-powered customer engagement platform built on the WhatsApp
Business API. This node calls the Grahakly API, so your WhatsApp number, templates, media and
rate-limits are all managed in Grahakly while n8n orchestrates the flow.

## Installation

Follow the n8n [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/),
or in a self-hosted n8n: **Settings → Community Nodes → Install** and enter `n8n-nodes-grahakly`.

## Credentials

You need a Grahakly API key.

1. In Grahakly, go to **Settings → API Keys** and create a key. It starts with `egk_`.
2. Grant it the scopes for what you will do: `messages:send` to send, `contacts:write` to create
   contacts.
3. In n8n, create a **Grahakly API** credential and paste the key. Leave the Base URL as
   `https://api.grahakly.com` unless you run a self-hosted or staging instance.

The key is shown only once — copy it when you create it.

## Operations

### Message

- **Send Text** — send a free-form text message. WhatsApp only allows this inside the 24-hour
  customer service window (i.e. after the customer has messaged you). Outside it, use a template.
- **Send Template** — send an approved WhatsApp template by name and language, with optional
  component parameters as a JSON string. This is the only way to open a new conversation.

### Contact

- **Create** — create a contact from a phone number (E.164), with optional name, email and your own
  external ID.

## Example

Send an approved template `order_update` (English) to a customer, filling one body variable
with their name.

1. Add the **Grahakly** node and select **Message → Send Template**.
2. **From Number** — pick your WhatsApp business number from the list.
3. **To (Phone Number)** — the recipient in E.164, e.g. `+919876543210`.
4. **Template** — pick `order_update (en)` from the list.
5. **Components JSON** — paste the parameters for the template's variables. For a template whose
   body is `Hi {{1}}, your order has shipped.`, one text variable, this is:

   ```json
   [
     {
       "type": "body",
       "parameters": [
         { "type": "text", "text": "Anand" }
       ]
     }
   ]
   ```

   The delivered message reads: *Hi Anand, your order has shipped.* Leave **Components JSON** empty
   for a template with no variables. The structure matches the WhatsApp Cloud API `components`
   array, so header, button and other component types are supported the same way.

Executing the node returns the Grahakly API response, including the message ID.

## Compatibility

Built against the n8n community node API v1. Requires n8n 1.x and Node.js 20.15 or later.

## Roadmap

This first release covers outbound sending and contact creation. A **Grahakly Trigger** node — to
start workflows from inbound messages and delivery/read status — is planned next.

## Resources

- [Grahakly](https://grahakly.com)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE.md)
