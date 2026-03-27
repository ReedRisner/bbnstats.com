# BBN Stats — Full Build Plan for Codex
## bbnstats.com | Kentucky Basketball Stats Website
### Stack: Vanilla HTML + CSS + JavaScript | Hosted on GitHub Pages with custom domain

---

## PROJECT OVERVIEW

Build a fully static, client-side Kentucky Wildcats basketball stats website hosted on GitHub Pages at `bbnstats.com`. All data comes from the College Basketball Data API. The site uses no build tools, no frameworks, no backend — just HTML, CSS, and JavaScript files. Everything is fetched live from the API in the browser.

**API Base URL:** `https://api.collegebasketballdata.com`
**API Key:** `0/5PdgRvOqvcUo9VqUAcXFUEYqXxU3T26cGqt9c6FFArBcyqE4BD3njMuwOnQz+3`
**Team Name for API calls:** `Kentucky` (use exactly this string in `team=` parameters)
**Default season:** `2025` (the 2024-25 season — always default to the most current season but allow year switching)

---

## REPOSITORY STRUCTURE

```
bbnstats.com/               ← root of GitHub repo
├── index.html              ← Home / Dashboard
├── players.html            ← Roster list
├── player.html             ← Individual player profile (uses ?id=)
├── schedule.html           ← Full schedule + results
├── game.html               ← Full box score + play-by-play (uses ?id=)
├── stats.html              ← Player season stats + advanced stats table
├── team-stats.html         ← Team season stats + shooting breakdown
├── compare.html            ← Side-by-side player comparison (any years)
├── lineups.html            ← Lineup analysis
├── rankings.html           ← AP + Coaches Poll history
├── ratings.html            ← Adjusted efficiency + Elo ratings
├── css/
│   ├── style.css           ← Global styles, nav, colors, typography
│   ├── tables.css          ← Sortable table styles
│   ├── charts.css          ← Chart/shot-chart canvas styles
│   └── print.css           ← Print stylesheet (for save-as-image pages)
├── js/
│   ├── api.js              ← Centralized API fetch helper with caching
│   ├── nav.js              ← Shared nav + year selector injection
│   ├── utils.js            ← Shared helper functions (formatters, colors, etc.)
│   ├── shotchart.js        ← Reusable shot chart canvas renderer
│   ├── charts.js           ← Reusable Chart.js wrappers (bar, line, radar, etc.)
│   └── print.js            ← Print/export to image logic (html2canvas)
├── CNAME                   ← Contains: bbnstats.com
└── README.md
```

---

## DESIGN SYSTEM

### Colors
```css
:root {
  --uk-blue: #0033A0;
  --uk-white: #FFFFFF;
  --uk-light-blue: #4A90D9;
  --bg-dark: #0A0F1E;
  --bg-card: #0D1426;
  --bg-card-hover: #111B35;
  --text-primary: #FFFFFF;
  --text-secondary: #9EB3D8;
  --text-muted: #5A6E8A;
  --border: #1E2E50;
  --accent-green: #27AE60;
  --accent-red: #E74C3C;
  --accent-yellow: #F1C40F;
}
```

### Typography
- Font: `Inter` (Google Fonts) for body, `Oswald` for headings/numbers
- Stat numbers: large, bold, `Oswald` font

### Theme
- Dark navy/midnight theme throughout
- Kentucky blue accents
- Card-based layout with subtle borders
- Subtle `box-shadow` glow on hover
- Fully responsive (mobile breakpoints at 768px and 480px)

### Navigation
Sticky top nav on all pages. Left: BBN Stats logo + "KENTUCKY BASKETBALL". Right: nav links + **Season Selector dropdown** (default: 2025, options: 2025 down to 2018). The season selector is a `<select>` element. When changed, the page re-fetches all data for the new season. Store selected season in `localStorage` so it persists across page navigation.

---

## SHARED JAVASCRIPT MODULES

