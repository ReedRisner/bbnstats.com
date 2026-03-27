# College Basketball Data API Documentation

**API Key:** `0/5PdgRvOqvcUo9VqUAcXFUEYqXxU3T26cGqt9c6FFArBcyqE4BD3njMuwOnQz+3`

---

## 1. Get Games

**Endpoint:** `https://api.collegebasketballdata.com/games`

### Filters

| Name | Type | Description |
|------|------|-------------|
| startDateRange | string($date-time) (query) | Optional start timestamp in ISO 8601 format |
| endDateRange | string($date-time) (query) | Optional end timestamp in ISO 8601 format |
| team | string (query) | Optional team name filter |
| conference | string (query) | Optional conference abbreviation filter |
| season | integer($int32) (query) | Optional season filter |
| seasonType | string (query) | Optional season type filter. Available values: postseason, preseason, regular |
| status | string (query) | Optional game status filter. Available values: scheduled, in_progress, final, postponed, cancelled |
| tournament | string (query) | Optional tournament filter (e.g. NCAA, NIT, etc) |

### Example Result

```json
[
  {
    "id": 0,
    "sourceId": "string",
    "seasonLabel": "string",
    "season": 0,
    "seasonType": "postseason",
    "startDate": "2026-02-28T00:36:53.032Z",
    "startTimeTbd": true,
    "neutralSite": true,
    "conferenceGame": true,
    "gameType": "string",
    "tournament": "string",
    "gameNotes": "string",
    "status": "scheduled",
    "attendance": 0,
    "homeTeamId": 0,
    "homeTeam": "string",
    "homeConferenceId": 0,
    "homeConference": "string",
    "homeSeed": 0,
    "homePoints": 0,
    "homePeriodPoints": [0],
    "homeWinner": true,
    "homeTeamEloStart": 0,
    "homeTeamEloEnd": 0,
    "awayTeamId": 0,
    "awayTeam": "string",
    "awayConferenceId": 0,
    "awayConference": "string",
    "awaySeed": 0,
    "awayPoints": 0,
    "awayPeriodPoints": [0],
    "awayWinner": true,
    "awayTeamEloStart": 0,
    "awayTeamEloEnd": 0,
    "excitement": 0,
    "venueId": 0,
    "venue": "string",
    "city": "string",
    "state": "string"
  }
]
```

---

## 2. Team Stats of Specific Games

**Endpoint:** `https://api.collegebasketballdata.com/games/teams`

### Filters

| Name | Type | Description |
|------|------|-------------|
| startDateRange | string($date-time) (query) | Optional start timestamp in ISO 8601 format |
| endDateRange | string($date-time) (query) | Optional end timestamp in ISO 8601 format |
| team | string (query) | Optional team name filter |
| conference | string (query) | Optional conference abbreviation filter |
| season | number($double) (query) | Optional season filter |
| seasonType | string (query) | Optional season type filter |
| tournament | string (query) | Optional tournament filter (e.g. NCAA, NIT, etc) |

### Example Result

