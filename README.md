# WORK IN PROGRESS

Discord bot, will play music and more.

## Installation
Clone the repo and install the dependances :
```
git clone https://github.com/MaximeDrml/PequodBot
cd ./PequodBot
npm install
```

Since prod deployement isn't done for now, you need to [install ts-node](https://www.npmjs.com/package/ts-node#installation) to start the bot.


#### Enter credentials

Create a ***.env*** file from ***.env.example***. Enter the followings elements :

- **BOT_TOKEN :** You bot's token.

- **CLIENT_ID :** You bot client ID

- **GUILD_ID :** The ID of your guild (server) for developpement.

## Deploy slash commands
```
ts-node commands.js
```
For developpement, we deploy on a single guild because deploying globally takes 1H.

## Start the bot
```
nodemon index.ts
```

