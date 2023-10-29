# README

[![View performance data on Skylight](https://badges.skylight.io/typical/PLhsfZX5VaN3.svg?token=SEtrrK0LQlsgB9CP-lMwKPXY53ZM-CyAOML5DRWRb-g)](https://www.skylight.io/app/applications/PLhsfZX5VaN3)

## Notes

This is the source code for [petakopi.my](https://petakopi.my).

Feel free to start a [discussion](https://github.com/amree/petakopi/discussions)
before starting the work.

## Moderators

I've created a
[guide](https://amree.notion.site/Moderator-Guide-bb65c644fea5489aaaf1347477018ec9)
for moderators on how to verify the data.

## Development

Pre-seed DB:

```
rails seeder:locations
rails seeder:tags
```

### Google Credentials

Depending on the setup, we may have to allow our IP to use Google API
[here](https://console.cloud.google.com/google/maps-apis/credentials).

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
````

## DISCLAIMER

This is not how I usually code, just saying 😛

## Sponsors

[<img src="https://i.imgur.com/WYVGZ6Z.png" width="20%" />](https://skylight.io)

[<img src="https://i.imgur.com/3CJ96rE.png" width="20%" />](https://appsignal.com)

## Contacts

[@petakopi.my](https://www.instagram.com/petakopi.my/)
