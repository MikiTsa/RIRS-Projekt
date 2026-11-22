# workIT

[![CI/CD](https://github.com/MikiTsa/RIRS-Projekt/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/MikiTsa/RIRS-Projekt/actions/workflows/ci-cd.yml)

**workIT** je spletna aplikacija za organizacijo dela v manjših podjetjih in projektnih ekipah. Omogoča upravljanje projektov in nalog, dodeljevanje dela in navodil zaposlenim, spremljanje napredka na Kanban tabli, beleženje delovnega časa ter načrtovanje dnevnih obveznosti. Vodje lahko spremljajo napredek projektov in opravljene ure, vodja podjetja pa upravlja uporabnike.

## Uporabniške vloge

- **Zaposleni:** spremlja dodeljene naloge, beleži čas in ureja svoj dnevni načrt.
- **Vodja projekta:** ustvarja in dodeljuje projektne naloge, dodaja navodila ter spremlja napredek svojih projektov.
- **Vodja podjetja:** upravlja uporabnike in spremlja projekte ter evidence časa.

## Uporabljene tehnologije

- **Frontend:** React, TypeScript, Vite, CSS
- **Backend:** Node.js, Express, TypeScript
- **Podatkovna baza:** PostgreSQL
- **Dostop do baze:** node-postgres (`pg`), SQL
- **Avtentikacija:** JWT, bcrypt
- **Razvojna orodja:** Visual Studio Code, npm, Git, GitHub, Postman

## Zagon frontenda

Predpogoja: Node.js 24 LTS in npm.

```sh
npm install
npm run dev
```

Ukaze zaženite iz korenske mape projekta. Korenski `package.json` namesti
odvisnosti frontenda in razvojne ukaze posreduje v mapo `frontend/`.
Ukazi `npm run build`, `npm run lint` in `npm run typecheck` delujejo tudi iz korena.

Struktura projekta in razvojni ukazi so opisani v
[`frontend/README.md`](./frontend/README.md).

## CI/CD

Nameščena aplikacija: https://workit-mikitsa.netlify.app

Cevovod [`.github/workflows/ci-cd.yml`](./.github/workflows/ci-cd.yml) (GitHub Actions) se zažene ob vsakem pull requestu v `main` in ob vsakem pushu na `main`:

1. **lint** – oxlint preveri kodo frontenda in backenda; vsaka najdena napaka ali opozorilo ustavi cevovod.
2. **build** – zgradi frontend (`frontend/dist`) in backend (TypeScript v `backend/dist`) ter backend zapakira v Docker sliko. Odvisnosti npm so predpomnjene (`actions/setup-node`), rezultata se shranita kot artefakta `frontend-dist` in `backend-image`.
3. **test** – zažene teste frontenda in backenda (Vitest) in shrani poročilo o pokritosti kode kot artefakt `coverage-report`.
4. **deploy** – samo ob pushu na `main` in samo, če so lint, build in test uspešni (okolje `production`). Frontend iz artefakta namesti na Netlify, sliko backenda objavi v GitHub Container Registry in jo namesti na Render; podatkovna baza PostgreSQL teče na Neon.

Zaščita veje `main` zahteva pull request in uspešne preverbe lint, build in test.

## Dokumentacija

Projektna dokumentacija je v mapi [`docs/`](./docs/):

- [01 – Zasnova rešitve](./docs/01-zasnova-resitve.md)
- [02 – Funkcionalnosti in obseg](./docs/02-funkcionalnosti-in-obseg.md)
- [03 – Podatkovni model](./docs/03-podatkovni-model.md)
- [04 – Arhitektura in tehnološki sklad](./docs/04-arhitektura-in-tehnoloski-sklad.md)
- [05 – Uporabniške zgodbe](./docs/05-uporabniske-zgodbe.md)
- [06 – Wireframe-i](./docs/06-wireframe-i.md)

> Projekt je v fazi načrtovanja in razvoja.
