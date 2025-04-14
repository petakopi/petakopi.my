# README

[![View performance data on Skylight](https://badges.skylight.io/typical/PLhsfZX5VaN3.svg?token=SEtrrK0LQlsgB9CP-lMwKPXY53ZM-CyAOML5DRWRb-g)](https://www.skylight.io/app/applications/PLhsfZX5VaN3)

## Notes

This is the source code for [petakopi.my](https://petakopi.my).

Feel free to start a [discussion](https://github.com/petakopi/petakopi.my/discussions)
before starting the work.

## Moderators

I've created a
[guide](https://amree.notion.site/Moderator-Guide-bb65c644fea5489aaaf1347477018ec9)
for moderators on how to verify the data.

## Development

For a quick start, use [Development Containers](https://containers.dev/).

### Development Containers

Clone the project and open it using [Visual Studio
Code](https://code.visualstudio.com/). Make sure you have installed [Dev
Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
extension.

You should see a popup asking if you want to "Reopen in Container". If you
don't:
- Use `CMD + SHIFT + P`
- Select "Dev Containers: Reopen in Container"

It's going to take a while to install everything for the first time. But, if
everything works well, you should be seeing something like this:

```
Running the postCreateCommand from devcontainer.json...

[58478 ms] Start: Run in container: /bin/sh -c bin/setup
== Installing dependencies ==
...

== Preparing database ==
...

== Removing old logs and tempfiles ==
Done. Press any key to close the terminal.
```

Open two new terminals from VS Code and run them (separately):

```
./bin/rails s # to start the Rails server
./bin/vite dev # to start the Vite server
```

You should make sure nothing is running on port `3000` as `rails s` will forward
that port. That is the only port exposed to the host.

You should be able to access the website at http://localhost:3000 🎉.

You can access the database with:

```
psql -U postgres -h postgres -d petakopi_development
```

If you have to rebuild the image, use the same menu but choose "Rebuild
Container without Cache".

I am not that familiar with Development Container, but it seems like you have
to stop the services manually once you close your editor. See the helpful
commands below.

Additionally, if you accidentally closed your editor and you want to open it in
the container again, you'd have to stop the services first. Otherwise, there
will be errors with the connections.

I am pretty sure there are better ways to do this, but worst case scenario,
remove the containers and start again. It is going to take a little bit of time
IF you delete the volumes as everything needs to be installed again.

Some helpful docker commands:

```bash
# Stop and remove the containers
docker compose -f .devcontainer/compose.yml down

# Stop and remove the containers with the volumes
docker compose -f .devcontainer/compose.yml down -v

# See if your container is still running
docker ps
```

To get started with some data, you can seed your development with:

```
rails seeder:tags
```

Due to recent changes, I need to update the seeders too.

### Credentials

petakopi.my uses couple of services and we need to add the credentials if we
want to develop features related to them.

In order to set the values, put them in `.env.development.local` and make sure
to restart the server if you update the contents.

```
CLOUDFLARE_TURNSTILE_SECRET_KEY=
CLOUDFLARE_TURNSTILE_SITE_KEY=
GOOGLE_API_KEY_API=
GOOGLE_API_KEY_WEB=
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_SERVICE_SPREADSHEET_EMAIL=
GOOGLE_SERVICE_SPREADSHEET_PRIVATE_KEY=
MAPBOX_API_KEY=
RESEND_API_KEY=
SECRET_KEY_BASE=
TELEGRAM_BOT_TOKEN=
TELEGRAM_NOTIFICATION_CHAT_ID=
TINIFY_API_KEY=
```

## Reports

Use [metabase.com](https://metabase.com)

```
# Pull for the first time
docker pull metabase/metabase:latest

# Run on port 12345
docker run -d -p 12345:3000 --name metabase metabase/metabase

# See the logs
docker logs -f metabase

# Setup SSH Tunnel
ssh -N -L 5454:localhost:5432 deployer@petakopi

# Add database
psql -U petakopi -h localhost -p 5454 -d petakopi

# Get the password
tomo env:show
```

## Production

Helpful commands:

```
tomo env:set FOO=bar
tomo run -- puma:log -f
tomo petakopi:tasks db:migrate:status
tomo petakopi:tasks report:closed_coffee_shops
```

## DISCLAIMER

This is not how I usually code, just saying 😛

## Sponsors

[<img src="https://i.imgur.com/WYVGZ6Z.png" width="20%" />](https://skylight.io)

## Contacts

[@petakopi.my](https://www.instagram.com/petakopi.my/)