```json
[
  {
    "gameId": 0,
    "season": 0,
    "seasonLabel": "string",
    "seasonType": "postseason",
    "tournament": "string",
    "startDate": "2026-02-28T00:39:07.843Z",
    "startTimeTbd": true,
    "teamId": 0,
    "team": "string",
    "conference": "string",
    "teamSeed": 0,
    "opponentId": 0,
    "opponent": "string",
    "opponentConference": "string",
    "opponentSeed": 0,
    "neutralSite": true,
    "isHome": true,
    "conferenceGame": true,
    "gameType": "string",
    "notes": "string",
    "gameMinutes": 0,
    "pace": 0,
    "teamStats": {
      "fieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
      "twoPointFieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
      "threePointFieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
      "freeThrows": { "pct": 0, "attempted": 0, "made": 0 },
      "rebounds": { "total": 0, "defensive": 0, "offensive": 0 },
      "turnovers": { "teamTotal": 0, "total": 0 },
      "fouls": { "flagrant": 0, "technical": 0, "total": 0 },
      "points": {
        "fastBreak": 0,
        "offTurnovers": 0,
        "inPaint": 0,
        "byPeriod": [0],
        "largestLead": 0,
        "total": 0
      },
      "fourFactors": {
        "freeThrowRate": 0,
        "offensiveReboundPct": 0,
        "turnoverRatio": 0,
        "effectiveFieldGoalPct": 0
      },
      "assists": 0,
      "blocks": 0,
      "steals": 0,
      "possessions": 0,
      "rating": 0,
      "trueShooting": 0,
      "gameScore": 0
    },
    "opponentStats": {
      "fieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
      "twoPointFieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
      "threePointFieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
      "freeThrows": { "pct": 0, "attempted": 0, "made": 0 },
      "rebounds": { "total": 0, "defensive": 0, "offensive": 0 },
      "turnovers": { "teamTotal": 0, "total": 0 },
      "fouls": { "flagrant": 0, "technical": 0, "total": 0 },
      "points": {
        "fastBreak": 0,
        "offTurnovers": 0,
        "inPaint": 0,
        "byPeriod": [0],
        "largestLead": 0,
        "total": 0
      },
      "fourFactors": {
        "freeThrowRate": 0,
        "offensiveReboundPct": 0,
        "turnoverRatio": 0,
        "effectiveFieldGoalPct": 0
      },
      "assists": 0,
      "blocks": 0,
      "steals": 0,
      "possessions": 0,
      "rating": 0,
      "trueShooting": 0,
      "gameScore": 0
    }
  }
]
```

---

## 3. Player Stats of Specific Games

**Endpoint:** `https://api.collegebasketballdata.com/games/players`

### Filters

| Name | Type | Description |
|------|------|-------------|
| startDateRange | string($date-time) (query) | Optional start timestamp in ISO 8601 format |
| endDateRange | string($date-time) (query) | Optional end timestamp in ISO 8601 format |
| team | string (query) | Optional team name filter |
| conference | string (query) | Optional conference abbreviation filter |
| season | number($double) (query) | Optional season filter |
| seasonType | string (query) | Optional season type filter |
| tournament | string (query) | Optional tournament filter (e.g. NCAA, NIT, etc) |

### Example Result

```json
[
  {
    "gameId": 0,
    "season": 0,
    "seasonLabel": "string",
    "seasonType": "postseason",
    "tournament": "string",
    "startDate": "2026-02-28T00:40:04.670Z",
    "startTimeTbd": true,
    "teamId": 0,
    "team": "string",
    "conference": "string",
    "teamSeed": 0,
    "opponentId": 0,
    "opponent": "string",
    "opponentConference": "string",
    "opponentSeed": 0,
    "neutralSite": true,
    "isHome": true,
    "conferenceGame": true,
    "gameType": "string",
    "notes": "string",
    "gameMinutes": 0,
    "gamePace": 0,
    "players": [
      {
        "rebounds": { "total": 0, "defensive": 0, "offensive": 0 },
        "freeThrows": { "pct": 0, "attempted": 0, "made": 0 },
        "threePointFieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
        "twoPointFieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
        "fieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
        "offensiveReboundPct": 0,
        "freeThrowRate": 0,
        "assistsTurnoverRatio": 0,
        "gameScore": 0,
        "trueShootingPct": 0,
        "effectiveFieldGoalPct": 0,
        "netRating": 0,
        "defensiveRating": 0,
        "offensiveRating": 0,
        "usage": 0,
        "blocks": 0,
        "steals": 0,
        "assists": 0,
        "fouls": 0,
        "turnovers": 0,
        "points": 0,
        "minutes": 0,
        "ejected": true,
        "starter": true,
        "position": "string",
        "name": "string",
        "athleteSourceId": "string",
        "athleteId": 0
      }
    ]
  }
]
```

---

## 4. Returns All Plays for a Given Game

**Endpoint:** `https://api.collegebasketballdata.com/plays/game/{gameId}`

