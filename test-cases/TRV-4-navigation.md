# TRV-4 — Navigation, footer and theme: Test Cases

Every page shares the top bar, the footer and the light and dark theme. The top bar links to the main pages, shows Login and Register to guests, and shows the wishlist and the account menu to signed-in customers. On a phone-sized window the links move into a menu. The footer shows the site's details from the site settings.

**Applies to:** the top bar, the phone menu, the footer, the theme button, the page titles, the offline message and unknown addresses, on the customer site.

**Global preconditions:**

- The site is running and has at least one destination.
- Not signed in, on `/`, in a desktop-sized window, unless the case says otherwise.
- "A customer" means an account the test registers for itself, with an unused email alias and a strong password.
- "The site name" and the other footer values are the ones in the site settings at the time of the test, not fixed text.
- The Staff link and Staff Dashboard are left to the admin panel. The wishlist count is covered in TRV-8.
- No case here expects an email.

## Part A — Top bar

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-4-NAV01 | Top bar | The top bar shows the main links | None | Look at the top bar | The site name; **Destinations**, **Blog**, **About** and **Contact**; the theme button; **Login** and **Register** |
| TRV-4-NAV02 | Top bar | Each link opens its page | None | Click **Destinations**, **Blog**, **About** and **Contact** in turn | `/destinations`, `/blog`, `/about` and `/contact`, each with its own main heading |
| TRV-4-NAV03 | Top bar | The site name returns to Home | On `/about` | Click the site name | `/` |
| TRV-4-NAV04 | Top bar | The current page's link is marked | None | Open `/blog` | **Blog** is marked as the current page; no other top bar link is |
| TRV-4-NAV05 | Top bar | Login and Register open their pages | None | Click **Login**; go back; click **Register** | `/login`, then `/register` |
| TRV-4-NAV06 | Top bar | The top bar stays in view when scrolling | On a long page such as `/` | Scroll to the bottom | The top bar is still at the top of the window |
| TRV-4-NAV07 | Top bar | A new page opens at the top | On `/`, scrolled to the bottom | Click **Blog** in the footer | `/blog`, shown from the top |
| TRV-4-NAV08 | Top bar | The top bar and footer are on every page | None | Open `/`, `/destinations`, a destination's page, `/blog`, `/about`, `/contact`, `/login` and `/register` | The top bar and footer on each |

## Part B — Signed-in top bar and account menu

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-4-NAV09 | Top bar | A customer sees the wishlist and account menu | Customer signed in | Look at the top bar | The wishlist button and the account menu button; no **Login**, **Register** or **Staff** |
| TRV-4-NAV10 | Top bar | The wishlist button opens Wishlist | Customer signed in | Click the wishlist button | `/wishlist`, heading `My Wishlist` |
| TRV-4-NAV11 | Account menu | The menu shows the customer and its links | Customer signed in | Open the account menu | Their initials; their full name and email; **Profile**, **My Bookings** and **Logout**; no **Staff Dashboard** |
| TRV-4-NAV12 | Account menu | Profile opens from the menu | Customer signed in | Open the account menu; click **Profile** | `/profile`, on the profile details; the menu closes |
| TRV-4-NAV13 | Account menu | My Bookings opens from the menu | Customer signed in | Open the account menu; click **My Bookings** | `/profile`, on the bookings; the menu closes |
| TRV-4-NAV14 | Account menu | The menu closes when clicking elsewhere | Customer signed in | Open the account menu; click outside it | The menu closes |
| TRV-4-NAV15 | Account menu | The menu button opens and closes it | Customer signed in | Click the account menu button twice | Open after one click, closed after two |
| TRV-4-NAV41 | Account menu | My Bookings opens from Profile | Customer signed in, on `/profile` showing the profile details | Open the account menu; click **My Bookings** | The bookings show in place of the profile details |

## Part C — Phone menu

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-4-NAV16 | Phone menu | The links move into the menu | Phone-sized window | Look at the top bar | The site name, the theme button and the menu button; the page links, **Login** and **Register** are not shown |
| TRV-4-NAV17 | Phone menu | The menu shows the guest links | Phone-sized window | Open the menu | **Destinations**, **Blog**, **About**, **Contact**, **Login** and **Register** |
| TRV-4-NAV18 | Phone menu | A link opens its page and closes the menu | Phone-sized window | Open the menu; click **Blog** | `/blog`; the menu closes |
| TRV-4-NAV19 | Phone menu | The menu button opens and closes it | Phone-sized window | Click the menu button twice | Open after one click, closed after two |
| TRV-4-NAV20 | Phone menu | The menu shows the customer and its links | Customer signed in; phone-sized window | Open the menu | Their full name and email; **My Wishlist**, **Profile**, **My Bookings** and **Logout**; no **Login** or **Register** |
| TRV-4-NAV21 | Phone menu | The customer links open their pages | Customer signed in; phone-sized window | From the menu, click **My Wishlist**, then **Profile**, then **My Bookings** | `/wishlist`; `/profile` on the profile details; `/profile` on the bookings |
| TRV-4-NAV40 | Phone menu | The menu button has a name | Phone-sized window | Find the menu button by its accessible name | The button is named as a menu, so a screen reader can announce it |

