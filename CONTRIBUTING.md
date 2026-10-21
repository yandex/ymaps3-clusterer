# Contributing

Use Node.js 24 and install dependencies from the lockfile:

```sh
nvm use
npm ci
```

For the examples and JS API integration tests, set `APIKEY` in an untracked `.env`
file. Obtain a key at https://yandex.ru/maps-api/console/ and allow the referrer you
use locally (for example, `http://yandex.localhost/`). Set `REFERRER` accordingly.

```sh
npm start
npm run lint
npm run build
REFERRER=http://yandex.localhost/ npm test
npm pack --dry-run
```

Building the package makes no JS API requests, but the shared webpack
configuration requires a nonempty `APIKEY`. CI supplies the same GitHub Actions
secrets to the build and integration tests.

The Jest setup makes `navigator` and `crypto` writable in Jest 29 on Node 24 before
`@yandex/ymaps3-cli` installs its JSDOM globals. This only affects tests.

## GitHub Actions

- `.github/workflows/tests.yml` installs dependencies, builds and runs JS API
  integration tests on main and pull requests. Both the build and tests receive
  `APIKEY` and `REFERRER` from GitHub Actions secrets. Tests are not skipped when
  credentials are missing: the workflow fails. Fork PRs do not receive these
  secrets and cannot pass this workflow without a separate trusted run.
- `.github/workflows/release.yml` releases version tags without a `v` prefix, such
  as `0.0.13`. A manual run must also select a tag matching `package.json`.
  The tagged commit must already be part of `origin/main`; commits from unmerged
  branches are rejected before dependencies are installed.
  A release always requires passing integration tests with a real `APIKEY`.

Configure the GitHub Actions secrets `APIKEY` and `REFERRER` (for example,
`http://yandex.localhost/`, allowed by the key's restrictions). No npm publish
token is required.

## Enable npm publishing

Keep the migration PR unmerged until npm trusted publishing and the integration
test secrets are configured. Merging to main runs CI but does not publish;
publishing requires a version tag or a manual run against a matching tag.

An npm maintainer must configure the existing `@yandex/ymaps3-clusterer` package:

- Provider: GitHub Actions
- Organization: `yandex`
- Repository: `ymaps3-clusterer`
- Workflow filename: `release.yml` (not the full path)
- Environment: leave empty; this workflow does not declare an environment
- Allow direct `npm publish`

Use npm >=11.5.1; Node 24 includes a compatible npm version. Configure trust when
ready to release: its first successful publish must happen within two days.
See https://docs.npmjs.com/trusted-publishers for the current requirements.

After configuring trust and test secrets, merge the migration PR. Disable the
old repository's publisher before pushing the first new release tag. Publish a
new version; existing npm versions cannot be replaced. Verify the published
package and provenance before archiving the old repository or removing its
remaining publishing credentials.

## Release a version

Work from a clean `main` branch, with `origin` pointing to
`git@github.com:yandex/ymaps3-clusterer.git`, then run:

```sh
npm run bump
```

This increments the patch version, commits only the manifests, creates the
matching version tag and atomically pushes main with only that new tag. It
refuses a dirty checkout or a different branch. Do not use `git push --tags`
when importing historical tags.

Regular releases made with `npm run bump` are published to npm `latest`.
If you prepare a prerelease separately, such as `0.0.14-beta.1`, the workflow
automatically publishes it to `next`, leaving `latest` unchanged.
Git tags identify source commits; npm dist-tags identify installation channels.
The workflow checks that the Git tag matches `package.json` and that its commit
is part of `origin/main`; npm itself rejects publication of a version that has
already been used. Older commits in main's history are also eligible.
