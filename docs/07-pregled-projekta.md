# 07 – Pregled projekta

Pregledan je projekt **workIT** (repozitorij `Sarschi03/RIRS-Projekt`, veja `main`, commit `45f1ae4`). Pregledani so bili dokumentacija (01–06), arhitekturne odločitve (ADR 0001–0008) in koda. Aplikacija je bila zagnana lokalno (PostgreSQL v Dockerju, migracije in testni podatki iz `prisma/seed.ts`) in preizkušena z vsemi tremi vlogami.

Oznake: ✓ implementirano oziroma izpolnjeno, delno, ✗ ni implementirano oziroma ni izpolnjeno.

## 1. Implementirane funkcionalnosti MVP

| # | Funkcionalnost | Stanje | Opomba |
|---|---|---|---|
| – | Prijava, registracija in odjava | ✓ | JWT in bcrypt; brez prijave zaščitene strani niso dostopne. |
| 1 | Ustvarjanje projektov in določanje članov | ✗ | Projekti so le prikazani. Obrazec »Ustvari projekt« se ob potrditvi zapre brez shranjevanja; API za ustvarjanje projekta ne obstaja. |
| 2 | Dodeljevanje nalog z navodili, rokom in odgovorno osebo | delno | Naloge iz baze so prikazane, ustvarjanje in dodeljevanje nalog ne delujeta. |
| 3 | Kanban spremljanje statusa nalog | delno | Naloge so razvrščene v tri stolpce. Premik kartice se ne shrani in se ob osvežitvi strani izgubi. |
| 4 | Beleženje časa s časovnikom ali ročnim vnosom | ✗ | Gumbi časovnika spremenijo le oznako, ročni vnos se ne shrani. Prikazani so le testni vnosi. |
| 5 | Povezovanje ur z nalogo, projektom in zaposlenim | delno | Povezava obstaja v podatkovnem modelu (`TimeEntry` → `Task` → `Project`), ure se seštevajo po nalogah in zaposlenih. Ker vnos ur ne deluje, novih podatkov ni. |
| 6 | Osebni dnevni načrt | delno | Lastne obveznosti so prikazane in jih je mogoče označiti kot opravljene (sprememba se shrani). Dodajanje obveznosti ne deluje. |
| 7 | Nadzorna plošča vodje | delno | Napredek projektov je izračunan pravilno, skupne ure pa zajemajo le ure prijavljenega uporabnika. |

Delujeta prijava in prikaz podatkov iz baze glede na vlogo uporabnika. Glavnega delovnega procesa (vodja ustvari projekt in nalogo → zaposleni spremeni status → beleži čas → vodja spremlja napredek) v aplikaciji ni mogoče izvesti, ker backend razen označevanja dnevnih obveznosti ne omogoča nobenega vnosa ali spremembe podatkov.

## 2. Skladnost z uporabniškimi zgodbami

Pregledanih je 5 uporabniških zgodb glavnega delovnega procesa: US-01, US-02, US-03, US-04 in US-07.

### US-01 – Ustvarjanje projektov in določanje članov

| Kriterij sprejemljivosti | Stanje | Opomba |
|---|---|---|
| Naziv in vodja projekta sta obvezna podatka. | ✗ | Projekta ni mogoče shraniti; obrazec nima polja za vodjo projekta. |
| Člane je mogoče izbrati iz seznama obstoječih uporabnikov. | delno | Seznam uporabnikov iz baze je v obrazcu, izbira se ne shrani. |
| Isti uporabnik ne more biti dvakrat dodan v isti projekt. | ✗ | Omejitev obstaja le v bazi (`@@unique([userId, projectId])`), dodajanja članov ni. |
| Projekt je po shranitvi viden vodji in članom. | ✓ | Zaposleni vidi le projekte, katerih član je. |

**Ocena:** ne zadošča.

### US-02 – Dodeljevanje nalog in navodil

