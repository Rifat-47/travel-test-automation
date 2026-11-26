# TRV-3 — Forgot and reset password: Test Cases

A customer who forgot their password asks for a reset link by email, opens it, and sets a new password. The link works once. Broken or used links say so and offer a new one.

**Applies to:** the customer site: Forgot password, the reset email, and Set new password.

**Global preconditions:**

- The site is running and can send email.
- Not signed in, and on `/forgot-password`, unless the case says otherwise.
- "A customer" means an account the test registers for itself, with an unused email alias and a strong password.
- Every email goes to an alias of the one test mailbox, so all of them arrive in that mailbox. Emails are looked for in its Inbox and Spam. "No email arrives" means none within 2 minutes.
- "A reset link" without an email means a link the test makes up, of the form `/reset-password?uid=…&token=…`.

**Checked by hand, not automated:** TRV-3-RST12, the hourly limit.

**Not covered:** link expiry. It is set in hours in the admin settings, so checking it needs a long wait or a change to shared settings.

## Part A — Reaching the pages

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-3-RST01 | Access | Forgot password opens from Login | On `/login` | Click **Forgot password?** | `/forgot-password`, heading `Forgot password?` |
| TRV-3-RST02 | Access | Login opens from Forgot password | None | Click **Sign in** | `/login` |
| TRV-3-RST03 | Form | The request form shows its field | None | Look at the form | Email address, marked `*`; **Send Reset Link**; **Sign in** link |
| TRV-3-RST04 | Access | A signed-in customer cannot open Forgot password | Customer signed in | Open `/forgot-password` | Sent to `/` |
| TRV-3-RST05 | Access | A signed-in customer cannot open a reset link | Customer signed in | Open a reset link | Sent to `/` |

## Part B — Requesting a link

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-3-RST06 | Request | Request a link for a registered email | A customer exists | Enter their email; click **Send Reset Link**; open the email | `Check your email` screen. One email arrives at their address: subject `Reset your password — ` and the site name, their name, how many hours the link lasts; **Reset My Password** opens `Set new password` |
| TRV-3-RST07 | Request | An unregistered email gets the same screen | None | Enter an unused email alias; submit | The same `Check your email` screen as RST06; no email arrives |
| TRV-3-RST08 | Email | The email is not case-sensitive | A customer exists | Request a link with their email in upper case | One email arrives at their address |
| TRV-3-RST09 | Request | Enter submits the form | None | Enter an unused email alias; press Enter | `Check your email` screen |
| TRV-3-RST10 | Request | Try a different email returns to the form | The `Check your email` screen is showing | Click **Try a different email** | The request form shows again |
| TRV-3-RST11 | Request | Back to login from the sent screen | The `Check your email` screen is showing | Click **Back to login** | `/login` |
| TRV-3-RST12 | Limit | Requests are limited to three an hour (manual) | An unused email alias has asked for a link three times; an account is then registered with it | Request a link for it again | `Check your email` screen; no email arrives |

## Part C — Request validation

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-3-RST13 | Validation | An empty email is rejected | None | Click **Send Reset Link** | `Email is required`; no request sent |
| TRV-3-RST14 | Email | A malformed email is rejected | None | Try `plain`, `a@b`, `@example.com` and `a b@example.com`, leaving the field each time | `Enter a valid email address` each time |
| TRV-3-RST15 | Email | The email cannot be longer than 100 characters | None | Type an email alias of 101 characters | The field keeps the first 100 |

## Part D — Request sending and failures

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-3-RST16 | Form | The button is blocked while sending | The server's reply is delayed | Enter an unused email alias; submit | `Sending…`, disabled; only one request sent |
| TRV-3-RST17 | Failure | A server failure is reported | The server fails with an error | Enter an unused email alias; submit | `Something went wrong. Please try again.` above the form; the form stays |
| TRV-3-RST18 | Failure | A lost connection is reported | The connection is lost | Enter an unused email alias; submit | `Network error — check your connection and try again.` above the form |

