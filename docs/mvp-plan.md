# Cebuc Digital Opportunity Scanner — Plan MVP (v2)

## Obiectiv

Scop unic: introduc domeniul unei firme → sistemul analizează automat site-ul →
identifică problemele care afectează clienții/leads → generează un audit
comercial clar → eu îl verific în 2-3 minute → contactez firma pentru a
prezenta oportunități de îmbunătățire comercială.

Mesajul pe care trebuie să-l primească lead-ul este comercial ("iată ce
pierzi în clienți"), nu tehnic ("iată ce e greșit în cod"). Scorul și
raportul sunt instrumente de deschidere a conversației, nu produsul final.

Nu construim în această fază: CRM, automatizări (email/WhatsApp automate),
generare automată de oferte, dashboard-uri elaborate, portal client,
abonamente, chatbot, aplicație mobilă, scraping agresiv, monitorizare
lunară, integrare cu 20 de API-uri. Toate pot veni ulterior, dacă auditul
generează efectiv conversații și clienți.

## 1. Fluxul MVP

```
[Introduc domeniul]
        ↓
[Analiză automată site]
        ↓
[Date brute (JSON)]
        ↓
[Reguli + scoring simplu]
        ↓
[AI interpretează — strict pe baza JSON-ului]
        ↓
[Top 3-5 oportunități]
        ↓
[Raport audit]
        ↓
[Eu verific 2-3 minute]
        ↓
[Contactez firma]
```

## 2. Ce introduc eu (formular)

| Câmp | Exemplu |
|---|---|
| Website | firma.ro |
| Domeniu de activitate | Construcții |
| Localitate | Timișoara |
| Serviciu principal | Renovări fațade |

Ultimele trei câmpuri sunt esențiale ca AI-ul să nu judece site-ul în
abstract, fără context de industrie/localitate.

## 3. Ce verifică automat MVP-ul

Nu verificăm 100 de lucruri. Ne concentrăm pe ce afectează direct
conversia unui vizitator în lead.

### A. Prima impresie

Extragem: title, H1, text principal, servicii, telefon, email, CTA-uri,
meniu, informații despre firmă.

Întrebarea la care răspundem: *"Înțelege un vizitator în 5 secunde ce
face firma și ce trebuie să facă mai departe?"*

### B. Contact / conversie

Verificăm automat: telefon prezent, `tel:` link, poziție (header/footer),
formular de contact și câmpurile lui, email, WhatsApp, CTA-uri ("Cere
ofertă", "Solicită ofertă", "Programează"), numărul de clickuri necesare
pentru a ajunge la contact.

Exemplu de output: *"Conversie: 4/10 — Telefonul există, dar utilizatorul
trebuie să intre pe pagina Contact. Nu există CTA permanent și nu există
WhatsApp."*

### C. Mobile & viteză

Folosim Lighthouse/PageSpeed pentru: Performance, Accessibility, Best
Practices, SEO, Core Web Vitals (mobile/desktop). Acesta e un modul
**opțional/izolat** în pipeline — dacă API-ul PageSpeed pică sau atinge
rate-limit, restul analizei tot produce rezultat; nu blocăm întregul audit
pe o dependență externă cu cote.

Traducem tehnicul în comercial. Nu arătăm clientului:

> ❌ "LCP = 4,2 secunde."

Ci:

> Site-ul se încarcă lent pe telefon. Pentru un utilizator care intră de pe
> mobil, primele elemente importante apar cu întârziere — asta poate crește
> șansa ca vizitatorul să abandoneze pagina.

### D. SEO de bază

Verificăm: `<title>`, meta description, H1/H2, sitemap, robots.txt,
canonical, indexability, alt text imagini, existența paginilor importante,
linkuri interne, broken links.

Nu construim un sistem SEO complet. Întrebarea: *"Poate Google să înțeleagă
corect ce face firma și ce servicii oferă?"*

### E. Structura serviciilor

Identificăm dacă firma are structură clară (Acasă / Servicii → subpagini /
Despre noi / Proiecte / Contact) sau dacă totul e înghesuit într-o singură
pagină.

Exemplu: *"Firma oferă hidroizolații, termoizolații și renovări fațade, dar
site-ul prezintă toate serviciile într-un singur bloc de text."* →
oportunitate comercială: fiecare serviciu ar putea avea propria pagină
optimizată pentru căutarea respectivă.

### F. Încredere

Verificăm existența: proiecte/portofoliu, fotografii, testimoniale,
clienți, certificări, ani de experiență, garanții, echipă, adresă, date
firmă.

Exemplu: *"Firma are 15 ani de activitate, dar site-ul nu evidențiază
această informație în zona principală."* — mult mai valoros comercial decât
"lipsește schema.org".

### G. Google Business — automat, nu manual

Folosim Google Places API (sau echivalent) pentru a extrage automat:
existența profilului, număr aproximativ de review-uri, rating, fotografii,
website, telefon, categorie, data ultimei actualizări.

**Diferență față de planul inițial:** nu introducem un pas manual de
verificare în fluxul de audit. Dacă automatizarea nu poate fi făcută rapid
și robust în MVP, această secțiune se **exclude complet din v1** în loc să
fie făcută manual — un pas manual într-un flux altfel automat introduce
fricțiune și inconsistență între audituri, și nu se scalează la testarea pe
20-30 de firme.

## 4. Scoring — simplificat pentru v1

Nu construim un motor de scoring cu 10 categorii ponderate în această
fază. Nu avem încă date reale ca să calibrăm ponderi corect, și oricum
scorul nu este produsul principal — este.

**Pentru v1:**
- Fiecare categorie (Prima impresie, Mobile, Contact & conversie, Servicii,
  Încredere, SEO) primește un scor simplu (ex: 0-10) pe baza unor reguli
  clare și verificabile (prezent/absent, câte elemente, etc.).
- Scorul total afișat este informativ (medie simplă sau afișare pe
  categorii, fără ponderi elaborate), nu un KPI de vândut.
- Ponderile și un eventual scor unic "oficial" se calibrează **abia după
  etapa de testare pe 20-30 firme reale** (secțiunea 8, etapa 7), când
  avem date pentru a decide ce cântărește cu adevărat în decizia de
  contactare a unui lead.

## 5. Regula esențială: oportunități, nu probleme

Sistemul poate găsi 15-20 de probleme mici. Raportul nu le prezintă pe
toate. Selectează **TOP 3 oportunități**, prioritizate după impact comercial.

Exemplu:

**1. Contact dificil — PRIORITATE MARE**
Un client care vrea o ofertă trebuie să caute informația de contact.
Telefonul nu este suficient de vizibil pe mobil.
Recomandare: CTA "Cere ofertă", telefon click-to-call, WhatsApp, formular
simplificat.

**2. Serviciile nu sunt suficient de clare — PRIORITATE MARE**
Firma oferă 6 servicii, prezentate într-o singură secțiune.
Recomandare: pagină separată per serviciu important, CTA per serviciu.

**3. Lipsă dovezi concrete — PRIORITATE MEDIE**
Site-ul afirmă experiență și profesionalism, dar prezintă puține proiecte
reale.
Recomandare: portofoliu, fotografii înainte/după, proiecte cu descriere,
testimoniale.

## 6. Rolul AI-ului

AI-ul **nu face măsurători**. Asta e esențial.

```
Codul  = măsoară (extrage date obiective)
Regulile = punctează (transformă date în scoruri simple)
AI     = interpretează (transformă scoruri în narativă comercială)
```

Codul produce un JSON de tipul:

```json
{
  "mobile_score": 62,
  "performance_score": 58,
  "has_phone": true,
  "phone_clickable": false,
  "has_whatsapp": false,
  "has_contact_form": true,
  "form_fields": 9,
  "has_portfolio": false,
  "has_testimonials": false
}
```

AI-ul primește exact acest JSON și răspunde la: *"Care sunt cele mai
importante 3 probleme din perspectiva unui potențial client și ce impact
comercial pot avea?"*

### Guardrail obligatoriu împotriva halucinației

"Nu inventa informații" ca instrucțiune în prompt nu e suficient — modelele
pot halucina detalii specifice plauzibile (ex: afirmă "site-ul menționează
15 ani de experiență" când nu există acest text nicăieri în date). Pentru
v1:

- Promptul obligă AI-ul să citeze **doar câmpuri existente în JSON**, nu să
  genereze evidență din text liber sau presupuneri.
- Fiecare afirmație din raport trebuie legată explicit de un câmp/valoare
  din JSON-ul de intrare (ex: `has_portfolio: false` → "nu am identificat
  proiecte/portofoliu pe site").
- O afirmație falsă în raport despre site-ul propriu al clientului este un
  risc comercial direct — clientul o poate contrazice instant și pierdem
  credibilitate în prima interacțiune. Acest guardrail nu este opțional.

### Prompt AI (conceptual)

```
Ești consultant în digitalizare pentru IMM-uri.

Analizează STRICT datele din JSON-ul primit. Nu adăuga informații
care nu sunt prezente în date.

Nu considera orice problemă tehnică drept importantă comercial.

Identifică maximum 5 probleme.

Prioritizează problemele care pot afecta:
1. obținerea de clienți
2. cererile de ofertă
3. încrederea
4. găsirea firmei
5. experiența pe mobil

Pentru fiecare problemă furnizează:
- problema
- dovada (câmpul/valoarea exactă din JSON care susține afirmația)
- impactul comercial
- recomandarea
- prioritatea

La final selectează TOP 3 oportunități.
```

## 7. Structură tehnică

```
Frontend (React)
   ↓
Supabase
   ↓
Edge Function / backend
   ↓
Website Analyzer
   ├── HTML parser
   ├── Lighthouse/PageSpeed  (modul opțional, poate pica fără să blocheze restul)
   ├── link checker
   ├── SEO checks
   └── contact/CTA detection
   ↓
Rule Engine (scoring simplu per categorie)
   ↓
AI (interpretare, citare strictă din JSON)
   ↓
Audit JSON
   ↓
Frontend
```

## 8. Bază de date

Schema minimă, dar flexibilă — evităm coloane fixe care obligă la migrare
de fiecare dată când adăugăm o verificare nouă.

```
audits
  id
  website
  company_name
  industry
  city
  main_service
  status
  created_at
  overall_score        -- informativ, nu KPI oficial în v1

audit_metrics
  audit_id
  raw_data   JSONB      -- toate metricile brute (has_phone, has_whatsapp,
                         -- form_fields, has_portfolio, performance_score, ...)
  -- eventual câteva coloane extrase separat DOAR pentru cele pe care
  -- filtrăm/sortăm frecvent (ex: overall_score, mobile_score) — restul
  -- rămâne în raw_data ca să nu migrăm schema la fiecare verificare nouă

audit_opportunities
  id
  audit_id
  category
  title
  evidence          -- referință explicită la câmpul din raw_data
  impact
  recommendation
  priority
  score
```

## 9. Interfața MVP

Fără dashboard complicat — 3 ecrane.

**Ecran 1 — Input**
```
CEBUC DIGITAL OPPORTUNITY SCANNER

Website:        [________________________]
Domeniu:        [ Construcții ▼ ]
Localitate:     [ Timișoara ]
Serviciu principal: [ Renovări fațade ]

        [ ANALIZEAZĂ ]
```

**Ecran 2 — Progres**
```
ANALIZĂ ÎN CURS...

✓ Website accesibil
✓ Structură analizată
✓ Mobile analizat
✓ SEO analizat
✓ Contact analizat
✓ Conversie analizată
✓ Oportunități identificate

████████████████░░ 82%
```

**Ecran 3 — Rezultat**
```
DIGITAL OPPORTUNITY REPORT

firma.ro

Prima impresie       7/10
Mobile               6/10
Conversie            4/10
Servicii             5/10
Încredere            6/10
SEO                  7/10

TOP 3 OPORTUNITĂȚI

01  Contact dificil                        PRIORITATE MARE
02  Servicii insuficient prezentate        PRIORITATE MARE
03  Lipsă dovezi / portofoliu              PRIORITATE MEDIE

[ Vezi analiza completă ]
```

## 10. Raportul de vânzare (export PDF)

Structură pe 5 pagini, fără preț, fără ofertă agresivă:

1. Audit digital — firma X, scoruri pe categorii (fără scor unic "oficial"
   ponderat în v1).
2. Ce funcționează bine (2-3 lucruri).
3. Top 3 oportunități — cele mai importante.
4. Analiză detaliată — mobile, conversie, SEO, încredere etc.
5. Ce aș îmbunătăți — ton consultativ: *"Acestea sunt cele mai importante
   îmbunătățiri pe care le-aș prioritiza."*

## 11. Ce NU construim în MVP

CRM, automatizare email, WhatsApp automat, generare automată de oferte,
scraping agresiv, monitorizare lunară, abonamente, portal client, 100 de
criterii SEO, integrare cu 20 API-uri, AI chatbot, aplicație mobilă,
verificare manuală Google Business.

Toate pot veni ulterior, dacă auditul generează efectiv conversații și
clienți.

## 12. Ordinea de dezvoltare

1. **Analyzer** — website → date brute (JSON).
2. **Rules** — date brute → scoruri simple per categorie.
3. **Opportunities** — scoruri → probleme prioritizate.
4. **AI** — probleme → explicație comercială (cu guardrail de citare
   strictă din date).
5. **UI** — rezultat → raport vizual.
6. **PDF** — raport → document utilizabil în vânzare.
7. **Testare reală** — 20-30 de firme reale, pentru a vedea ce probleme se
   detectează bine, ce e irelevant, ce formulări generează discuții, ce
   oportunități duc efectiv la întâlniri. **Abia aici** se calibrează
   ponderile de scoring și se decide dacă/cum se automatizează Google
   Business.

## Primul milestone tehnic

Nu începem cu AI. Începem cu **Website Analyzer**.

> Introduc firma.ro și primesc un JSON complet cu toate datele obiective
> necesare ulterior pentru scoring.

După ce acesta funcționează robust (inclusiv cazul în care modulul
PageSpeed pică), construim peste el restul MVP-ului.
