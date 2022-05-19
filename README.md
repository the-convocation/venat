# Venat
![Codacy grade](https://img.shields.io/codacy/grade/a68b8c55a3f6483080ca8b28fd5ec9f0)
![npm version](https://badge.fury.io/js/@the-convocation%2Fvenat-core.svg)
![License](https://img.shields.io/github/license/the-convocation/venat)

Venat is an open-source Discord bot for the Final Fantasy XIV community that is incredibly easy to self-host.

## Description

We aim to offer the following features:
- Provide moderation and role management.
- Provide integrations with popular ffxiv services and streaming sites.
- Provide fun community features like music, games, and give-aways.
- Provide admin dashboard for managing the bot.

We are working towards building this in a modular way, so that you can pick and choose what features you need for 
your server. This modular approach should also allow Venat to be extended to other game communities in the future.

## Warning
Venat is in very early development and is not yet intended for general use. It's available now for developers and other contributors.

## Development
### Pre-requisites
* Node >=16.6.0
  * Newer Node versions may be supported, but Venat is currently developed and tested only with Node 16.x.
* Yarn
* Docker
* nvm (optional)

### Setup Bot
1. Log into Discord portal: https://discord.com/developers/applications.
2. Create new application.
3. Select OAuth2 on left side.
4. Select Reset Secret.
5. Copy client secret and save for later.
6. Select URL Generator on left side.
7. Select the following scopes:
   1. bot
   2. applications.commands
8. Select the following bot permissions:
   1. Administrator
9. Copy generated url for later.
10. Select Bot on left side.
11. Add Bot to application.
12. Update the following settings:
    1. Presence Intent: On 
    2. Server Members Intent: On 
    3. Message Content Intent: On
13. Select the following bot permissions:
    1. Administrator
14. Open generated url in web browser to authorize.

### Setup Workspace
1. Fork repo https://github.com/the-convocation/venat.
2. Clone fork to local workspace.
3. Create copy of core/.env.example and rename to .env.
4. Update the following env variables in .env:
    1. Set TOKEN to the client secret from previous step.
    2. Set GUILD_ID_WITH_COMMANDS to your discord server id.
5. Open command line to root dir.
6. Run `yarn install`.

### Run Bot
1. Run `docker run -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=venat -p 5432:5432 postgres`.
2. Run `yarn dev`.
3. Verify bot is working by using the `/play` command.

## Modules
Venat is built with modules to allow server owners to select the features they want and help aid in development efforts.
The modules should be named as follows: venat-module-_area_-_feature_ (e.g. venat-module-xiv-market).

## Help
Discord server coming soon. For now, please <a href="https://github.com/the-convocation/venat/issues">open an issue</a>.

## License
This project is licensed under the [AGPL-3.0 license](LICENSE).