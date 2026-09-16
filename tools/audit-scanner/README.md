# Audit Scanner (intern)

Tool intern de prospectare: analizează site-ul unei firme și generează un
audit comercial cu Top 3 oportunități, de folosit într-o discuție de
vânzare. Nu e public — rulează doar local, pe calculatorul tău.

## Setup local

```bash
cd tools/audit-scanner
npm install
cp .env.example .env
```

Completează `.env` cu `ANTHROPIC_API_KEY` (obligatoriu) și, opțional,
`PAGESPEED_API_KEY` (dacă lipsește, categoria Mobile apare ca "date
incomplete", restul funcționează normal).

## Setup fără nimic instalat local (GitHub Codespaces)

Nu ai nevoie de niciun program instalat — totul rulează într-un browser.

1. **Adaugă cheia ca secret**, pe GitHub (cont personal): profilul tău
   (colț dreapta-sus) → **Settings** → **Codespaces** (sau direct
   `github.com/settings/codespaces`) → secțiunea **Codespaces secrets** →
   **New secret** → nume `ANTHROPIC_API_KEY`, valoare cheia ta, acces la
   repo-ul `cebuc`. (Opțional, la fel, și `PAGESPEED_API_KEY`.) Cheia nu
   ajunge niciodată în cod sau în chat.
2. Pe pagina principală a repo-ului → butonul verde **Code** → tab
   **Codespaces** → **Create codespace on main**.
3. Așteaptă să se pornească — instalează automat dependențele **și
   pornește automat serverul** (`npm run serve`, pe portul 4173).
4. Codespace-ul va detecta portul și va oferi un buton/notificare
   **Open in Browser** — apasă-l ca să vezi interfața direct. Accesul e
   privat, vizibil doar pentru tine (proprietarul repo-ului).

**La reluări ulterioare:** nu creezi un Codespace nou — îl reiei pe cel
existent din listă (tab **Codespaces**). La fiecare pornire/reluare,
Codespace-ul face automat `git pull` (ca să aibă mereu ultima variantă din
`main`) și repornește serverul — fără să mai scrii vreo comandă în terminal.

**Important:** actualizarea automată se întâmplă doar la *pornirea*
Codespace-ului (creare sau reluare după ce a fost oprit). Dacă îl lași
pornit continuu, fără să-l oprești, nu se actualizează singur doar pentru
că s-a făcut push pe `main` — oprește-l și reia-l (sau rulează manual
`git pull` + repornește serverul) ca să prinzi codul nou.

## Interfață vizuală (local, manual)

```bash
npm run serve
```

Deschide [http://localhost:4173](http://localhost:4173) în browser. Interfața
are două ecrane: formular pentru un audit nou (cu progres live) și un
istoric al audit-urilor deja generate. Serverul este legat doar pe
`127.0.0.1` — nu este accesibil din rețea. (În Codespaces, acest pas se
face automat — vezi secțiunea de mai sus.)

## Linie de comandă (alternativ)

```bash
node audit.js --url firma.ro --industry "Construcții" --city "Timișoara" --service "Renovări fațade"
```

Rezultatul (JSON + Markdown) apare în `output/`, indiferent de metoda folosită.

## Verificare anti-halucinare

Fiecare oportunitate din raport are un câmp `evidence`/"Dovadă" care trebuie
să corespundă exact unei observații reale de pe site. Verifică manual cel
puțin primele câteva rapoarte, ca să confirmi că AI-ul nu inventează nimic.

## Ce verifică analizorul

~27 de reguli, în 6 categorii — AI-ul alege dintre ele pe cele mai relevante
pentru fiecare site, nu doar din 2-3 categorii fixe:

- **Contact & conversie**: telefon click-to-call, WhatsApp, formular, CTA
- **Servicii**: pagini dedicate per serviciu sau totul aglomerat
- **Încredere**: portofoliu, testimoniale, experiență, date firmă
- **SEO**: title/meta description, H1/H2, canonical, alt text, sitemap,
  Open Graph (previzualizare la distribuire pe social/WhatsApp), date
  structurate schema.org (rezultate îmbogățite în Google), duplicate
  title/meta între pagini (verifică și o a doua pagină, nu doar homepage)
- **Tehnic**: HTTPS, viewport mobil, favicon, link-uri interne stricate,
  imagini fără lazy-loading
- **Mobil**: scor Lighthouse (opțional, cu `PAGESPEED_API_KEY`) —
  accesibilitate, best-practices, SEO tehnic, viteză

JSON-ul complet din `output/` conține *toate* problemele găsite (câmpul
`audit_opportunities.candidates`), nu doar cele narate de AI în raport —
util să știi tot ce e de reparat, chiar dacă în prima discuție cu un lead
prezinți doar Top 3.
