# Monorepo import notes

The original `ui-mockup/` working folder was organized as the root of a single Git repository. Cloning its GitHub origin normally produces a folder named `scrum-app/`. The frontend and backend keep their original folder names and build systems.

| Original location | Monorepo location |
| --- | --- |
| `scrum-app-ui/` application | `scrum-app-ui/` |
| `scrum-app-api/` application | `scrum-app-api/` |
| Ten root HTML designs and `requirements.md` | `docs/design/legacy/` |
| Two root `*_IMPLEMENTATION.md` reports | `docs/history/` |
| Eight root `test_*.sh` scripts | `scripts/manual-api/` |
| Original frontend `.git/` | Ignored `.local-backups/scrum-app-ui.git/` on the original machine |
| Original API secret defaults | Ignored root `.env`; YAML now references environment variables |
| Original configuration and scripts | Ignored `.local-backups/originals/` on the original machine |

The frontend had one scaffold commit (`0868778`) and substantial uncommitted application work. Its metadata is preserved locally rather than deleted. The backend had no Git metadata in the supplied folder. The root repository starts with a snapshot of the current source, documentation, sanitized configuration, and helpers; there are no nested repos, gitlinks, or submodules.

The remote `https://github.com/briliandosimarmata/scrum-app.git` had no refs when inspected before import. Root branch: `main`; remote name: `origin`.

## Local history and configuration

On the original machine, inspect the preserved frontend history from the root with:

```bash
git --git-dir=.local-backups/scrum-app-ui.git log --oneline
```

The local backup directory contains private configuration/scripts as well as Git metadata and must remain ignored. It is absent from GitHub clones. The ignored `.env` retains the original development database credentials and cryptographic keys to preserve compatibility with the existing database. Fresh clones use `.env.example` and supply their own values.

Only the API YAML credential/default handling and manual helpers were adjusted in application/support files. No domain service, migration, or frontend feature was rewritten. The scripts now require environment-supplied credentials/IDs, avoid saved tokens/token previews, and use the correct login response token field.

## Import checks

The import reviews staged file types, ignore behavior, documentation links, secret patterns and known original secret values, retained Gradle wrapper, frontend-history backup, and Bash syntax for the eight edited helpers. It checks the remote main commit after push. Application builds, runtime requests, and test suites are outside this import's verification results.
