# Cottage Weekend 2026 survey questions

All questions show on one page with a progress bar. The survey does not ask people to choose a location.

Each question below shows the on-page title, then the exact value stored in the Sheet. Field names and values must match `apps-script/Code.gs` and the Sheet headers. Sheet columns, in order: `serverTimestamp, name, fridayDeparture, weekendEnergy, rhythm, activities, otherActivities, structure, openIdeas`.

Required: questions 1, 2, 3, 4 and 7. The rest are optional.

1. **What's your name?** (`name`, text)

2. **Friday, Oct 23: when do you leave?** (`fridayDeparture`)
   - Around 3 pm -> `Around 3 pm`
   - Evening, after work -> `Later in the evening after work`
   - Not sure yet -> `Not sure yet`
   - Other time or place -> `Leaving from somewhere else or at a different time`

3. **What vibe do you want?** (`weekendEnergy`, slider from Cozy indoors to Out in nature)
   - `1 - Mostly cozy house time`, `2 - Lean cozy`, `3 - Balanced`, `4 - Lean outdoors`, `5 - Mostly outdoors in nature`

4. **Late night games or early sunrise?** (`rhythm`)
   - Early morning sunrise -> `Early morning sunrise activities`
   - Late night games -> `Late night games`
   - A bit of both -> `A bit of both`

5. **Outdoor fun?** (`activities`, pick any; shares one column with question 6)
   - `Hiking`, `Lake, swimming, or kayaking`, `Stargazing`, `Campfire or smores`, `Photo walk`

6. **Indoor fun?** (`activities`, pick any; joined with question 5 in one cell)
   - `Board or card games`, `Group cooking`, `Movie night`, `Talent show or open mic`, `Vachan reading or discussion`, `Meditation or quiet reflection`
   - Also on this card, optional text: **Something we missed?** (`otherActivities`)

7. **Saturday: free or planned?** (`structure`, slider from Free time to Planned together)
   - `1 - Mostly free time`, `2 - Light structure`, `3 - Balanced`, `4 - More planned`, `5 - Mostly planned together`

8. **Anything else?** (`openIdeas`, optional text)
