# TRV-0 — Smoke: Test Cases

A quick check that the customer site is up and that guests and signed-in customers get the right pages.

**Applies to:** the customer site: Home, Destinations, Login, Wishlist and Profile.

**Global preconditions:**

- The site is running and has at least one destination.
- A test customer account exists.

## Part A — Guest

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-0-SMK01 | Home | Home opens for a guest | Not signed in | Open `/` | A main heading; **Login** and **Register** in the top bar |
| TRV-0-SMK02 | Destinations | Destinations opens for a guest | Not signed in | Open `/destinations` | A main heading and at least one destination |
| TRV-0-SMK03 | Access | A guest is sent from Wishlist to Login | Not signed in | Open `/wishlist` | `/login`, with the email and password fields and **Sign In** |

## Part B — Signed-in customer

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-0-SMK04 | Access | A signed-in customer opens Wishlist | Customer signed in | Open `/wishlist` | The heading `My Wishlist`; no **Login** in the top bar |
| TRV-0-SMK05 | Access | A signed-in customer opens Profile | Customer signed in | Open `/profile` | Stays on `/profile`; the wishlist icon is in the top bar |

## Bugs

| # | Bug | Steps to Reproduce | Cases | Issue |
| --- | --- | --- | --- | --- |
