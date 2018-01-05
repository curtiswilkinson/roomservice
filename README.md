# roomservice

[![Build Status](https://travis-ci.org/curtiswilkinson/roomservice.svg?branch=master)](https://travis-ci.org/curtiswilkinson/roomservice)

Roomservice is a small, friendly build tool that uses file system timestamps to
determine if a "Room" needs to be built.

## Use case

This project was born out of working in an application containing many,
frequently changing microservices. When doing things such as pulling from
version control, it was painful to have to rebuild the entire world (or try and
figure out what needs to be built).

Roomservice solves this problem by keeping a cache of the last time it built a
room, and doing very quick diffing to determine what actually needs to be built.

## Getting started

You can get started by running `npm i -g roomservice` to install roomservice
globally on your computer.

In the project that you'd like to use roomservice, you can run `roomservice
--init` and it will automatically create a template `roomservice.config.toml`
for you.

If you are in a project that takes a considerable amount of time to build, and
you know it's up-to-date, I would suggest running `roomservice --cache-all` to
start you off with all rooms flagged as up-to-date. This will avoid you having
to build everything to start benefiting from roomservice diffing your rooms.

## Config

In roomservice config, a room configuration looks like this:

```toml
[room.name]
path = "./path/to/watch/and/run/commands/in"
run = "echo runs asynchronously"
beforeService = "echo run asynchronously, but all must finish before continuing"
runSync = "echo run synchronously, and all runSync hooks must finish before continuing"
afterService = "echo run asynchronously, and all must complete before continuing"
```

_Note:_ All commands are run in the `path` provided, adjust any relative paths
accordingly

So for example, a project with two docker services might look like this to avoid
the known speed issues with parallel container builds:

```toml
[room.api]
path = "./api"
beforeService = "yarn && yarn build"
runSync = "docker-compose build api"

[room.client]
path = "./client"
beforeService = "yarn && yarn build"
runSync = "docker-compose build client"
```

This would build as follows (assuming no roomservice cache saves you!):

1. Both `beforeService` commands will start running at the same time
2. Roomservice will wait for both `beforeService` commands to complete, then
   move on
3. Because the `runSync` command is synchronous, it will do one `docker-compose
   build` first, then do the second

## CLI

* `--help` will list all available commands
* `--project` or `-p` allows you to provide the path to the roomservice project
  or config file
* `--init` will create a `roomservice.config.toml` file
* `--no-cache` will skip all caching steps and build all rooms
* `--cache-all` will not build anything, but flag all rooms as updated (good for
  the initial setup)
* `--ignore` will take a list of room names, and ignore them during the build
