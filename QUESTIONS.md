# Cottage Weekend 2026 survey questions

The survey shows all ten questions on one page with a progress bar. It does not ask people to choose a location. Required: questions 1, 2, 3, 4, 5, 7 and 8. The rest are optional.

Each question below shows the on-page title, then the exact value stored in the Sheet. Values must match `apps-script/Code.gs` and the Sheet headers. Field names never changed in the simplification.

1. **What's your name?** (`name`, required text)

2. **Friday, Oct 23: when do you leave?** (`fridayDeparture`, required)
   - Around 3 pm -> `Around 3 pm`
   - Evening, after work -> `Later in the evening after work`
   - Not sure yet -> `Not sure yet`
   - Other time or place -> `Leaving from somewhere else or at a different time`

3. **What vibe do you want?** (`weekendEnergy`, required, 1 to 5: Cozy indoors to Out in nature)
   - `1 - Mostly cozy house time`, `2 - Lean cozy`, `3 - Balanced`, `4 - Lean outdoors`, `5 - Mostly outdoors in nature`

4. **Early bird or night owl?** (`rhythm`, required)
   - Early start -> `Early start or sunrise option`
   - Middle of the road -> `Moderate mornings and balanced nights`
   - Late nights, sleep in -> `Late nights and sleeping in`
   - A bit of both -> `Flexible split with options for both`

5. **Like past years?** (`formatPreference`, required)
   - Keep it the same -> `Keep it mostly the same`
   - Same, plus a few new things -> `Keep the heart but try a few new things`
   - Try something new -> `I would enjoy a meaningfully different format`
   - No preference -> `No strong preference`
   - Also on this screen, optional text: **Want to change one thing?** (`formatChange`)

6. **What sounds fun?** (`activities`, pick any)
   - Hiking, Lake and kayaking (`Lake, swimming, or kayaking`), Stargazing, Games (`Board or card games`), Group cooking, Campfire (`Campfire or smores`), Vachan (`Vachan reading or discussion`), Quiet reflection (`Meditation or quiet reflection`), Movie night, Open mic (`Talent show or open mic`), Photo walk
   - Also on this screen, optional text: **Something we missed?** (`otherActivities`)

7. **Saturday: free or planned?** (`structure`, required, 1 to 5: Free time to Planned together)
   - `1 - Mostly free time`, `2 - Light structure`, `3 - Balanced`, `4 - More planned`, `5 - Mostly planned together`

8. **How do you like quiet time?** (`vachanPreference`, required)
   - A short reading together -> `Short guided Vachan reading or discussion`
   - Time alone -> `Quiet individual reflection time`
   - Mixed into other things -> `Integrated naturally into another activity`
   - No preference -> `No strong preference`

9. **Anything that makes it hard to come?** (`accessNeeds`, optional text, private)

10. **Anything else?** (`openIdeas`, optional text)