## Part D — Footer

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-4-NAV22 | Footer | The footer shows the site details | None | Look at the footer | The site name and tagline (or `Discover the world, one destination at a time.` when no tagline is set); the contact email, phone and address; `All prices in` the currency code and symbol; the service fee when above 0 |
| TRV-4-NAV23 | Footer | The footer links open their pages | On `/about` | Click **Home**, **Destinations**, **Blog**, **About Us** and **Contact** in the footer in turn | `/`, `/destinations`, `/blog`, `/about` and `/contact` |
| TRV-4-NAV24 | Footer | The copyright shows this year | None | Look at the bottom of the footer | `© <this year> <site name>. All rights reserved.` |
| TRV-4-NAV25 | Footer | Social links show only when set | None | Look at the footer | One link for each social address in the site settings, opening in a new tab; none for those left empty |

## Part E — Theme

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-4-NAV26 | Theme | The first visit follows the device's setting | No theme chosen before; the device set to dark | Open `/` | Dark theme; the button shows the sun |
| TRV-4-NAV27 | Theme | The first visit follows a light device | No theme chosen before; the device set to light | Open `/` | Light theme; the button shows the moon |
| TRV-4-NAV28 | Theme | The button switches the theme | Light theme | Click the theme button twice | Dark after one click, light after two |
| TRV-4-NAV29 | Theme | The chosen theme stays after a reload | Light theme | Switch to dark; reload | Still dark |
| TRV-4-NAV30 | Theme | The chosen theme beats the device's setting | The device set to light | Switch to dark; open `/about` | Dark theme |
| TRV-4-NAV31 | Theme | The chosen theme is kept in a new tab | Light theme | Switch to dark; open `/` in a new tab | Dark theme |
| TRV-4-NAV32 | Theme | The theme button works on a phone | Phone-sized window; light theme | Click the theme button | Dark theme |

## Part F — Page titles, unknown addresses and going offline

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-4-NAV33 | Title | Home's tab title is the site name | None | Open `/` | Tab title is the site name |
| TRV-4-NAV34 | Title | Pages opened from the top bar have their own tab title | None | Click **Destinations**, **Blog**, **About** and **Contact** in turn | `Destinations \| <site name>`, `Travel Blog \| <site name>`, `About Us \| <site name>`, `Contact Us \| <site name>` (the page headings set in the site settings) |
| TRV-4-NAV35 | Title | Pages opened directly have their own tab title | None | Open `/destinations`, `/blog`, `/about` and `/contact` by address | The same titles as in TRV-4-NAV34 |
| TRV-4-NAV39 | Title | A destination's tab title names it once | A destination whose name already includes its country | Open that destination's page | `<destination name> \| <site name>`; the country appears only once |
| TRV-4-NAV36 | Unknown page | An unknown address shows a not-found page | None | Open an address that does not exist, such as `/no-such-page-<random>` | A message that the page was not found, with a way back to Home; the top bar and footer |
| TRV-4-NAV37 | Offline | Losing the connection is reported | On `/` | Go offline | `You're offline — changes won't be saved until you reconnect.` at the top |
| TRV-4-NAV38 | Offline | Coming back online is reported | On `/`, offline | Go back online | `Back online!`, gone after about 3 seconds |

## Bugs

| # | Bug | Steps to Reproduce | Cases | Issue |
| --- | --- | --- | --- | --- |
| 1 | A page opened by its address shows only the site name as its tab title | Open `/contact` (or `/destinations`, `/blog`, `/about`) by typing the address. Tab title is `Travello Overseas`, not `Contact Us \| Travello Overseas`. Reaching the same page from the top bar gives the right title | TRV-4-NAV35 | — |
| 2 | An unknown address shows an empty page | Open `/no-such-page`. Only the top bar and footer show; no not-found message and no way back other than the top bar | TRV-4-NAV36 | — |
| 3 | The phone menu button has no name for screen readers | In a phone-sized window, inspect the button that opens the menu. It has no label or text, so a screen reader announces only "button" | TRV-4-NAV40 | — |
| 4 | A destination's tab title repeats the country | Open `/destinations/banff-canada`. Tab title is `Banff, Canada, Canada \| Travello Overseas`: the country is added after a name that already ends with it | TRV-4-NAV39 | — |
| 5 | My Bookings in the menus does nothing on Profile | Sign in; open `/profile`; open the account menu (or the phone menu) and click **My Bookings**. The profile details stay; the bookings show only when coming from another page | TRV-4-NAV21, TRV-4-NAV41 | — |