### `js/api.js`
```javascript
// Centralized API helper with in-memory caching to avoid repeat fetches
const API_BASE = 'https://api.collegebasketballdata.com';
const API_KEY = '0/5PdgRvOqvcUo9VqUAcXFUEYqXxU3T26cGqt9c6FFArBcyqE4BD3njMuwOnQz+3';
const cache = {};

async function apiFetch(path, params = {}) {
  params.team = params.team || undefined; // only add if needed
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}${path}${query ? '?' + query : ''}`;
  if (cache[url]) return cache[url];
  const res = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  const data = await res.json();
  cache[url] = data;
  return data;
}
```

### `js/utils.js`
Include these helpers:
- `getSeason()` — reads from localStorage, defaults to 2025
- `setSeason(year)` — saves to localStorage, reloads page
- `fmtPct(val)` — formats 0.456 as "45.6%"
- `fmtNum(val, decimals)` — rounds numbers for display
- `colorStat(val, low, mid, high)` — returns CSS class for heat-coloring stats
- `heightInches(val)` — converts inches to ft'in" display (e.g. 78 → "6'6\"")
- `formatDate(iso)` — formats ISO date to "Mon Nov 4"
- `getResult(game, teamName)` — returns "W 89-72" or "L 63-78" style string
- `winProbColor(prob)` — returns color gradient for win probability bar

### `js/nav.js`
Injects the shared `<nav>` HTML into every page. Reads current page from `window.location.pathname` and marks the active nav link. Injects year selector and binds change event to `setSeason()`.

### `js/shotchart.js`
Full court shot chart renderer using an HTML `<canvas>` element.
- `drawCourt(ctx, width, height)` — draws NCAA half-court outline (key, three-point arc, free throw line, backboard, restricted area) in white/gray lines on dark background
- `plotShots(ctx, shots, width, height)` — takes array of `{location: {x, y}, made, range}` objects and plots them:
  - Made shots: filled blue circle with white border
  - Missed shots: hollow red X
  - Scale x/y from API coordinate space (0-100 roughly) to canvas pixels
  - On hover (mousemove), show tooltip with play text
- `drawHeatmap(ctx, shots, width, height)` — optional heatmap overlay mode (toggle button)
- Export button calls `canvas.toDataURL()` to download as PNG

### `js/charts.js`
Wrappers around Chart.js (load from CDN). Include:
- `barChart(canvasId, labels, datasets, options)` — standard bar
- `lineChart(canvasId, labels, datasets, options)` — trend over games
- `radarChart(canvasId, labels, datasets)` — player profile radar
- `donutChart(canvasId, labels, values)` — shot distribution donut
- All charts use the UK color palette and dark backgrounds

### `js/print.js`
Load `html2canvas` from CDN. Add a "📸 Save as Image" button to every page. On click, call `html2canvas(document.getElementById('main-content'))` and trigger a PNG download named after the page + season (e.g. `uk-player-john-calipari-2025.png`). Also include a `window.print()` fallback button "🖨️ Print" that uses the print.css stylesheet.

---

## PAGE-BY-PAGE BUILD INSTRUCTIONS

---

### PAGE 1: `index.html` — Home Dashboard

**Purpose:** Central hub showing current season snapshot.

**API Calls:**
- `GET /stats/team/season?team=Kentucky&season={year}` → Team record, PPG, etc.
- `GET /games?team=Kentucky&season={year}` → Schedule/results for win/loss display
- `GET /stats/player/season?team=Kentucky&season={year}` → Top performers
- `GET /ratings/adjusted?team=Kentucky&season={year}` → Efficiency ratings
- `GET /ratings/elo?team=Kentucky&season={year}` → Elo rating
- `GET /rankings?team=Kentucky&season={year}` → AP/Coaches poll ranking

**Layout:**
1. **Hero Banner** — Full-width dark blue banner with "KENTUCKY WILDCATS" and current season label (e.g. "2024-25 Season"). Show current AP rank badge if ranked.
2. **Record Card Row** — 4 stat cards: W-L Record | PPG | Opp PPG | Current Streak
3. **Season Stats Summary Row** — 6 mini cards: FG%, 3P%, FT%, Rebounds/G, Assists/G, Turnovers/G
4. **Efficiency Block** — Show Adjusted Offensive Rating, Defensive Rating, Net Rating, Elo rating in a 2x2 grid of large stat cards with rank badges (e.g. "#12 Nationally")
5. **Last 5 Games** — Horizontal scrollable row of game result cards. Each card: opponent logo placeholder + opponent name + W/L badge + score + date. Clickable → goes to game.html?id={gameId}
6. **Next Game** — If a scheduled game exists, show a "NEXT GAME" card with opponent, date, time, venue
7. **Top 3 Players** — Mini stat leaders cards: PTS leader, REB leader, AST leader. Each shows name, stat value, headshot placeholder. Click → player.html?id={athleteId}
8. **AP Poll History** — Small line chart showing Kentucky's AP ranking across weeks of the current season (use Chart.js). If unranked, show as "NR".
9. **Quick Links** — Buttons/cards linking to all other pages.

---

### PAGE 2: `players.html` — Roster

**Purpose:** Full roster grid with basic info and season averages.

**API Calls:**
- `GET /teams/roster?team=Kentucky&season={year}` → Player list with bio info
- `GET /stats/player/season?team=Kentucky&season={year}` → Season averages to merge in

**Layout:**
1. **Page Header** — "2024-25 Roster" with season selector
2. **View Toggle** — "Grid View" | "Table View" toggle buttons
3. **Grid View:** Cards for each player showing:
   - Jersey number (large, bold)
   - Name
   - Position | Height | Weight
   - Hometown (city, state)
   - Key stats: PPG | RPG | APG
   - Click card → player.html?id={athleteId}
4. **Table View:** Sortable table with all bio + stat columns
5. Sort by jersey # by default, allow clicking column headers to sort

---

### PAGE 3: `player.html` — Individual Player Profile

**Purpose:** Deep-dive on one player. URL: `player.html?id={athleteId}&season={year}`

**API Calls:**
- `GET /stats/player/season?team=Kentucky&season={year}` → Filter for this athleteId for season totals + advanced stats
- `GET /stats/player/shooting/season?team=Kentucky&season={year}` → Filter for this athleteId for shot type breakdown
- `GET /games/players?team=Kentucky&season={year}` → Filter for this athleteId for game-by-game log
- `GET /plays/player/{athleteId}?season={year}&shootingPlaysOnly=true` → All shot attempts with location data

**Layout:**
1. **Player Header** — Large name display, jersey number, position, height/weight, hometown, class year (start/end season from roster). Season selector dropdown.
2. **Season Averages Bar** — Large bold stats: PPG | RPG | APG | SPG | BPG | MPG | FG% | 3P% | FT% | TS%
3. **Advanced Stats Panel** — Card grid showing: Usage%, OffRtg, DefRtg, NetRtg, PORPAG, Win Shares (total, offensive, defensive, per40), eFG%, FT Rate, OReb%
4. **Shot Type Breakdown** — Donut chart (Chart.js) showing shot attempt distribution: Dunks / Layups / Tip-Ins / 2P Jumpers / 3P Jumpers. Below donut, a table with made/attempted/pct/assistedPct for each type.
5. **Shot Chart** — Canvas shot chart (use shotchart.js) showing all shot attempts for the season. Toggle buttons: "All Shots" | "Made Only" | "Missed Only" | "Heatmap". Below chart: shot zone summary table (Rim / Mid-Range / 3-Point with made-att-pct).
6. **Game Log Table** — Sortable table with one row per game:
   - Date | Opponent | Result (W/L + score) | MIN | PTS | REB | AST | STL | BLK | TO | FG | 3P | FT | eFG% | TS% | OffRtg | DefRtg | Usage | GameScore | Starter (Y/N)
   - Color-code points (hot/cold relative to season average)
   - Click row → opens game.html?id={gameId}
7. **Performance Trend** — Line chart (Chart.js) showing points, rebounds, assists per game over the season. Toggle between stats.
8. **Radar Chart** — Player profile radar showing: Scoring / Rebounding / Playmaking / Defense / Efficiency / Shooting — normalized against all UK players on the roster that season.
9. **Print/Export Buttons** — "📸 Save as Image" and "🖨️ Print" buttons at top-right.

---

### PAGE 4: `schedule.html` — Schedule & Results

**Purpose:** Full season schedule with results, links to box scores.

**API Calls:**
- `GET /games?team=Kentucky&season={year}` → All games
- `GET /lines?team=Kentucky&season={year}` → Betting lines (spread, over/under)
- `GET /rankings?team=Kentucky&season={year}` → AP rank badge per week

**Layout:**
1. **Season Record Banner** — W-L-Streak display + home/away/neutral splits + conference record
2. **Filter Bar** — Filter buttons: All | Regular Season | Postseason | Home | Away | Conference
3. **Schedule Table/List** — For each game show:
   - Date + Day of week
   - Home/Away indicator + Opponent name + Opponent AP rank (if ranked)
   - Location (venue, city) + Neutral site badge
   - Result: W/L badge + Score (bold) + Margin
   - Period-by-period score (expandable on click: show H1/H2/OT scores from `homePeriodPoints`)
   - Attendance
   - Spread (from betting lines) and whether Kentucky covered
   - Over/Under result (Over/Under/Push)
   - Tournament badge (NCAA, NIT, etc.)
   - "Box Score →" button linking to game.html?id={gameId}
4. **Scheduled Games** — Future games show date, opponent, time TBD note, spread if available
5. **Season Chart** — Small running score differential chart (Chart.js bar chart, green for wins, red for losses) showing margin of victory/defeat across the season

---

### PAGE 5: `game.html` — Game Box Score

**Purpose:** Full game detail. URL: `game.html?id={gameId}`

**API Calls:**
- `GET /games?team=Kentucky&season={year}` → Game metadata (filter by id)
- `GET /games/teams?team=Kentucky&season={year}` → Team stats for this game (filter by gameId)
- `GET /games/players?team=Kentucky&season={year}` → Player stats (filter by gameId)
- `GET /plays/game/{gameId}` → Play-by-play
- `GET /plays/game/{gameId}?shootingPlaysOnly=true` → Shot chart data
- `GET /lineups/game/{gameId}` → Lineup data
- `GET /lines?team=Kentucky&season={year}` → Betting info for this game

**Layout:**
1. **Game Header** — Team names + logos placeholder + Final Score (large) + Date + Venue + Attendance. Show W/L for Kentucky. Tournament badge if applicable. Show spread result and O/U result.
2. **Period Scores Table** — H1 | H2 | OT(s) | F scoreboard table (both teams).
3. **Team Stats Comparison** — Two-column comparison table (Kentucky vs Opponent) for all team stats:
   - FG (made-att-pct), 2P, 3P, FT, Rebounds (Off/Def/Total), Assists, Turnovers, Steals, Blocks, Fouls
   - Points in Paint, Fast Break Points, Points Off Turnovers
   - Four Factors: eFG%, TOV%, OReb%, FT Rate
   - Pace, Possessions, True Shooting%, Game Score, Rating
   - Visually highlight the better value in each row in blue
4. **Player Box Score (Kentucky)** — Sortable table:
   Starter indicator | Name | MIN | PTS | REB (O/D/T) | AST | STL | BLK | TO | PF | FG | 2P | 3P | FT | eFG% | TS% | OffRtg | DefRtg | NetRtg | Usage | GameScore
5. **Player Box Score (Opponent)** — Same format
6. **Shot Chart** — Full half-court canvas with Kentucky's shots plotted (made/missed, colored by range). Show opponent shots too with toggle. Use shotchart.js.
7. **Lineup Analysis** — Table of all 5-man lineups used in the game with: Players | Minutes | Points | NetRating | eFG% | TOV% | OReb%. Sort by minutes desc.
8. **Win Probability Chart** — Line chart (Chart.js) showing homeWinProbability over the course of the game, plotted by play sequence. Kentucky highlighted.
9. **Play-by-Play Log** — Scrollable log grouped by period:
   - Each play: Clock | Score | Play Description
   - Color-code: scoring plays green, turnovers red, fouls yellow
   - Filter buttons: All | Scoring | Shots | Fouls | Turnovers
10. **Print/Export Buttons** at top-right.

---

### PAGE 6: `stats.html` — Player Stats Tables

**Purpose:** Full statistical tables for all UK players, current season by default.

**API Calls:**
- `GET /stats/player/season?team=Kentucky&season={year}` → All player stats
- `GET /stats/player/shooting/season?team=Kentucky&season={year}` → Shooting breakdown

**Layout:**
1. **Page Header** — "Player Statistics" + season label
2. **Season Type Toggle** — Regular Season | Postseason | All
3. **Stats Category Tabs:**
   - **Traditional** — G | GS | MIN/G | PTS | REB | AST | STL | BLK | TO | PF | FG%-ATT | 3P%-ATT | FT%-ATT
   - **Advanced** — Usage% | OffRtg | DefRtg | NetRtg | PORPAG | eFG% | TS% | AST/TO | FT Rate | OReb% | Win Shares | WS/40
   - **Shooting** — FG | 2P (M-A-%) | 3P (M-A-%) | FT (M-A-%) | Dunks (M-A-%) | Layups (M-A-%) | 2P Jumpers (M-A-%) | 3P Jumpers (M-A-%) | Assisted%
   - **Per-Game** vs **Totals** toggle on all tabs
4. **Sortable Table** — Click any column header to sort ascending/descending. Sort arrow indicator. Default sort: minutes descending.
5. **Stat Heat Colors** — Each cell is color-coded on a blue-to-red gradient relative to the column's min/max values. Toggle heat colors on/off.
6. **Player name links** → player.html?id={athleteId}
7. **Export CSV** button — downloads current table as CSV
8. **Print/Export** buttons

---

### PAGE 7: `team-stats.html` — Team Season Stats

**Purpose:** Detailed Kentucky team stats, including shooting breakdown and four factors.

**API Calls:**
- `GET /stats/team/season?team=Kentucky&season={year}` → Season totals + per-game
- `GET /stats/team/shooting/season?team=Kentucky&season={year}&season={year}` → Shooting types
- `GET /ratings/adjusted?team=Kentucky&season={year}` → Adjusted ratings
- `GET /ratings/elo?team=Kentucky&season={year}` → Elo
- `GET /games/teams?team=Kentucky&season={year}` → Per-game data for trend charts

**Layout:**
1. **Season Summary** — Record, PPG, Opp PPG, Pace, Possessions
2. **Team vs Opponent Comparison Panel** — Side-by-side cards for UK vs Opponent averages. Stats: PPG, FG%, 3P%, FT%, REB, AST, TO, STL, BLK
3. **Four Factors Panel** — eFG%, TOV%, OReb%, FT Rate for UK and Opponent. Show which factors UK wins/loses vs opponents with visual indicators.
4. **Shooting Breakdown Section:**
   - Bar chart: attempts breakdown by type (Dunks / Layups / Tip-Ins / Mid-Range / 3P Jumpers)
   - Table: each shot type with Made / Attempted / Pct / Assisted Pct
5. **Points Sources Panel** — Points in Paint | Fast Break Points | Off-Turnovers | Other. Show as donut chart + numbers.
6. **Adjusted Efficiency** — OffRtg / DefRtg / NetRtg with national rank badges. Comparison bar showing rating vs national average (100).
7. **Elo Rating** — Current Elo with context ("Top 25 nationally", "Above average", etc.)
8. **Per-Game Trend Charts** — Line charts (toggle stat): Points scored / Points allowed / FG% / 3P% over the season game by game.
9. **Historical Comparison Table** — Show team stats for available seasons (2018-2025). Let user see how this year compares to prior years.
10. **Print/Export** buttons

---

### PAGE 8: `compare.html` — Player Comparison

**Purpose:** Compare 1-4 players side by side, optionally from different seasons.

**API Calls (per player selected):**
- `GET /stats/player/season?team=Kentucky&season={year}` → Stats for that season
- `GET /stats/player/shooting/season?team=Kentucky&season={year}` → Shooting stats

**Layout:**
1. **Page Header** — "Player Comparison Tool"
2. **Player Selector Panel** — Up to 4 side-by-side player slots. Each slot has:
   - Season dropdown (2018-2025)
   - Player dropdown (populated from API based on season selected)
   - "Add Player" / "Clear" buttons
   - Clicking a player on player.html can pre-populate a comparison slot via URL params
3. **Comparison View Tabs** — Traditional | Advanced | Shooting
4. **Stat Comparison Table** — Rows = stats, Columns = selected players. Highlight the best value in each row in blue. Show player names + season in column headers (e.g. "Oscar Tshiebwe 2022").
5. **Radar Chart** — Overlapping radar charts for all selected players on same chart. Uses 6 dimensions normalized to Kentucky historical context: Scoring / Rebounding / Playmaking / Defense / Efficiency / Shot Creation.
6. **Bar Chart Comparison** — Side-by-side grouped bar chart for key traditional stats.
7. **Shot Chart Grid** — For each selected player, show a mini shot chart (small canvas). Click to expand full size.
8. **URL Sharing** — "Copy Link" button that encodes all selected players + seasons into URL params so comparisons can be shared.
9. **Print/Export** buttons

---

### PAGE 9: `lineups.html` — Lineup Analysis

**Purpose:** Show how different 5-man combinations performed.

**API Calls:**
- `GET /lineups/team?team=Kentucky&season={year}` → All lineup combinations and their stats

**Layout:**
1. **Page Header** — "Lineup Analysis" + season label
2. **Minimum Minutes Filter** — Slider (default: 10 min) to filter out lineups with very little time together
3. **Best Lineups Table** — Sortable table: Players (5 names) | Minutes | NetRating | OffRtg | DefRtg | Pace | eFG% | TOV% | OReb% | FT Rate | Points | Possessions
4. **Sort by NetRating by default**
5. **Lineup Detail Card** — Click a lineup row to expand a detail panel showing all stats for that unit + opponent stats allowed
6. **Player Lineup Matrix** — For each player on the roster, show their best and worst 5-man combinations in a mini table
7. **Top 5 / Bottom 5** panels — "Best Lineups by NetRating" and "Most-Used Lineups" quick-view cards
8. **Print/Export** buttons

---

### PAGE 10: `rankings.html` — Poll Rankings History

**Purpose:** Kentucky's historical AP and Coaches Poll rankings by week.

**API Calls:**
- `GET /rankings?team=Kentucky&season={year}` → All poll entries for Kentucky that season
- `GET /rankings?team=Kentucky&season={year}&pollType=ap` → AP only
- `GET /rankings?team=Kentucky&season={year}&pollType=coaches` → Coaches only

**Layout:**
1. **Page Header** — "Poll Rankings History" + season
2. **AP Poll Tab | Coaches Poll Tab** toggle
3. **Ranking Line Chart** — Chart.js line chart showing ranking (inverted Y-axis: 1 at top, 25 at bottom) vs week number. "NR" weeks shown as dashed line below 25. Kentucky's line in blue.
4. **Rankings Table** — Week | Date | Poll | Ranking | Points | First Place Votes
5. **Highest Ranking** / **Weeks Ranked** / **Current Ranking** — 3 stat cards at top
6. **Print/Export** buttons

---

### PAGE 11: `ratings.html` — Efficiency & Elo Ratings

**Purpose:** Advanced team efficiency and Elo ratings with context.

**API Calls:**
- `GET /ratings/adjusted?team=Kentucky&season={year}` → OffRtg, DefRtg, NetRtg + national ranks
- `GET /ratings/elo?team=Kentucky&season={year}` → Elo rating

**Layout:**
1. **Adjusted Efficiency Panel:**
   - Three large stat cards: Offensive Rating | Defensive Rating | Net Rating
   - Each shows the rating value + national rank badge (e.g. "#8 Nationally")
   - Progress bars showing rating vs national average (100 baseline)
2. **National Context Bar** — Show UK's offensive and defensive ratings on a horizontal number line relative to the national average and elite programs
3. **Elo Rating Card** — Current Elo, description of what it means
4. **Historical Trend** (multi-season) — Line chart showing UK's adjusted Net Rating and Elo across all available seasons (2018-2025). Lets fans see program trajectory.
5. **Print/Export** buttons

---

## SHOT CHART TECHNICAL SPECIFICATION

The API returns shot location as `{x, y}` coordinates. Build the court canvas as follows:

**Court Dimensions:** Render the canvas at 500px wide × 470px tall (half court).

**Coordinate Mapping:**
- The API uses a coordinate system where center of the basket is approximately x=25, y=5 (with some variance by data source).
- Map the raw x/y from the API to canvas pixels:
  ```javascript
  const canvasX = (shot.shotInfo.location.x / 50) * canvasWidth;
  const canvasY = (shot.shotInfo.location.y / 94) * canvasHeight;
  ```
- You may need to calibrate once you see real data — add a `calibrate` debug mode that shows raw coordinates.

**Court Lines to Draw (NCAA):**
- Half-court line, center circle
- 3-second lane (key): 12ft wide
- Free throw circle
- Three-point arc: 22ft corners, 20ft 9in arc (NCAA)
- Restricted area arc (4ft radius)
- Backboard and rim
- All lines in `rgba(255,255,255,0.5)` on dark background

**Shot Markers:**
- Made: filled `#0033A0` circle (radius 5px) with white 1px stroke
- Missed: `#E74C3C` X mark (two 6px lines)
- Hover: show tooltip with play text and distance

