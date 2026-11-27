# TRV-5 — Home: Test Cases

Home opens with a hero (a heading, a line of text and two buttons), then the featured destinations, a "Why Travel With Us?" section and the latest blog posts. The headings, texts and how many featured destinations to show come from the site settings. The destinations, the features and the posts come from what the site has published.

**Applies to:** the customer site's Home page, `/`.

**Global preconditions:**

- The site is running and has at least one featured destination, at least one "Why Travel With Us?" item and at least one published blog post.
- Not signed in, on `/`, in a desktop-sized window, unless the case says otherwise.
- Texts, destinations and posts are the ones the site has at the time of the test, not fixed values. Where a case needs a state the site does not have (no posts, a destination with reviews, a server failure), the test fakes the server's reply for that page only.
- The top bar, footer and tab title are covered in TRV-4. Saving a destination to the wishlist is covered in TRV-8.
- No case here expects an email.

## Part A — Hero

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-5-HOM01 | Hero | The hero shows the heading and text from the settings | None | Look at the top of the page | The main heading is the hero heading in the site settings; the line under it is the hero subheading |
| TRV-5-HOM02 | Hero | Explore Destinations opens Destinations | None | Click **Explore Destinations** | `/destinations` |
| TRV-5-HOM03 | Hero | Get in Touch opens Contact | None | Click **Get in Touch** | `/contact` |
| TRV-5-HOM04 | Hero | The hero has default texts | The settings' hero heading and subheading are empty | Open `/` | Heading `Discover Your Next Adventure`; text `Explore breathtaking destinations around the world` |
| TRV-5-HOM05 | Page | The page description follows the settings | None | Read the page's description for search engines | The meta description in the site settings, or the hero subheading when that is empty |

## Part B — Featured destinations

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-5-HOM06 | Featured | The section shows its heading | None | Look at the featured section | The featured heading from the site settings and a **View all →** link |
| TRV-5-HOM07 | Featured | Only featured destinations are shown | None | Look at the cards | Each card is a featured destination and shows the **Featured** badge; none is missing, up to the featured count in the site settings |
| TRV-5-HOM08 | Featured | No more than the featured count is shown | The featured count in the site settings is lower than the number of featured destinations | Look at the cards | Exactly the featured count of cards |
| TRV-5-HOM09 | Featured | A card shows the destination's details | None | Look at a card | Its picture, name, category, country, short description, `From` and the starting price with the currency symbol, `/ guest`, and its number of photos |
| TRV-5-HOM10 | Featured | A card opens the destination | None | Click a card | That destination's page, `/destinations/<its address name>` |
| TRV-5-HOM11 | Featured | View all opens Destinations | None | Click **View all →** in the featured section | `/destinations` |
| TRV-5-HOM12 | Featured | A card shows the rating when there are reviews | A featured destination has reviews | Look at its card | `★` and the average rating to one decimal, then the number of reviews in brackets |
| TRV-5-HOM13 | Featured | A card shows no rating without reviews | A featured destination has no reviews | Look at its card | No rating |
| TRV-5-HOM14 | Featured | A card copes with a missing picture and price | A featured destination has no picture and no starting price | Look at its card | A plane in place of the picture; `—` in place of the price |
| TRV-5-HOM15 | Featured | A customer sees a save button on each card | Customer signed in | Look at the cards | Each card has a **Save to wishlist** button that does not cover the **Featured** badge |
| TRV-5-HOM16 | Featured | No featured destinations is explained | The site has no featured destinations | Open `/` | A message that there are no featured destinations yet |
| TRV-5-HOM17 | Featured | A failure to load is reported | The server fails to send the featured destinations | Open `/` | A message that the destinations could not be loaded; the rest of the page still shows |

## Part C — Why Travel With Us

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-5-HOM18 | Features | The section shows each item | None | Look at **Why Travel With Us?** | Every item the site has, in the site's order, each with its icon, title and description |
| TRV-5-HOM19 | Features | The section hides when there are no items | The site has no items | Open `/` | No **Why Travel With Us?** section; the rest of the page still shows |

## Part D — Latest from the blog

| ID | Feature | Title | Precondition | Steps | Expected Outcome |
| --- | --- | --- | --- | --- | --- |
| TRV-5-HOM20 | Blog | The section shows the newest posts | None | Look at the blog section | The blog heading from the site settings, a **View all →** link, and the three newest published posts (fewer if the site has fewer), newest first |
| TRV-5-HOM21 | Blog | A post card shows the post's details | None | Look at a post card | Its cover picture, category, title, short summary and publish date |
| TRV-5-HOM22 | Blog | A post card opens the post | None | Click a post card | That post's page, `/blog/<its address name>` |
| TRV-5-HOM23 | Blog | View all opens the blog | None | Click **View all →** in the blog section | `/blog` |
| TRV-5-HOM24 | Blog | The section hides when there are no posts | The site has no published posts | Open `/` | No blog section; the rest of the page still shows |

## Bugs

| # | Bug | Steps to Reproduce | Cases | Issue |
| --- | --- | --- | --- | --- |
| 1 | No featured destinations leaves an empty section | With no featured destinations on the site, open `/`. The **Featured Destinations** heading and **View all →** show over an empty space, with no message | TRV-5-HOM16 | — |
| 2 | A failure to load the featured destinations is not reported | Make the server fail the featured destinations request; open `/`. The section stays empty with no message, the same as when there are none | TRV-5-HOM17 | — |
| 3 | Home ignores the featured count in the site settings | Set the featured count lower than the number of featured destinations (here faked to 5, with 6 featured); open `/`. All 6 show; Home always asks for 6 | TRV-5-HOM08 | — |
| 4 | The save button covers the edge of the Featured badge | Sign in; open `/`; look at a featured card. The heart button overlaps the right end of the **Featured** badge by about 4 pixels | TRV-5-HOM15 | — |
