# Beyond Mars - NASA Space Apps Challenge

An educational web game exploring a hypothetical journey to Mars. Players engage with a space-themed adventure while learning about mission planning and the challenges of exploring and sustaining life on the Red Planet.

> The simulation is educational and hypothetical. Viability indicators are not empirical probabilities of survival. See `docs/V13_GDD_REVIEW.md` for design context, scientific boundaries, and known limitations.

## Play locally

**Requirements:** Node.js 18 or newer.

1. Clone or download this repository.
2. In the project root, run:

   ```bash
   npm install
   npm start
   ```

   (There are no external npm dependencies; `npm start` can be run directly.)
3. Open [http://localhost:8080](http://localhost:8080) in your browser.

The game launches in English. Language selection is available in the game menu.

## Tests

Run the automated tests with:

```bash
npm test
```

## Project structure

- `index.html`, `style.css` — web entry point and visual styling.
- `game.js`, `world.js`, `engine.js`, `audio.js`, `route-data.js` — game systems and editable source.
- `assets/`, `data/` — visual/audio assets and game data.
- `dist/` — browser-ready distribution.
- `docs/` — game design review, submission materials, and project documentation.
- `tests/` — automated engine and story tests.
- `server.mjs` — lightweight local Node.js web server.

## GitHub Pages

This repository includes `.nojekyll`. For deployment, configure GitHub Pages to publish the repository's web distribution folder (`dist`) if your Pages configuration supports it. The game can also be hosted by any static web server.

## Project title

**Beyond Mars - NASA Space Apps Challenge**
