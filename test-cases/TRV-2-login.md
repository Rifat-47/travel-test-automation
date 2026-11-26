# TRV-2 — Login, logout and session: Test Cases

A customer signs in with their email and password, stays signed in across reloads and tabs, and signs out from the top bar. Pages for signed-in customers send guests to Login, then back to the page they asked for.

**Applies to:** the customer site: Login, the top bar's account menu, and the pages that need a signed-in customer (Profile, Wishlist, Dashboard).

**Global preconditions:**

- The site is running and has at least one destination.
- Not signed in, and on `/login`, unless the case says otherwise.
- "A customer" means an account the test registers for itself, with an unused email alias and a strong password.
- No case here expects an email.

## Part A — Reaching the page

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-2-LOG01 | Access | Login opens from the top bar | On `/` | Click **Login** in the top bar | `/login`, heading `Welcome back` |
| TRV-2-LOG02 | Access | Login opens from a destination | On a destination's details page | Click **Login to Book** | `/login`, heading `Welcome back` |
| TRV-2-LOG03 | Access | Forgot password opens from Login | None | Click **Forgot password?** | `/forgot-password` |
| TRV-2-LOG04 | Access | A signed-in customer cannot open Login | Customer signed in | Open `/login` | Sent to `/` |
| TRV-2-LOG05 | Form | The form shows its fields | None | Look at the form | Email address and Password, both marked `*`; **Sign In**; **Forgot password?** and **Register** links |

## Part B — Successful login

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-2-LOG06 | Login | Sign in with a correct email and password | A customer exists | Enter their email and password; click **Sign In** | Message `Welcome back!`; `/`; no **Login** or **Register** in the top bar |
| TRV-2-LOG07 | Login | The top bar shows who is signed in | A customer exists | Sign in; open the account menu | Their full name and email; a **Logout** button; no Dashboard link |
| TRV-2-LOG08 | Login | Enter submits the form | A customer exists | Enter their email and password; press Enter in Password | Signed in |
| TRV-2-LOG09 | Email | The email is not case-sensitive | A customer exists | Sign in with their email in upper case | Signed in as that customer |
| TRV-2-LOG10 | Login | A failed attempt does not block the next one | A customer exists | Sign in with a wrong password; then with the right one | Signed in |
| TRV-2-LOG11 | Password | The password can be shown and hidden | None | Type a password; click the show button twice | Hidden at first, shown after one click, hidden again after two |

## Part C — Rejected logins

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-2-LOG12 | Validation | An empty form is rejected | None | Click **Sign In** | `Email is required` and `Password is required`; stays on `/login`; no request sent |
| TRV-2-LOG13 | Email | A malformed email is rejected | None | Try `plain`, `a@b`, `@example.com` and `a b@example.com`, leaving the field each time | `Enter a valid email address` each time |
| TRV-2-LOG14 | Password | A wrong password is rejected | A customer exists | Enter their email and a wrong password; submit | `Invalid credentials.` above the form; stays on `/login`; still a guest |
| TRV-2-LOG15 | Email | An unknown email gets the same message | None | Sign in with an unused email alias | `Invalid credentials.` above the form, the same as for a wrong password |
| TRV-2-LOG16 | Password | The password is case-sensitive | A customer exists | Sign in with their password in another case | `Invalid credentials.`; still a guest |
| TRV-2-LOG17 | Password | A password with an extra space is rejected | A customer exists | Sign in with their password followed by a space | `Invalid credentials.`; still a guest |
| TRV-2-LOG18 | Form | The email stays after a rejection | A customer exists | Sign in with a wrong password | The email stays in the form |

## Part D — Sending and failures

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-2-LOG19 | Form | The button is blocked while sending | A customer exists; the server's reply is delayed | Enter their email and password; submit | `Signing in…`, disabled; only one request sent |
| TRV-2-LOG20 | Failure | A server failure is reported | The server fails with an error | Enter an email and password; submit | `Login failed. Please try again.`; stays on `/login`; still a guest |
| TRV-2-LOG21 | Failure | A lost connection is reported | The connection is lost | Enter an email and password; submit | `Login failed. Please try again.`; stays on `/login` |