### Filters

| Name | Type | Description |
|------|------|-------------|
| gameId *(required)* | integer($int32) (path) | Game id filter |
| shootingPlaysOnly | boolean (query) | Optional filter to only return shooting plays |

### Example Result

```json
[
  {
    "id": 0,
    "sourceId": "string",
    "gameId": 0,
    "gameSourceId": "string",
    "gameStartDate": "2026-02-28T00:41:14.463Z",
    "season": 0,
    "seasonType": "postseason",
    "gameType": "string",
    "tournament": "string",
    "playType": "string",
    "isHomeTeam": true,
    "teamId": 0,
    "team": "string",
    "conference": "string",
    "teamSeed": 0,
    "opponentId": 0,
    "opponent": "string",
    "opponentConference": "string",
    "opponentSeed": 0,
    "period": 0,
    "clock": "string",
    "secondsRemaining": 0,
    "homeScore": 0,
    "awayScore": 0,
    "homeWinProbability": 0,
    "scoringPlay": true,
    "shootingPlay": true,
    "scoreValue": 0,
    "wallclock": "2026-02-28T00:41:14.463Z",
    "playText": "string",
    "participants": [
      { "name": "string", "id": 0 }
    ],
    "onFloor": [
      { "team": "string", "name": "string", "id": 0 }
    ],
    "shotInfo": {
      "shooter": { "name": "string", "id": 0 },
      "made": true,
      "range": "rim",
      "assisted": true,
      "assistedBy": { "name": "string", "id": 0 },
      "location": { "y": 0, "x": 0 }
    }
  }
]
```

---

## 5. Returns All Player Substitutions for a Game

**Endpoint:** `https://api.collegebasketballdata.com/substitutions/game/{gameid}`

### Filters

| Name | Type | Description |
|------|------|-------------|
| gameId *(required)* | integer($int32) (path) | Game id filter |

### Example Result

```json
[
  {
    "gameId": 0,
    "startDate": "2026-02-28T00:45:49.434Z",
    "teamId": 0,
    "team": "string",
    "conference": "string",
    "athleteId": 0,
    "athlete": "string",
    "position": "string",
    "opponentId": 0,
    "opponent": "string",
    "opponentConference": "string",
    "subIn": {
      "opponentPoints": 0,
      "teamPoints": 0,
      "secondsRemaining": 0,
      "period": 0
    },
    "subOut": {
      "opponentPoints": 0,
      "teamPoints": 0,
      "secondsRemaining": 0,
      "period": 0
    }
  }
]
```

---

## 6. Retrieve Team Information

**Endpoint:** `https://api.collegebasketballdata.com/teams`

### Filters

| Name | Type | Description |
|------|------|-------------|
| conference | string (query) | Optional conference filter |
| season | integer($int32) (query) | Optional season filter |

### Example Result

```json
[
  {
    "id": 0,
    "sourceId": "string",
    "school": "string",
    "mascot": "string",
    "abbreviation": "string",
    "displayName": "string",
    "shortDisplayName": "string",
    "primaryColor": "string",
    "secondaryColor": "string",
    "currentVenueId": 0,
    "currentVenue": "string",
    "currentCity": "string",
    "currentState": "string",
    "conferenceId": 0,
    "conference": "string"
  }
]
```

---

## 7. Retrieve Team Roster

**Endpoint:** `https://api.collegebasketballdata.com/teams/roster?season={year}`

### Filters

| Name | Type | Description |
|------|------|-------------|
| season *(required)* | integer($int32) (query) | Season filter |
| team | string (query) | Optional team filter |

### Example Result

```json
[
  {
    "teamId": 0,
    "teamSourceId": "string",
    "team": "string",
    "conference": "string",
    "season": 0,
    "players": [
      {
        "id": 0,
        "sourceId": "string",
        "name": "string",
        "firstName": "string",
        "lastName": "string",
        "jersey": "string",
        "position": "string",
        "height": 0,
        "weight": 0,
        "hometown": {
          "countyFips": "string",
          "longitude": 0,
          "latitude": 0,
          "country": "string",
          "state": "string",
          "city": "string"
        },
        "dateOfBirth": "2026-02-28",
        "startSeason": 0,
        "endSeason": 0
      }
    ]
  }
]
```