**Zones for Zone Summary Table:**
- Rim (< 4ft): restricted area
- Short Mid (4-10ft)
- Long Mid (10ft to arc)
- Left Corner 3
- Right Corner 3
- Above-the-Break 3

---

## PRINT / EXPORT FUNCTIONALITY

Add to `js/print.js`:

```javascript
// Load from CDN: https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js

function exportAsImage(elementId, filename) {
  const el = document.getElementById(elementId);
  html2canvas(el, {
    backgroundColor: '#0A0F1E',
    scale: 2,  // 2x for high-res
    useCORS: true
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = filename + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}
```

**Print CSS (`css/print.css`):**
```css
@media print {
  nav, .no-print, .export-buttons { display: none !important; }
  body { background: white; color: black; }
  .card { border: 1px solid #ccc; box-shadow: none; }
  canvas { max-width: 100%; }
  table { font-size: 10px; }
  @page { margin: 0.5in; }
}
```

Every page must have a `.export-buttons` div in the top-right with:
1. `📸 Save as Image` button → calls `exportAsImage('main-content', 'bbnstats-pagename-YYYY')`
2. `🖨️ Print` button → calls `window.print()`

---

## SORTABLE TABLES

All stat tables must be sortable. Use this pattern:

```javascript
function makeSortable(tableId) {
  const table = document.getElementById(tableId);
  const headers = table.querySelectorAll('th[data-sort]');
  headers.forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      const col = th.dataset.sort;
      const asc = th.dataset.asc === 'true';
      sortTable(table, col, !asc);
      th.dataset.asc = !asc;
      // Update sort arrow indicators
      headers.forEach(h => h.querySelector('.sort-arrow')?.remove());
      const arrow = document.createElement('span');
      arrow.className = 'sort-arrow';
      arrow.textContent = asc ? ' ▲' : ' ▼';
      th.appendChild(arrow);
    });
  });
}
```

