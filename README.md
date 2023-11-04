# Note Bot

A discord that enables you to: Quick add notes and share them with your friends!

## Install Deno

Read this to install deno **https://docs.deno.com/runtime/manual/getting_started/installation**

## Setup env

Create a file called **.env** and add the following variables:

- TOKEN="discord_token"
- DATABASE_URL="your_mongodb_uri"
- INVITE="your_discord_bot_invite_url"

## Running The Project

Run the following command in development:

```bash
deno task dev
```

In production switch from `dev` to `start`
