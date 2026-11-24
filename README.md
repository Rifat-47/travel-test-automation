# Travel test automation

Playwright tests (JavaScript, Chrome) and test cases for the Travel customer site.

## Setup

Needs Node 22+, Google Chrome, [pre-commit](https://pre-commit.com) and [gitleaks](https://github.com/gitleaks/gitleaks).

```bash
npm ci
cp .env.example .env   # then fill it in
pre-commit install
```

## Run

| Command                          | Runs                             |
| -------------------------------- | -------------------------------- |
| `npm test`                       | Everything                       |
| `npm run test:smoke`             | Smoke                            |
| `npm run test:features`          | All features                     |
| `npm run test:id -- TRV-0-SMK01` | One test case                    |
| `npm run check`                  | Lint, format and document checks |

Workers, retries and timeouts are set in `config/test.config.js`.

## How it fits together

- `test-cases/`: one document per feature, and the feature list
- `tests/`: specs, each titled with its test case ID
- `pages/`: page objects
- `services/`: API setup
- `fixtures/`: `test` for guests, `customerTest` for the shared login session
- `data/`: test inputs, never secrets

`customerTest` signs in once per worker. Tests that log out or change a password use their own account.

Work happens on a branch; `main` is updated through pull requests. CI runs the checks on every pull request and push to `main`.