---

## LOADING STATES & ERROR HANDLING

Every API fetch must show:
1. A skeleton/loading state (CSS animated pulse on placeholder divs) while data loads
2. A user-friendly error state if the API fails: `"Unable to load data. Please try again."` with a retry button
3. A "No data available" empty state for seasons with no data

---

## GITHUB PAGES DEPLOYMENT

**Setup steps Codex should include in README.md:**
1. Create repo named `bbnstats.com` (or any name) on GitHub
2. Go to Settings → Pages → Source: Deploy from branch `main`, folder `/ (root)`
3. Add file `CNAME` in root with contents: `bbnstats.com`
4. In your DNS registrar (where you own bbnstats.com), add:
   - Type: `A` records pointing to GitHub Pages IPs:
     ```
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
     ```
   - Type: `CNAME` record: `www` → `{your-github-username}.github.io`
5. Back in GitHub Pages settings, enable "Enforce HTTPS"
6. Site will be live at https://bbnstats.com within 24 hours of DNS propagation

**No build step needed.** All files are static HTML/CSS/JS. Just push to `main` and GitHub Pages serves them.

---

## THIRD-PARTY LIBRARIES (CDN, no npm needed)

Add these `<script>` and `<link>` tags in the `<head>` of every page:

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@400;600;700&display=swap" rel="stylesheet">