---

## 8. Retrieve Conferences

**Endpoint:** `https://api.collegebasketballdata.com/conferences`

### Example Result

```json
[
  {
    "id": 0,
    "sourceId": "string",
    "name": "string",
    "abbreviation": "string",
    "shortName": "string"
  }
]
```

---

## 9. Get Lineup Stats for a Specific Team and Season

**Endpoint:** `https://api.collegebasketballdata.com/lineups/team?season={year}&team={string}`

### Filters

| Name | Type | Description |
|------|------|-------------|
| season *(required)* | integer($int32) (query) | Required season filter |
| team *(required)* | string (query) | Required team filter |
| startDateRange | string($date-time) (query) | Optional start date range filter |
| endDateRange | string($date-time) (query) | Optional end date range filter |

### Example Result

```json
[
  {
    "teamId": 0,
    "team": "string",
    "conference": "string",
    "idHash": "string",
    "athletes": [
      { "name": "string", "id": 0 }
    ],
    "totalSeconds": 0,
    "pace": 0,
    "offenseRating": 0,
    "defenseRating": 0,
    "netRating": 0,
    "teamStats": {
      "possessions": 0,
      "points": 0,
      "blocks": 0,
      "assists": 0,
      "steals": 0,
      "turnovers": 0,
      "defensiveRebounds": 0,
      "offensiveRebounds": 0,
      "trueShooting": 0,
      "fieldGoals": { "made": 0, "attempted": 0, "pct": 0 },
      "twoPointers": "string",
      "threePointers": { "made": 0, "attempted": 0, "pct": 0 },
      "freeThrows": { "made": 0, "attempted": 0, "pct": 0 },
      "fourFactors": {
        "freeThrowRate": 0,
        "offensiveReboundPct": 0,
        "turnoverRatio": 0,
        "effectiveFieldGoalPct": 0
      }
    },
    "opponentStats": {
      "possessions": 0,
      "points": 0,
      "blocks": 0,
      "assists": 0,
      "steals": 0,
      "turnovers": 0,
      "defensiveRebounds": 0,
      "offensiveRebounds": 0,
      "trueShooting": 0,
      "fieldGoals": { "made": 0, "attempted": 0, "pct": 0 },
      "twoPointers": "string",
      "threePointers": { "made": 0, "attempted": 0, "pct": 0 },
      "freeThrows": { "made": 0, "attempted": 0, "pct": 0 },
      "fourFactors": {
        "freeThrowRate": 0,
        "offensiveReboundPct": 0,
        "turnoverRatio": 0,
        "effectiveFieldGoalPct": 0
      }
    }
  }
]
```

---

## 10. Gets Lineup Statistics for a Specific Game

**Endpoint:** `https://api.collegebasketballdata.com/lineups/game/{gameId}`

### Example Result

