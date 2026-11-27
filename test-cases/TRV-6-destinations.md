# TRV-6 — Destination list, search and filters: Test Cases

Destinations lists every published destination, twelve to a page, newest first. A customer can search by name, country or description, filter by category, country, price and featured, sort the list, and switch to a map. The search, filters, sort, page and view are kept in the address, so they survive a reload and can be shared.

**Applies to:** the customer site's Destinations page, `/destinations`.

**Global preconditions:**

- The site is running and has published destinations in more than one category and country, some featured, some with map coordinates and some without.
- Not signed in, on `/destinations`, in a desktop-sized window, unless the case says otherwise.
- Expected lists are worked out from the site's own destination data at the time of the test, not fixed names. Where a case needs a state the site does not have (more than one page of results, a server failure), the test fakes the server's reply for that page only.
- What a card shows is covered in TRV-5. The top bar, footer and tab title are covered in TRV-4. A destination's own page is TRV-7; saving to the wishlist is TRV-8.
- No case here expects an email.

## Part A — The list

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-6-DST01 | List | The page shows its heading | None | Look at the top of the page | The destinations heading and subheading from the site settings; **List** and **Map** buttons; the search box; the filters |
| TRV-6-DST02 | List | Every destination is listed, newest first | The site has 12 or fewer destinations | Look at the cards | One card for each published destination, newest first; `<n> destinations found` with the total |
| TRV-6-DST03 | List | A card opens the destination | None | Click a card | That destination's page, `/destinations/<its address name>` |
| TRV-6-DST04 | List | One result is counted in the singular | None | Search for a word only one destination has | `1 destination found` |
| TRV-6-DST05 | List | No results is explained | None | Search for a word no destination has | `0 destinations found` and `No destinations match your criteria.`; no cards; no page buttons |
| TRV-6-DST06 | List | A failure to load is reported | The server fails to send the destinations | Open `/destinations` | `Failed to load destinations. Please try again.`; the search box and filters still show |

## Part B — Search

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-6-DST07 | Search | Search by name | None | Type part of a destination's name; click **Search** | Only the destinations whose name, country or description contains it; `search=<text>` in the address |
| TRV-6-DST08 | Search | Search by country | None | Search for a country | The destinations in that country, and any whose name or description names it |
| TRV-6-DST09 | Search | Search by a word in the description | None | Search for a word that appears only in descriptions | The destinations whose description contains it |
| TRV-6-DST10 | Search | Search ignores letter case | None | Search for a destination's name in upper case | The same results as in lower case |
| TRV-6-DST11 | Search | Results update after typing stops | None | Type a search; wait without clicking **Search** | The list updates on its own within about a second |
| TRV-6-DST12 | Search | Enter searches | None | Type a search; press Enter | The list updates |
| TRV-6-DST13 | Search | Spaces around the search are ignored | None | Search for a destination's name with spaces before and after | The same results as without the spaces |
| TRV-6-DST14 | Search | The clear button resets the search | A search is shown | Click the clear button in the search box | The box is empty; every destination is listed; no `search` in the address |
| TRV-6-DST15 | Search | Search and filters work together | None | Pick a category; then search for a word | Only destinations in that category that match the word |

## Part C — Filters

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-6-DST16 | Filters | The category list shows every category | None | Open **Category** | `All categories`, then each of the site's categories |
| TRV-6-DST17 | Filters | Filter by category | None | Pick a category | Only that category's destinations; `category=<its address name>` in the address |
| TRV-6-DST18 | Filters | The country list shows every country | None | Open **Country** | `All countries`, then each country that has a destination, A to Z |
| TRV-6-DST19 | Filters | Filter by country | None | Pick a country | Only that country's destinations |
| TRV-6-DST20 | Filters | Filter by lowest price | None | Enter a minimum price | Only destinations whose `From` price is at or above it |
| TRV-6-DST21 | Filters | Filter by highest price | None | Enter a maximum price | Only destinations whose `From` price is at or below it |
| TRV-6-DST22 | Filters | A price range with the minimum above the maximum is explained | None | Enter a minimum above the maximum | A message that the minimum is above the maximum, not just `No destinations match your criteria.` |
| TRV-6-DST23 | Filters | Featured only | None | Turn on **Featured only** | Only featured destinations; `featured=true` in the address |
| TRV-6-DST24 | Filters | Featured only can be used by keyboard and by its text | None | Tab to **Featured only** and press Space; then click its text | It turns on with Space, and off again when the text is clicked |
| TRV-6-DST25 | Filters | The filters have names | None | Find **Sort by**, **Category**, **Country** and **Featured only** by their names | Each is found, so a screen reader can announce it |
| TRV-6-DST26 | Filters | Filters combine | None | Pick a category and a country that share a destination | Only destinations in both |
| TRV-6-DST27 | Filters | The active filters are counted | None | Pick a category and turn on **Featured only** | `2` next to **Filters** |
| TRV-6-DST28 | Filters | Clear all filters resets them | Two filters chosen | Click **Clear all filters** | Every filter back to its default; every destination listed; the count and **Clear all filters** gone |

