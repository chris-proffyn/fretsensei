# HTML Prototype

The functional and technical requirements were derived from the behavioural reference prototype:

**[`fretsensei-fretboard-visualiser.html`](../project/fretsensei-fretboard-visualiser.html)**

Open this file directly in a browser to verify expected behaviour during development.

## Usage During Build

- Treat prototype behaviour as authoritative where it matches the functional requirements.
- Port domain logic into `packages/utils` — do not copy the monolithic script verbatim.
- Production must derive playback notes from the view model, not DOM queries (see technical requirements §20.3).

## Known Prototype vs Production Differences

| Area | Prototype | Production target |
|---|---|---|
| Default fret window | 4 frets (focused) | Full neck (width 25) per FR default state |
| Architecture | Single HTML file (~2,620 lines) | Modular TypeScript monorepo |
| Playback source | DOM query on `.note[data-midi]` | View model `getVisiblePlayableNotes(cells)` |
| `MODAL_AREA_WINDOWS` | Defined in prototype | Not in functional requirements — verify before porting |
