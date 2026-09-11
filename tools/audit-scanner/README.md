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

1. **Adaugă cheia ca secret**, pe GitHub: în repo → **Settings** →
   **Secrets and variables** → **Codespaces** → **New repository secret** →
   nume `ANTHROPIC_API_KEY`, valoare cheia ta. (Opțional, la fel, și
   `PAGESPEED_API_KEY`.) Cheia nu ajunge niciodată în cod sau în chat.
2. Pe pagina principală a repo-ului → butonul verde **Code** → tab
   **Codespaces** → **Create codespace on main**.
3. Așteaptă să se pornească (instalează automat dependențele).
4. În terminalul din browser, rulează:
   ```bash
   cd tools/audit-scanner
   npm run serve
   ```
5. Codespace-ul va detecta portul 4173 și va oferi un buton/notificare
   **Open in Browser** — apasă-l ca să vezi interfața. Accesul e privat,
   vizibil doar pentru tine (proprietarul repo-ului).

## Interfață vizuală (recomandat)

```bash
npm run serve
```

Deschide [http://localhost:4173](http://localhost:4173) în browser. Interfața
are două ecrane: formular pentru un audit nou (cu progres live) și un
istoric al audit-urilor deja generate. Serverul este legat doar pe
`127.0.0.1` — nu este accesibil din rețea.

## Linie de comandă (alternativ)

```bash
node audit.js --url firma.ro --industry "Construcții" --city "Timișoara" --service "Renovări fațade"
```

Rezultatul (JSON + Markdown) apare în `output/`, indiferent de metoda folosită.

## Verificare anti-halucinare

Fiecare oportunitate din raport are un câmp `evidence`/"Dovadă" care trebuie
să corespundă exact unei observații reale de pe site. Verifică manual cel
puțin primele câteva rapoarte, ca să confirmi că AI-ul nu inventează nimic.