<!-- Chart.js for all charts -->
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

<!-- html2canvas for image export -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

No other dependencies. All other logic is vanilla JS.

---

## API PARAMETER REFERENCE (Kentucky-specific)

Always use these exact values:
- `team=Kentucky` (capital K, exact spelling)
- `season=2025` (integer year — the spring year. 2024-25 season = 2025)
- `conference=SEC` (for any conference-scoped calls)
- For `seasonType` when you want the full picture: omit the parameter (returns all types) or use `regular` for regular season only

**Available seasons:** The API likely has data from approximately 2018 onward. Default to 2025. Year selector should offer: 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018.

---

## FILE EXECUTION ORDER FOR CODEX

Build in this order:
1. `css/style.css` — full design system, nav, cards, buttons, responsive
2. `css/tables.css` — table styles, sort arrows, heat colors
3. `css/charts.css` — canvas and chart container styles
4. `css/print.css` — print media query styles
5. `js/api.js` — API fetch helper with caching
6. `js/utils.js` — all utility functions
7. `js/nav.js` — shared nav HTML injection + season selector
8. `js/shotchart.js` — full shot chart renderer
9. `js/charts.js` — Chart.js wrappers
10. `js/print.js` — export/print functions
11. `index.html` — home dashboard (test all API calls work)
12. `players.html` — roster page
13. `player.html` — player profile (most complex page — build last of these)
14. `schedule.html` — schedule/results
15. `game.html` — box score page
16. `stats.html` — stats tables
17. `team-stats.html` — team stats
18. `compare.html` — comparison tool
19. `lineups.html` — lineup analysis
20. `rankings.html` — poll rankings
21. `ratings.html` — efficiency ratings
22. `CNAME` — contains: `bbnstats.com`
23. `README.md` — deployment instructions