## Part D — Sort

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-6-DST29 | Sort | The sort options | None | Open **Sort by** | `Newest first` (chosen), `Name A–Z`, `Name Z–A`, `Top rated` |
| TRV-6-DST30 | Sort | Sort by name A to Z | None | Pick `Name A–Z` | Names in A to Z order; `ordering=name` in the address |
| TRV-6-DST31 | Sort | Sort by name Z to A | None | Pick `Name Z–A` | Names in Z to A order |
| TRV-6-DST32 | Sort | Sort by rating | None | Pick `Top rated` | Highest average rating first |

## Part E — Pages

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-6-DST33 | Pages | One page shows no page buttons | 12 or fewer results | Look below the cards | No page buttons |
| TRV-6-DST34 | Pages | More than 12 results are split into pages | 30 results | Look below the cards | **Previous** (disabled), `1` (current), `2`, `3`, **Next** |
| TRV-6-DST35 | Pages | A page button opens that page | 30 results | Click `3` | Page 3 of the results; `page=3` in the address; **Next** disabled |
| TRV-6-DST36 | Pages | Previous and Next move one page | 30 results, on page 2 | Click **Next**, then **Previous** twice | Page 3, then 2, then 1 |
| TRV-6-DST37 | Pages | A new search starts at page 1 | 30 results, on page 3 | Search for a word | Page 1 of the new results |
| TRV-6-DST38 | Pages | A link to a later page opens that page | 30 results | Open `/destinations?page=2` | Page 2 stays open; `page=2` in the address |

## Part F — Keeping the choices

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-6-DST39 | Address | A shared address opens the same results | None | Open `/destinations` with a search, category, country, sort and featured in the address | The search box, filters and sort show those choices; the list matches them |
| TRV-6-DST40 | Address | The choices stay after a reload | A search, a filter and a sort chosen | Reload | The same choices and results |
| TRV-6-DST41 | Address | Back returns to the earlier choices | None | Pick a category; then pick another; press Back | The first category is chosen again, with its results |

## Part G — Map

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-6-DST42 | Map | Map shows the destinations on a map | None | Click **Map** | A map with one pin for each listed destination that has coordinates; `view=map` in the address |
| TRV-6-DST43 | Map | A pin shows the destination | On the map | Click a pin | Its name, country, price with the currency symbol and `/ guest`, and a **View** link to its page |
| TRV-6-DST44 | Map | The map follows the filters | On the map | Pick a category | Only that category's pins |
| TRV-6-DST45 | Map | List returns to the cards | On the map | Click **List** | The cards; no `view` in the address |
| TRV-6-DST46 | Map | Results without coordinates are explained to customers | On the map | Filter to destinations that have no coordinates | A message for customers that these destinations are not on the map, with no instructions meant for staff |
| TRV-6-DST47 | Map | The map can be turned off | Map view turned off in the site settings | Open `/destinations?view=map` | No **List** or **Map** buttons; the cards show |

## Part H — Phone

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-6-DST48 | Phone | The filters fold away on a phone | Phone-sized window | Look at the filters; click **Filters** | Folded at first; open after the click |
| TRV-6-DST49 | Phone | The folded filters show how many are on | Phone-sized window; one filter in the address | Look at **Filters** | `1` next to **Filters** while folded |

## Bugs

| # | Bug | Steps to Reproduce | Cases | Issue |
| --- | --- | --- | --- | --- |
| 1 | A link to a later page opens page 1 | With more than 12 results, open `/destinations?page=2`. Page 2 loads, then about half a second later the page jumps to `page=1` | TRV-6-DST38 | — |
| 2 | The price filter does not match the price shown | Enter a minimum price of 1000. Queenstown, Santorini and others (`From $699`) are listed: the filter compares every price option of a destination, not its `From` price | TRV-6-DST20 | — |
| 3 | A minimum price above the maximum is not explained | Enter a minimum of 1000 and a maximum of 500. Only `No destinations match your criteria.` shows | TRV-6-DST22 | — |
| 4 | Featured only cannot be used by keyboard or by clicking its text | Tab through the filters: **Featured only** is skipped. Click the words `Featured only`: nothing happens. Only the small switch responds to a click | TRV-6-DST24 | — |
| 5 | The filters have no names for screen readers | Inspect **Sort by**, **Category** and **Country**: the headings are not linked to the lists, so each is announced without a name. **Featured only** is not announced as a switch | TRV-6-DST25 | — |
| 6 | The map shows staff instructions to customers | Click **Map**; filter to Japan. The map area says `No map coordinates set … Add coordinates from the Django admin.` | TRV-6-DST46 | — |