```json
[
  {
    "teamId": 0,
    "team": "string",
    "conference": "string",
    "idHash": "string",
    "athletes": [
      { "name": "string", "id": 0 }
    ],
    "totalSeconds": 0,
    "pace": 0,
    "offenseRating": 0,
    "defenseRating": 0,
    "netRating": 0,
    "teamStats": {
      "possessions": 0,
      "points": 0,
      "blocks": 0,
      "assists": 0,
      "steals": 0,
      "turnovers": 0,
      "defensiveRebounds": 0,
      "offensiveRebounds": 0,
      "trueShooting": 0,
      "fieldGoals": { "made": 0, "attempted": 0, "pct": 0 },
      "twoPointers": "string",
      "threePointers": { "made": 0, "attempted": 0, "pct": 0 },
      "freeThrows": { "made": 0, "attempted": 0, "pct": 0 },
      "fourFactors": {
        "freeThrowRate": 0,
        "offensiveReboundPct": 0,
        "turnoverRatio": 0,
        "effectiveFieldGoalPct": 0
      }
    },
    "opponentStats": {
      "possessions": 0,
      "points": 0,
      "blocks": 0,
      "assists": 0,
      "steals": 0,
      "turnovers": 0,
      "defensiveRebounds": 0,
      "offensiveRebounds": 0,
      "trueShooting": 0,
      "fieldGoals": { "made": 0, "attempted": 0, "pct": 0 },
      "twoPointers": "string",
      "threePointers": { "made": 0, "attempted": 0, "pct": 0 },
      "freeThrows": { "made": 0, "attempted": 0, "pct": 0 },
      "fourFactors": {
        "freeThrowRate": 0,
        "offensiveReboundPct": 0,
        "turnoverRatio": 0,
        "effectiveFieldGoalPct": 0
      }
    }
  }
]
```

---

## 11. Returns Team Season Statistics by Year or Team

**Endpoint:** `https://api.collegebasketballdata.com/stats/team/season`

### Filters

| Name | Type | Description |
|------|------|-------------|
| season | number($double) (query) | Optional season filter, required if team is not provided |
| seasonType | string (query) | Optional season type filter |
| team | string (query) | Optional team name filter, required if season is not provided |
| conference | string (query) | Optional conference abbreviation filter |
| startDateRange | string($date-time) (query) | |
| endDateRange | string($date-time) (query) | |

### Example Result

```json
[
  {
    "season": 0,
    "seasonLabel": "string",
    "teamId": 0,
    "team": "string",
    "conference": "string",
    "games": 0,
    "wins": 0,
    "losses": 0,
    "totalMinutes": 0,
    "pace": 0,
    "teamStats": {
      "fieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
      "twoPointFieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
      "threePointFieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
      "freeThrows": { "pct": 0, "attempted": 0, "made": 0 },
      "rebounds": { "total": 0, "defensive": 0, "offensive": 0 },
      "turnovers": { "teamTotal": 0, "total": 0 },
      "fouls": { "flagrant": 0, "technical": 0, "total": 0 },
      "points": { "fastBreak": 0, "offTurnovers": 0, "inPaint": 0, "total": 0 },
      "fourFactors": {
        "freeThrowRate": 0,
        "offensiveReboundPct": 0,
        "turnoverRatio": 0,
        "effectiveFieldGoalPct": 0
      },
      "assists": 0,
      "blocks": 0,
      "steals": 0,
      "possessions": 0,
      "rating": 0,
      "trueShooting": 0
    },
    "opponentStats": {
      "fieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
      "twoPointFieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
      "threePointFieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
      "freeThrows": { "pct": 0, "attempted": 0, "made": 0 },
      "rebounds": { "total": 0, "defensive": 0, "offensive": 0 },
      "turnovers": { "teamTotal": 0, "total": 0 },
      "fouls": { "flagrant": 0, "technical": 0, "total": 0 },
      "points": { "fastBreak": 0, "offTurnovers": 0, "inPaint": 0, "total": 0 },
      "fourFactors": {
        "freeThrowRate": 0,
        "offensiveReboundPct": 0,
        "turnoverRatio": 0,
        "effectiveFieldGoalPct": 0
      },
      "assists": 0,
      "blocks": 0,
      "steals": 0,
      "possessions": 0,
      "rating": 0,
      "trueShooting": 0
    }
  }
]
```

---

## 12. Retrieves Team Season Shooting Statistics

**Endpoint:** `https://api.collegebasketballdata.com/stats/team/shooting/season?season={year}`

### Filters

| Name | Type | Description |
|------|------|-------------|
| season *(required)* | integer($int32) (query) | Required season filter |
| seasonType | string (query) | Optional season type filter |
| team | string (query) | Team filter, required if conference is not provided |
| conference | string (query) | Conference abbreviation filter, required if team is not provided |
| startDateRange | string($date-time) (query) | Optional start date range filter |
| endDateRange | string($date-time) (query) | Optional end date range filter |