---

## CODEX AGENT INSTRUCTIONS

When executing this plan, follow these rules:

1. **Always include `Authorization: Bearer {API_KEY}` header** in every fetch call via api.js. Never hardcode the key in individual page files — import it from api.js.

2. **Never use `localStorage` for anything except the season preference.** All other state is URL-param based.

3. **Every page must work standalone** — a user can bookmark `player.html?id=12345&season=2024` and it will fully load without visiting other pages first.

4. **Mobile responsive first** — use CSS Grid and Flexbox. Tables get horizontal scroll on mobile. Shot chart canvas scales to container width.

5. **Page load performance** — call only the API endpoints needed for that specific page. Use the `cache` in api.js so navigating between tabs on the same page doesn't re-fetch.

6. **Season selector persistence** — when user changes season in the nav dropdown, save to `localStorage('bbnstats_season')` and reload the current page with the new season. All pages read from this on init.

7. **Kentucky-only site** — every API call is filtered to `team=Kentucky`. This is not a general college basketball site. However on the schedule page, show opponent names prominently.

8. **Shot chart coordinate calibration** — when building shotchart.js, add a hidden debug mode (activated by adding `?debug=shotchart` to the URL) that overlays raw coordinate values on each shot dot to help calibrate the court mapping.

9. **Graceful empty states** — if a player has 0 shot attempts, show "No shot data available" instead of an empty canvas. If Kentucky didn't play in a given season's postseason, hide the postseason tab.

