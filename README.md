# BoxCritters Modding API
API server for retrieving information about box critters that is normaly hard to retrive and other useful information and tools.
## Installation
Install Node js (>=7.x) for your operating system
Install nodemon for auto rebuilding (optional)
```
npm install -g nodemon
```
Build dependencies
```
npm install
```

## Usage
## Envirement Variables
```
NODE_ENV=development/production
PORT=3000
DISCORD_WEBHOOK=https://discordapp.com/api/webhooks/1234/abc123abc123abc123abc123
GH_APP_ID=1234
GH_APP_PK=ab1.123abc
WS_ORIGIN=boxcritters.github.io
WS_OAUTH_CLIENT_ID=abc123abc123abc123abc123
WS_OAUTH_CLIENT_SECRET=abc123abc123abc123abc123abc123abc123abc123
WS_REDIRECT_URL=https://bc-mod-api.herokuapp.com/callback
```
## starting
Without `nodemon`:
```
npm start
```
With `nodemon`:
```
nodemon
```
## Built With
* tn-webserver [github:tumblenet/tn-webserver]
    * http
* express [express/express]
* bc-admin-login [boxcritters/bc-admin-login]
### version listing
* moment [moment/moment]
* request
* jsdom

### cors proxy
* puppertier
* absolutlify
* imageDataUri
### [feedback](http;//boxcritters.github.io/feedback)
* octokit [octokit/rest.js]
* bodyParser
## Contributing
* Edit sites with [sites.json](data/sites.json)
* Source code is in [src](src/)

Any major chages discuss in discord or open an issue.
Make sure to use the Issue and Pull request templates if I make them.
## Licensing
More information in [LICENSE.md](LICENSE).
