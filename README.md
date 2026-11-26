[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=sebiweise_twitterbot&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=sebiweise_twitterbot)

## TwitterBot

### Configuration
The functions read their credentials from environment variables (e.g. a `functions/.env` file, which is git-ignored):

- `OPENAI_API_KEY`, `OPENAI_ORGANIZATION` (optional)
- `TWITTER_CLIENT_ID`, `TWITTER_CLIENT_SECRET`