10. **Consistent date formatting** — always display dates as "Mon, Nov 4" format. Never show raw ISO strings to the user.

---

## SUMMARY OF ALL API ENDPOINTS USED

| Endpoint | Used On |
|----------|---------|
| `GET /games?team=Kentucky&season=Y` | index, schedule, game, team-stats |
| `GET /games/teams?team=Kentucky&season=Y` | game, team-stats |
| `GET /games/players?team=Kentucky&season=Y` | player, game |
| `GET /plays/game/{gameId}` | game (play-by-play + shot chart) |
| `GET /plays/game/{gameId}?shootingPlaysOnly=true` | game (shot chart) |
| `GET /plays/player/{id}?season=Y&shootingPlaysOnly=true` | player (shot chart) |
| `GET /substitutions/game/{gameId}` | game (optional: rotation chart) |
| `GET /teams?conference=SEC` | compare (team selector context) |
| `GET /teams/roster?team=Kentucky&season=Y` | players, player |
| `GET /lineups/team?team=Kentucky&season=Y` | lineups |
| `GET /lineups/game/{gameId}` | game |
| `GET /stats/team/season?team=Kentucky&season=Y` | index, team-stats |
| `GET /stats/team/shooting/season?team=Kentucky&season=Y` | team-stats |
| `GET /stats/player/season?team=Kentucky&season=Y` | index, players, player, stats, compare |
| `GET /stats/player/shooting/season?team=Kentucky&season=Y` | player, stats, compare |
| `GET /rankings?team=Kentucky&season=Y` | index, rankings |
| `GET /ratings/adjusted?team=Kentucky&season=Y` | index, team-stats, ratings |
| `GET /ratings/elo?team=Kentucky&season=Y` | team-stats, ratings |
| `GET /lines?team=Kentucky&season=Y` | schedule, game |