| Kriterij sprejemljivosti | Stanje | Opomba |
|---|---|---|
| Vodja projekta lahko doda nalogo samo v projekt, ki ga vodi. | ✗ | Dodajanje nalog ne deluje. |
| Naloga mora vsebovati naslov, opis/navodila in rok izvedbe. | ✗ | Obrazec nima polja za navodila in ne preverja obveznih podatkov. |
| Odgovorno osebo je mogoče izbrati samo med člani projekta. | ✗ | Seznam ni omejen na člane izbranega projekta, izbira se ne shrani. |
| Dodeljeni zaposleni lahko odpre nalogo in prebere navodila. | delno | Podrobnosti naloge se odprejo, vendar je pod »Navodila za delo« vedno isto vnaprej zapisano besedilo, ne navodila naloge iz baze. |

**Ocena:** ne zadošča.

### US-03 – Kanban spremljanje statusa nalog

| Kriterij sprejemljivosti | Stanje | Opomba |
|---|---|---|
| Naloge so prikazane v stolpcih Za narediti, V izvajanju in Zaključeno. | ✓ | Stolpci se imenujejo »Za opraviti«, »V teku« in »Opravljeno«. |
| Zaposleni lahko spremeni status le nalogi, ki mu je dodeljena. | ✗ | Premakniti je mogoče katerokoli kartico. |
| Po spremembi statusa se naloga prikaže v ustreznem stolpcu. | delno | Le v brskalniku, do osvežitve strani. |
| Sprememba statusa je shranjena in vidna drugim članom projekta. | ✗ | API za spremembo statusa ne obstaja. |

**Ocena:** ne zadošča.

### US-04 – Beleženje časa s časovnikom ali ročno

| Kriterij sprejemljivosti | Stanje | Opomba |
|---|---|---|
| Časovnik je mogoče zagnati samo za nalogo, dodeljeno prijavljenemu zaposlenemu. | ✗ | Časovnik ne meri časa. |
| Uporabnik ima lahko največ en aktiven časovnik. | ✗ | Aktivni časovnik se nikjer ne hrani. |
| Ob ustavitvi časovnika se shrani trajanje, večje od nič. | ✗ | Nič se ne shrani. |
| Ročni vnos zahteva datum, nalogo in pozitivno trajanje v minutah. | ✗ | Obrazec (začetni in končni čas) se zapre brez preverjanja in shranjevanja. |

**Ocena:** ne zadošča.

### US-07 – Nadzorna plošča vodje

| Kriterij sprejemljivosti | Stanje | Opomba |
|---|---|---|
| Nadzorna plošča prikaže število nalog po statusih. | delno | Število je prikazano v glavah stolpcev Kanbana na strani projekta, na nadzorni plošči ga ni. |
| Napredek je delež zaključenih nalog; pri projektu brez nalog je 0 %. | ✓ | Testni projekti: 33 %, 0 %, 0 % in 100 %. |
| Prikazan je seštevek evidentiranih ur projekta. | ✗ | »Zabeležene ure« seštejejo le ure prijavljenega uporabnika; vodja projekta vidi 0 h, čeprav so na njegovem projektu evidentirane ure. |
| Vodja projekta lahko odpre nadzorno ploščo le za projekte, ki jih vodi. | delno | Backend vodji vrne tudi projekte, v katerih je le član. |

**Ocena:** delno zadošča.

## 3. Neskladja med dokumentacijo in kodo

- ADR-0005 in dokument 04 navajata node-postgres (`pg`) brez ORM, koda pa uporablja Prisma ORM; sprememba ni zapisana v novem ADR.
- `README.md` opisuje le zagon frontenda; navodila za zagon backenda in baze manjkajo (datoteka `.env` mora obstajati pred `npm install`, sicer `prisma generate` ne uspe).
- `frontend/README.md` še vedno navaja, da backend in shranjevanje podatkov nista implementirana.
- Registracija dovoli izbiro katerekoli vloge, tudi vodje podjetja, kar nasprotuje US-15.