### Example Result

```json
[
  {
    "season": 0,
    "teamId": 0,
    "team": "string",
    "conference": "string",
    "trackedShots": 0,
    "assistedPct": 0,
    "freeThrowRate": 0,
    "dunks": { "made": 0, "attempted": 0, "pct": 0, "assistedPct": 0, "assisted": 0 },
    "layups": { "made": 0, "attempted": 0, "pct": 0, "assistedPct": 0, "assisted": 0 },
    "tipIns": { "made": 0, "attempted": 0, "pct": 0 },
    "twoPointJumpers": { "made": 0, "attempted": 0, "pct": 0, "assistedPct": 0, "assisted": 0 },
    "threePointJumpers": { "made": 0, "attempted": 0, "pct": 0, "assistedPct": 0, "assisted": 0 },
    "freeThrows": { "made": 0, "attempted": 0, "pct": 0 },
    "attemptsBreakdown": {
      "threePointJumpers": 0,
      "twoPointJumpers": 0,
      "tipIns": 0,
      "layups": 0,
      "dunks": 0
    }
  }
]
```

---

## 13. Returns Player Statistics by Season

**Endpoint:** `https://api.collegebasketballdata.com/stats/player/season?season={year}`

### Filters

| Name | Type | Description |
|------|------|-------------|
| season *(required)* | number($double) (query) | Required season filter |
| seasonType | string (query) | Optional season type filter |
| team | string (query) | Optional team name filter |
| conference | string (query) | Optional conference abbreviation filter |
| startDateRange | string($date-time) (query) | |
| endDateRange | string($date-time) (query) | |

### Example Result

```json
[
  {
    "season": 0,
    "seasonLabel": "string",
    "teamId": 0,
    "team": "string",
    "conference": "string",
    "athleteId": 0,
    "athleteSourceId": "string",
    "name": "string",
    "position": "string",
    "games": 0,
    "starts": 0,
    "minutes": 0,
    "points": 0,
    "turnovers": 0,
    "fouls": 0,
    "assists": 0,
    "steals": 0,
    "blocks": 0,
    "usage": 0,
    "offensiveRating": 0,
    "defensiveRating": 0,
    "netRating": 0,
    "PORPAG": 0,
    "effectiveFieldGoalPct": 0,
    "trueShootingPct": 0,
    "assistsTurnoverRatio": 0,
    "freeThrowRate": 0,
    "offensiveReboundPct": 0,
    "fieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
    "twoPointFieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
    "threePointFieldGoals": { "pct": 0, "attempted": 0, "made": 0 },
    "freeThrows": { "pct": 0, "attempted": 0, "made": 0 },
    "rebounds": { "total": 0, "defensive": 0, "offensive": 0 },
    "winShares": { "totalPer40": 0, "total": 0, "defensive": 0, "offensive": 0 }
  }
]
```

---

## 14. Retrieves Player Season Shooting Statistics

**Endpoint:** `https://api.collegebasketballdata.com/stats/player/shooting/season?season={year}`

### Filters

| Name | Type | Description |
|------|------|-------------|
| season *(required)* | integer($int32) (query) | Required season filter |
| seasonType | string (query) | Optional season type filter |
| team | string (query) | Team filter, required if conference is not provided |
| conference | string (query) | Conference abbreviation filter, required if team is not provided |
| startDateRange | string($date-time) (query) | Optional start date range filter |
| endDateRange | string($date-time) (query) | Optional end date range filter |

### Example Result

