# TRV-1 — Registration: Test Cases

A guest creates a customer account and is signed in straight away. There is no email verification step.

**Applies to:** the customer site: Register, and its links from the top bar, Login and Destination details.

**Global preconditions:**

- The site is running and has at least one destination.
- Not signed in, and on `/register`, unless the case says otherwise.
- "Valid details" means a first name, a last name, an unused email alias, and a strong password entered twice.
- No case here expects an email.

## Part A — Reaching the page

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-1-REG01 | Access | Register opens from the top bar | On `/` | Click **Register** in the top bar | `/register`, heading `Create an account` |
| TRV-1-REG02 | Access | Register opens from Login | On `/login` | Click **Register** below the form | `/register`, heading `Create an account` |
| TRV-1-REG03 | Access | Register opens from a destination | On a destination's details page | Click the register link in the booking prompt | `/register`, heading `Create an account` |
| TRV-1-REG04 | Access | Login opens from Register | None | Click **Sign in** below the form | `/login`, heading `Welcome back` |
| TRV-1-REG05 | Access | A signed-in customer cannot open Register | Customer signed in | Open `/register` | Sent to `/` |
| TRV-1-REG06 | Form | The form shows its fields | None | Look at the form | First name, Last name, Email, Password, Confirm password and **Create Account**; all but Last name marked `*` |

## Part B — Successful registration

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-1-REG07 | Register | Register with all fields | None | Enter valid details; click **Create Account** | Message `Account created! Welcome aboard.`; `/`; no **Login** or **Register** in the top bar |
| TRV-1-REG08 | Register | Register without a last name | None | Enter valid details, leaving Last name empty; submit | Account created and signed in |
| TRV-1-REG09 | Register | Names and email are saved | None | Register with valid details; open `/profile` | Profile shows the names and email entered |
| TRV-1-REG10 | Register | The session survives a reload | Just registered | Reload the page | Still signed in |
| TRV-1-REG11 | Register | A new customer can sign in later | Just registered, then logged out | Sign in with the same email and password | Signed in |
| TRV-1-REG12 | Email | A plus alias is its own account | An account exists for one alias | Register another alias of the same mailbox | Second account created, with its own email |
| TRV-1-REG14 | Email | A mixed-case email is saved in lower case | None | Register with an email in mixed case; open `/profile` | Email shown in lower case |
| TRV-1-REG15 | Name | International characters are accepted | None | Register as first name `Zoë`, last name `O'Brien-রহমান`; open `/profile` | Names shown exactly as entered |
| TRV-1-REG16 | Password | The shortest allowed password works | None | Register with a strong 8-character password | Account created and signed in |

## Part C — Required fields and format

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-1-REG17 | Validation | An empty form is rejected | None | Click **Create Account** | `First name is required`, `Email is required`, `Password is required`, `Please confirm your password`; stays on `/register` |
| TRV-1-REG18 | Validation | An error shows on leaving a field and clears once fixed | None | Focus and leave First name; then type a name | `First name is required` shows, then goes |
| TRV-1-REG19 | Name | A first name of spaces is rejected | None | Enter valid details with a first name of spaces; submit | An error under First name; no account created |
| TRV-1-REG20 | Email | A malformed email is rejected | None | Try `plain`, `a@b`, `@example.com` and `a b@example.com`, leaving the field each time | `Enter a valid email address` each time |
| TRV-1-REG21 | Email | An email with a one-letter ending is rejected | None | Enter valid details with the email `user@example.c`; submit | `Enter a valid email address.` under Email; no account created |
| TRV-1-REG22 | Limits | Names stop at 50 characters | None | Type 51 characters in each name field | 50 kept; `Maximum 50 characters reached` under each |
| TRV-1-REG23 | Limits | Email stops at 100 characters | None | Type a valid email of 101 characters in Email | 100 kept; `Maximum 100 characters reached` under Email |

## Part D — Password

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-1-REG24 | Password | A 7-character password is rejected | None | Enter 7 characters; leave the field | `Password must be at least 8 characters` |
| TRV-1-REG25 | Password | A numeric password is rejected | None | Enter only digits, 8 or more; leave the field | `Password cannot be entirely numeric` |
| TRV-1-REG26 | Password | A common password is rejected | None | Enter valid details with `password123` as both passwords; submit | `This password is too common.` under Password; no account created |
| TRV-1-REG27 | Password | A password of spaces is rejected | None | Enter valid details with 8 spaces as both passwords; submit | An error under Password; no account created |
| TRV-1-REG28 | Password | Different passwords are rejected | None | Enter valid details with different passwords; submit | `Passwords do not match` under Confirm password; stays on `/register` |
| TRV-1-REG29 | Password | Changing the password after confirming is caught | None | Enter valid details; change Password only; submit | `Passwords do not match`; no account created |
| TRV-1-REG30 | Password | Each password can be shown and hidden | None | Type in both password fields; use the show and hide button of each | Hidden at first; each button shows and hides only its own field |
| TRV-1-REG37 | Password | A password can be shown while the passwords differ | None | Enter different values in Password, then Confirm password; without leaving the field, click the show button of Password | Password is shown on the first click |

## Part E — Existing accounts and failures

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-1-REG31 | Email | A used email is rejected | An account exists | Register with its email | `A user with this email already exists.` under Email; still a guest |
| TRV-1-REG32 | Email | A used email in other case is rejected | An account exists | Register with its email in upper case | `A user with this email already exists.` under Email |
| TRV-1-REG33 | Form | Entries stay after a rejection | An account exists | Register with its email | Names and email stay in the form |
| TRV-1-REG34 | Form | The button is blocked while sending | The server's reply is delayed | Enter valid details; submit | `Creating account…`, disabled; only one request sent |
| TRV-1-REG35 | Failure | A server failure is reported | The server fails with an error | Enter valid details; submit | `Registration failed. Please try again.`; stays on `/register` with entries kept |
| TRV-1-REG36 | Failure | A lost connection is reported | The connection is lost | Enter valid details; submit | `Registration failed. Please try again.`; stays on `/register` |

## Bugs

| # | Bug | Steps to Reproduce | Cases | Issue |
| --- | --- | --- | --- | --- |
| 1 | The first click on Show password is lost when leaving Confirm password raises an error | On `/register` at 1280×720, enter different values in Password, then Confirm password; without leaving the field, click the show button of Password. `Passwords do not match` appears, the form moves up, and the password stays hidden. | TRV-1-REG37 | Travel issue 7 |