## Part E — Returning to the page asked for

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-2-LOG22 | Redirect | A guest is sent to Login from a customer page | None | Open `/profile`, then `/wishlist` | Sent to `/login` each time |
| TRV-2-LOG23 | Redirect | Login returns to the page asked for | A customer exists | Open `/profile`; sign in | `/profile` |
| TRV-2-LOG24 | Redirect | Login returns to the destination | A customer exists; on a destination's details page | Click **Login to Book**; sign in | Back on that destination's page, signed in |
| TRV-2-LOG25 | Access | A guest cannot open Dashboard | None | Open `/dashboard` | Sent to `/login` |
| TRV-2-LOG26 | Access | A customer cannot open Dashboard | Customer signed in | Open `/dashboard` | Sent to `/` |

## Part F — Session

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-2-LOG27 | Session | The session survives a reload | Customer signed in | Reload the page | Still signed in |
| TRV-2-LOG28 | Session | The session is shared with a new tab | Customer signed in | Open `/profile` in a new tab | Profile shows without asking to sign in |
| TRV-2-LOG29 | Session | Signing in shows in other open tabs | Two tabs open on `/`, as a guest | Sign in in the first tab | The second tab's top bar shows the account menu, without a reload |
| TRV-2-LOG30 | Session | An expired sign-in is renewed quietly | Customer signed in; their short-lived sign-in has expired, the long-lived one has not | Reload `/profile` | Profile shows; still signed in |
| TRV-2-LOG31 | Session | A sign-in that cannot be renewed ends the session | Customer signed in; both sign-ins are no longer valid | Reload `/profile` | Sent to `/login`; signed out |

## Part G — Logout

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-2-LOG32 | Logout | Log out from the account menu | Customer signed in, on `/profile` | Open the account menu; click **Logout** | Message `Logged out successfully`; `/`; **Login** and **Register** in the top bar |
| TRV-2-LOG33 | Logout | Log out from the phone menu | Customer signed in; phone-sized window | Open the menu; click **Logout** | Message `Logged out successfully`; signed out |
| TRV-2-LOG34 | Logout | Customer pages are closed after logout | Customer signed in | Log out; open `/profile` | Sent to `/login` |
| TRV-2-LOG35 | Logout | Back does not reopen a customer page | Customer signed in, on `/profile` | Log out; press Back | Sent to `/login`; the profile is not shown |
| TRV-2-LOG36 | Logout | Logout stays after a reload | Customer signed in | Log out; reload | Still a guest |
| TRV-2-LOG37 | Logout | Logout reaches other open tabs | Customer signed in, with two tabs on `/profile` | Log out in the first tab | The second tab goes to `/login` without a reload |
| TRV-2-LOG38 | Logout | Logout works when the server fails | Customer signed in; the server fails the logout request | Log out | Signed out; **Login** in the top bar |
| TRV-2-LOG39 | Logout | A logged-out session cannot be renewed | Customer signed in; the long-lived sign-in is kept aside | Log out; try to renew with the kept sign-in | Refused; no new sign-in given |

## Bugs

| # | Bug | Steps to Reproduce | Cases | Issue |
| --- | --- | --- | --- | --- |
| 1 | After signing in, the customer always lands on Home instead of the page they asked for | As a guest, open `/profile` (or click **Login to Book** on a destination); sign in. Lands on `/`, not `/profile` or the destination | TRV-2-LOG23, TRV-2-LOG24 | — |
| 2 | Logging out on a customer page lands on Login instead of Home | Sign in; open `/profile`; open the account menu; click **Logout**. Lands on `/login`, not `/` | TRV-2-LOG32 | — |
| 3 | Renewing an expired sign-in often signs the customer out | Sign in; let the short-lived sign-in expire while the long-lived one is still valid; reload `/profile`. In 4 of 6 runs on the local site: sent to `/login`, signed out; once on `/`, still signed in. The app asks for a renewal twice with the same long-lived sign-in, and the server accepts only the first | TRV-2-LOG30 | — |
| 4 | A password with a trailing space is accepted | Sign in with a customer's email and their password followed by a space. Signed in; spaces around the password are dropped | TRV-2-LOG17 | — |
