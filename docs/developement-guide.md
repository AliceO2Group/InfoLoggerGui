# How to understand and develop InfoLoggerGui

## Steps to Setup environnement before editing

1. npm install
1. servers
1. TODO

## App model

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

## Templating engine

TODO

## Tips: Insert fake data into MySQL and check them

```bash
echo "CREATE DATABASE INFOLOGGER;" | mysql
mysql INFOLOGGER < logs.sql
mysql
use INFOLOGGER;
select * from messages limit 10;
```

If the server is remote with private port, you can build a bridge: `ssh -L 3306:127.0.0.1:3306 user@remote`