## Part E — Setting a new password

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-3-RST19 | Reset | Reset the password with the emailed link | A customer has asked for a link | Open the link; enter a new strong password twice; click **Reset Password**; click **Sign in**; sign in with the old password, then the new one | `Password reset!` screen; **Sign in** opens `/login`; the old password gets `Invalid credentials.`; the new one signs in |
| TRV-3-RST20 | Reset | A link works only once | A customer has reset their password with a link | Open the same link; set another new password | `Link expired or already used`; **Request a new link** opens `/forgot-password` |
| TRV-3-RST21 | Reset | Earlier links stop working after a reset | A customer has asked for two links and reset with the second | Open the first link; set a new password | `Link expired or already used` |
| TRV-3-RST22 | Session | A sign-in from before the reset cannot be renewed | A customer is signed in in another browser; they reset their password | Try to renew the other browser's sign-in | Refused; no new sign-in given |
| TRV-3-RST23 | Password | Spaces around the new password are kept | A customer has asked for a link | Reset with a new password ending in a space; sign in with it, then without the space | With the space: signed in. Without it: `Invalid credentials.` |
| TRV-3-RST24 | Form | The reset form shows its fields | On a reset link | Look at the form | Heading `Set new password`; New password and Confirm new password, both marked `*`; **Reset Password**; **Back to login** |
| TRV-3-RST25 | Password | Both passwords can be shown and hidden | On a reset link | Type in both fields; click each show button twice | Each is hidden at first, shown after one click, hidden again after two; the other field does not change |
| TRV-3-RST26 | Access | Back to login from the reset form | On a reset link | Click **Back to login** | `/login` |

## Part F — New password validation

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-3-RST27 | Validation | An empty form is rejected | On a reset link | Click **Reset Password** | `Password is required` and `Please confirm your password`; no request sent |
| TRV-3-RST28 | Password | A short password is rejected | On a reset link | Enter 7 characters in both fields; submit | `Password must be at least 8 characters`; no request sent |
| TRV-3-RST29 | Password | An all-digit password is rejected | On a reset link | Enter 8 digits in both fields; submit | `Password cannot be entirely numeric`; no request sent |
| TRV-3-RST30 | Password | Different passwords are rejected | On a reset link | Enter two different strong passwords; submit | `Passwords do not match` under Confirm new password; no request sent |
| TRV-3-RST31 | Password | A common password is rejected by the server | On a reset link | Enter `password123` in both fields; submit | `This password is too common.` under New password; the form stays |

## Part G — Broken links and failures

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-3-RST32 | Link | A link missing its parts is rejected | None | Open `/reset-password`, then `/reset-password?uid=…` without a token | `Invalid reset link` each time; **Request a new link** opens `/forgot-password` |
| TRV-3-RST33 | Link | An altered link is rejected | A customer exists | Open a link with their account and a made-up code; set a new strong password | `Link expired or already used`; their password does not change |
| TRV-3-RST34 | Link | A link for no account is rejected | None | Open a made-up reset link; set a new strong password | `Link expired or already used` |
| TRV-3-RST35 | Form | The button is blocked while sending | On a reset link; the server's reply is delayed | Enter a new strong password twice; submit | `Resetting…`, disabled; only one request sent |
| TRV-3-RST36 | Failure | A server failure is reported | On a reset link; the server fails with an error | Enter a new strong password twice; submit | `Something went wrong. Please try again.` above the form; the form stays |
| TRV-3-RST37 | Failure | A lost connection is reported | On a reset link; the connection is lost | Enter a new strong password twice; submit | `Network error — check your connection and try again.` above the form |

## Bugs

| # | Bug | Steps to Reproduce | Cases | Issue |
| --- | --- | --- | --- | --- |
| 1 | The first click on a show button does nothing when the passwords differ | Open a reset link; type a password in New password and a different one in Confirm new password; click the show button of New password. It stays hidden; a second click shows it. Leaving Confirm shows `Passwords do not match`, which moves the form as the click lands | TRV-3-RST25 | — |
| 2 | A sign-in from before a password reset keeps working | Sign in; in another browser, reset the password with an emailed link; renew the first sign-in. A new sign-in is given | TRV-3-RST22 | — |
| 3 | Spaces around a new password are dropped | Reset with a new password ending in a space; sign in with it without the space. Signed in | TRV-3-RST23 | — |
