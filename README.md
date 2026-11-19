# Leonida Trophy Atlas — GTA VI Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Andysyahputra/gta6-trophy-guide-01/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Andysyahputra/gta6-trophy-guide-01/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for the 55 trophies of **Grand Theft Auto VI** (PlayStation 5). Built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/c/gta6-trophy-guide-01).

## What it is

- **Every trophy** with its official name, description and grade as PlayStation publishes them (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden).
- **A guide in our own words for every trophy**, each citing its sources (Exophase, Press-Start, Output Lag, Of Zen and Computing, eGamers) — a source is cited, never copied.
- **A roadmap to the platinum** in four stages, built from the official descriptions, with the one possibly-missable trophy flagged (**Positive Mental Attitude** — do its Chapter 1 meditation spot before Chapter 1 ends; there is no mission replay).
- **A tracker**: check off trophies you have earned, progress saved in the browser (localStorage), exportable to a file and importable back.
- **Filters** by kind (story, missable, collectibles, activities, online) and grade, a **search** box, and a **spoiler setting** that hides the names and descriptions of hidden story trophies until they are earned.
- **Fully offline**: static files under `app/`, no build step, no network request at run time. Serve `app/` with any static server and open `index.html`.

## Run it

```sh
node serve.ts        # serves app/ at http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/dossier.json
```

`main.ts` copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`, unchanged from the kit).

## Sources

List data and counts were cross-checked across Exophase, Press-Start, Output Lag, Of Zen and Computing and eGamers, which agree on every name, description and grade. Each trophy's guide in `app/data/trophies.json` names its own sources beside it.

Unofficial fan guide. Not affiliated with Rockstar Games, Take-Two Interactive or Sony Interactive Entertainment. No Rockstar logo, artwork or game screenshots are used; the look is our own.