```json
[
  {
    "season": 0,
    "teamId": 0,
    "team": "string",
    "conference": "string",
    "trackedShots": 0,
    "assistedPct": 0,
    "freeThrowRate": 0,
    "dunks": { "made": 0, "attempted": 0, "pct": 0, "assistedPct": 0, "assisted": 0 },
    "layups": { "made": 0, "attempted": 0, "pct": 0, "assistedPct": 0, "assisted": 0 },
    "tipIns": { "made": 0, "attempted": 0, "pct": 0 },
    "twoPointJumpers": { "made": 0, "attempted": 0, "pct": 0, "assistedPct": 0, "assisted": 0 },
    "threePointJumpers": { "made": 0, "attempted": 0, "pct": 0, "assistedPct": 0, "assisted": 0 },
    "freeThrows": { "made": 0, "attempted": 0, "pct": 0 },
    "attemptsBreakdown": {
      "threePointJumpers": 0,
      "twoPointJumpers": 0,
      "tipIns": 0,
      "layups": 0,
      "dunks": 0
    },
    "athleteId": 0,
    "athleteName": "string"
  }
]
```

---

## 15. Retrieves Poll Data

**Endpoint:** `https://api.collegebasketballdata.com/rankings?season=2026`

### Filters

| Name | Type | Description |
|------|------|-------------|
| season | integer($int32) (query) | Optional season filter |
| seasonType | string (query) | Optional season type filter |
| week | integer($int32) (query) | Optional week filter |
| pollType | string (query) | Optional poll type filter ("ap" or "coaches") |
| team | string (query) | Optional team filter |
| conference | string (query) | Optional conference filter |

### Example Result

```json
[
  {
    "season": 0,
    "seasonType": "postseason",
    "week": 0,
    "pollDate": "2026-02-28T01:36:11.427Z",
    "pollType": "string",
    "teamId": 0,
    "team": "string",
    "conference": "string",
    "ranking": 0,
    "points": 0,
    "firstPlaceVotes": 0
  }
]
```

---

## 16. Retrieve All Plays for a Given Player and Season

**Endpoint:** `https://api.collegebasketballdata.com/plays/player/{playerid}?season={year}`

### Filters

| Name | Type | Description |
|------|------|-------------|
| playerId *(required)* | integer($int32) (path) | Required player id filter |
| season *(required)* | integer($int32) (query) | Required season filter |
| shootingPlaysOnly | boolean (query) | Optional filter to only return shooting plays |

### Example Result

```json
[
  {
    "id": 0,
    "sourceId": "string",
    "gameId": 0,
    "gameSourceId": "string",
    "gameStartDate": "2026-02-28T01:40:01.607Z",
    "season": 0,
    "seasonType": "postseason",
    "gameType": "string",
    "tournament": "string",
    "playType": "string",
    "isHomeTeam": true,
    "teamId": 0,
    "team": "string",
    "conference": "string",
    "teamSeed": 0,
    "opponentId": 0,
    "opponent": "string",
    "opponentConference": "string",
    "opponentSeed": 0,
    "period": 0,
    "clock": "string",
    "secondsRemaining": 0,
    "homeScore": 0,
    "awayScore": 0,
    "homeWinProbability": 0,
    "scoringPlay": true,
    "shootingPlay": true,
    "scoreValue": 0,
    "wallclock": "2026-02-28T01:40:01.607Z",
    "playText": "string",
    "participants": [
      { "name": "string", "id": 0 }
    ],
    "onFloor": [
      { "team": "string", "name": "string", "id": 0 }
    ],
    "shotInfo": {
      "shooter": { "name": "string", "id": 0 },
      "made": true,
      "range": "rim",
      "assisted": true,
      "assistedBy": { "name": "string", "id": 0 },
      "location": { "y": 0, "x": 0 }
    }
  }
]
```

---

## 17. Retrieve List of Play Types

**Endpoint:** `https://api.collegebasketballdata.com/plays/types`

### Example Result

