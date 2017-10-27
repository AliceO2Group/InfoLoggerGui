# How to understand and develop InfoLoggerGui

## Setup environnement

```bash
git clone ...
cd InfoLoggerGui
# [configure OAuth, certificate and config.js](configuration.md)
npm install
npm run ils # if fake InfoLoggerServer needed
npm run dev
```

You need a MySQL and a InfoLoggerServer to connect to (MySQL optional, InfoLoggerServer soon optional too). InfoLoggerServer can be faked using `npm run ils`.

## Commands

Command  | Result
------------- | -------------
npm start | start app in production mode
npm run dev | start app in dev mode with auto-restart on file change
npm run test | will run eslint, mocha and qunit
npm run doc | build the doc in docs/API.md
npm run coverage | report coverage of tests
npm run ils | start local InfoLoggerServer with fake real-time data for dev purpose
npm run demo | start both InfoLoggerGui and a fake InfoLoggerServer

## Architecture

Global view:
* InfoLoggerServer concentrate logs via TCP streams
* MySQL keep the logs so we can query them
* InfoLoggerGui connects to both for 'querying' or 'stream'

InfoLoggerGui is a web server with its client part, it uses ajax and websocket though an API. OAuth allows to connect and have access to the static files (the client).

The application is made of one CSS and JS components. Each component has its view and some events listeners. All the data are stored in the model (App class) which hinerits from an Observable interface. As soon as the model changes, the views update.

The index.tpl is the main controller: it loads CSS and JS files then instanciates the model and the views.

## Templating engine

Here a basic example:

```JS
const TODO = new TODO();

```

### Filters for query and live

Raw input are stored inside rawFilters, which allow to render form with the user's inputs.

```
{
  timestamp: {
    $gte: '1/1/1989',
    $lte: ''
  },
  level: {
    $lte: '6'
  },
  username: {
    $notin: 'coucou'
  },
  severity: {
    $in: 'W E'
  },
  hostname: {
    $in: ''
  }
}
```

Each time rawFilters changes, it updates filters which is a parsed version with operators, types and empty values handled. If you know MongoDB you should be familiar with it.

```
{
  timestamp: {
    $gte: 'Sun Jan 01 1989 00:00:00 GMT+0100 (CET)'
  },
  level: {
    $lte: 6
  },
  severity: {
    $in: ['W', 'E']
  },
  username: {
    $nin: ['coucou']
  }
}
```

The parsed structure is used for query or live modes. $in operator split on spaces. Some fields are casted to Dates or Numbers.

## Tips: Insert fake data into MySQL and check them

```bash
echo "CREATE DATABASE INFOLOGGER;" | mysql
mysql INFOLOGGER < logs.sql
mysql
use INFOLOGGER;
select * from messages limit 10;
```

If the server is remote with private port, you can build a bridge: `ssh -L 3306:127.0.0.1:3306 user@remote`