```json
[
  { "id": 0, "name": "Not Available" },
  { "id": 91, "name": "Shot" },
  { "id": 97, "name": "Free Throw 1 of 1" },
  { "id": 215, "name": "Coach's Challenge (Overturned)" },
  { "id": 216, "name": "Coach's Challenge (Stands)" },
  { "id": 402, "name": "End Game" },
  { "id": 412, "name": "End Period" },
  { "id": 420, "name": "Offensive Charge" },
  { "id": 437, "name": "TipShot" },
  { "id": 449, "name": "Dead Ball Rebound" },
  { "id": 519, "name": "PersonalFoul" },
  { "id": 521, "name": "Technical Foul" },
  { "id": 540, "name": "MadeFreeThrow" },
  { "id": 558, "name": "JumpShot" },
  { "id": 572, "name": "LayUpShot" },
  { "id": 574, "name": "DunkShot" },
  { "id": 578, "name": "RegularTimeOut" },
  { "id": 579, "name": "ShortTimeOut" },
  { "id": 580, "name": "OfficialTVTimeOut" },
  { "id": 584, "name": "Substitution" },
  { "id": 586, "name": "Offensive Rebound" },
  { "id": 587, "name": "Defensive Rebound" },
  { "id": 598, "name": "Lost Ball Turnover" },
  { "id": 601, "name": "Foul Turnover" },
  { "id": 607, "name": "Steal" },
  { "id": 615, "name": "Jumpball" },
  { "id": 618, "name": "Block Shot" },
  { "id": 20424, "name": "LayupShot" },
  { "id": 20429, "name": "RegularJumpShot" },
  { "id": 20437, "name": "TipShot" },
  { "id": 20558, "name": "JumpShot" },
  { "id": 20572, "name": "LayUpShot" },
  { "id": 20574, "name": "DunkShot" },
  { "id": 30495, "name": "Three Pointer" },
  { "id": 30558, "name": "Three Point Jump Shot" }
]
```

---

## 18. Retrieves Adjusted Efficiency Ratings

**Endpoint:** `https://api.collegebasketballdata.com/ratings/adjusted?season={year}`

### Filters

| Name | Type | Description |
|------|------|-------------|
| season | integer($int32) (query) | Optional season filter |
| team | string (query) | Optional team filter |
| conference | string (query) | Optional conference abbreviation filter |

### Example Result

```json
[
  {
    "season": 0,
    "teamId": 0,
    "team": "string",
    "conference": "string",
    "offensiveRating": 0,
    "defensiveRating": 0,
    "netRating": 0,
    "rankings": {
      "net": 0,
      "defense": 0,
      "offense": 0
    }
  }
]
```

---

## 19. Retrieves Historical Elo Ratings

**Endpoint:** `https://api.collegebasketballdata.com/ratings/elo?season={year}`

### Filters

| Name | Type | Description |
|------|------|-------------|
| season | integer($int32) (query) | Optional season filter |
| team | string (query) | Optional team filter |
| conference | string (query) | Optional conference filter |

### Example Result

```json
[
  {
    "season": 0,
    "teamId": 0,
    "team": "string",
    "conference": "string",
    "elo": 0
  }
]
```

---

## 20. Returns Betting Lines

**Endpoint:** `https://api.collegebasketballdata.com/lines`

### Filters

| Name | Type | Description |
|------|------|-------------|
| season | integer($int32) (query) | Optional season filter |
| team | string (query) | Optional team name filter |
| conference | string (query) | Optional conference abbreviation filter |
| startDateRange | string($date-time) (query) | Optional start timestamp in ISO 8601 format |
| endDateRange | string($date-time) (query) | Optional end timestamp in ISO 8601 format |

### Example Result

```json
[
  {
    "gameId": 0,
    "season": 0,
    "seasonType": "postseason",
    "startDate": "2026-02-28T01:49:55.312Z",
    "homeTeamId": 0,
    "homeTeam": "string",
    "homeConference": "string",
    "homeScore": 0,
    "awayTeamId": 0,
    "awayTeam": "string",
    "awayConference": "string",
    "awayScore": 0,
    "lines": [
      {
        "provider": "string",
        "spread": 0,
        "overUnder": 0,
        "homeMoneyline": 0,
        "awayMoneyline": 0,
        "spreadOpen": 0,
        "overUnderOpen": 0
      }
    ]
  }
]
```
