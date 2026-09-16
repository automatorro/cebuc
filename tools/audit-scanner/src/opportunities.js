function candidate(category, title, evidenceField, evidenceValue, impact, recommendation, priority) {
  return {
    category,
    title,
    evidence: `${evidenceField}: ${JSON.stringify(evidenceValue)}`,
    impact,
    recommendation,
    priority,
  };
}

export function buildOpportunityCandidates(analysis, scores, pagespeed) {
  const candidates = [];
  const cc = analysis.contact_conversion;
  const ss = analysis.service_structure;
  const ts = analysis.trust_signals;
  const seo = analysis.seo_basics;
  const fi = analysis.first_impression;
  const tech = analysis.technical_signals;
  const links = analysis.broken_links;
  const multiPage = analysis.multi_page;

  if (!cc.phone_clickable) {
    candidates.push(
      candidate(
        "contact_conversie",
        "Telefonul nu este click-to-call",
        "contact_conversion.phone_clickable",
        cc.phone_clickable,
        "Vizitatorii de pe mobil trebuie să copieze manual numărul, ceea ce reduce apelurile directe.",
        "Adaugă link tel: vizibil în header, pe mobil.",
        "mare"
      )
    );
  }

  if (!cc.has_whatsapp) {
    candidates.push(
      candidate(
        "contact_conversie",
        "Nu există opțiune de contact prin WhatsApp",
        "contact_conversion.has_whatsapp",
        cc.has_whatsapp,
        "Se pierd potențiali clienți care preferă mesagerie rapidă în locul unui telefon sau formular.",
        "Adaugă un buton WhatsApp vizibil (wa.me).",
        "medie"
      )
    );
  }

  if (!cc.has_cta) {
    candidates.push(
      candidate(
        "contact_conversie",
        "Nu există un CTA clar de tip 'Cere ofertă'",
        "contact_conversion.has_cta",
        cc.has_cta,
        "Vizitatorul nu este ghidat spre următorul pas, scade rata de conversie în lead.",
        "Adaugă un buton CTA permanent ('Cere ofertă', 'Solicită ofertă').",
        "mare"
      )
    );
  }

  if (cc.has_contact_form && cc.form_fields >= 7) {
    candidates.push(
      candidate(
        "contact_conversie",
        "Formularul de contact are prea multe câmpuri",
        "contact_conversion.form_fields",
        cc.form_fields,
        "Formularele lungi reduc rata de completare.",
        "Simplifică formularul la 3-4 câmpuri esențiale (nume, telefon, mesaj).",
        "medie"
      )
    );
  }

  if (!ss.has_dedicated_service_links) {
    candidates.push(
      candidate(
        "servicii",
        "Serviciile nu au pagini dedicate",
        "service_structure.has_dedicated_service_links",
        ss.has_dedicated_service_links,
        "Fiecare serviciu ratează șansa de a fi găsit separat în căutări specifice, iar mesajul e diluat pe o singură pagină.",
        "Creează o pagină separată, optimizată, pentru fiecare serviciu important.",
        "mare"
      )
    );
  }

  if (!ts.has_portfolio_section) {
    candidates.push(
      candidate(
        "incredere",
        "Nu există secțiune de portofoliu/proiecte",
        "trust_signals.has_portfolio_section",
        ts.has_portfolio_section,
        "Lipsa dovezilor vizuale ale muncii reduce încrederea unui client nou.",
        "Adaugă o secțiune cu proiecte realizate, fotografii înainte/după.",
        "medie"
      )
    );
  }

  if (!ts.has_testimonials) {
    candidates.push(
      candidate(
        "incredere",
        "Nu există testimoniale de la clienți",
        "trust_signals.has_testimonials",
        ts.has_testimonials,
        "Testimonialele sunt un factor de încredere puternic pentru un prospect care nu cunoaște firma.",
        "Adaugă 3-5 testimoniale reale, cu nume și, ideal, fotografie.",
        "medie"
      )
    );
  }

  if (ts.years_experience_mentioned && !ts.has_portfolio_section) {
    candidates.push(
      candidate(
        "incredere",
        "Experiența acumulată nu este evidențiată vizual",
        "trust_signals.years_experience_mentioned",
        ts.years_experience_mentioned,
        "Ani de experiență sunt un argument de vânzare puternic, dar nu sunt puși în valoare pe prima pagină.",
        "Evidențiază anii de experiență într-un loc vizibil (ex. badge sau secțiune 'despre noi').",
        "mica"
      )
    );
  }

  if (!seo.meta_description || seo.meta_description_length === 0) {
    candidates.push(
      candidate(
        "seo",
        "Lipsește meta description",
        "seo_basics.meta_description_length",
        seo.meta_description_length,
        "Google poate genera un fragment de căutare irelevant, reducând rata de click din rezultatele căutării.",
        "Scrie o meta description clară de 120-155 caractere per pagină.",
        "mica"
      )
    );
  }

  if (!seo.sitemap_reachable) {
    candidates.push(
      candidate(
        "seo",
        "Sitemap.xml nu este accesibil",
        "seo_basics.sitemap_reachable",
        seo.sitemap_reachable,
        "Poate încetini indexarea completă a site-ului în Google.",
        "Generează și publică un sitemap.xml valid.",
        "mica"
      )
    );
  }

  if (!fi.h1) {
    candidates.push(
      candidate(
        "prima_impresie",
        "Pagina principală nu are un H1 clar",
        "first_impression.h1",
        fi.h1,
        "Un vizitator (și Google) nu identifică rapid mesajul central al paginii.",
        "Adaugă un H1 care spune clar ce face firma și pentru cine.",
        "medie"
      )
    );
  }

  if (pagespeed && pagespeed.ok && pagespeed.performance_score !== null && pagespeed.performance_score < 60) {
    candidates.push(
      candidate(
        "mobile",
        "Site-ul se încarcă lent pe mobil",
        "pagespeed.performance_score",
        pagespeed.performance_score,
        "Un timp de încărcare mare pe mobil crește șansa ca vizitatorul să abandoneze pagina înainte de a vedea oferta.",
        "Optimizează imaginile și scripturile care încarcă lent pagina pe mobil.",
        "mare"
      )
    );
  }

  if (pagespeed && pagespeed.ok && pagespeed.accessibility_score !== null && pagespeed.accessibility_score < 70) {
    candidates.push(
      candidate(
        "tehnic",
        "Scor de accesibilitate scăzut",
        "pagespeed.accessibility_score",
        pagespeed.accessibility_score,
        "Exclude vizitatori (contrast slab, texte greu de citit) și e un factor minor de clasare în Google.",
        "Verifică raportul Lighthouse și corectează problemele de contrast și etichete lipsă.",
        "medie"
      )
    );
  }

  if (pagespeed && pagespeed.ok && pagespeed.best_practices_score !== null && pagespeed.best_practices_score < 70) {
    candidates.push(
      candidate(
        "tehnic",
        "Probleme tehnice semnalate de Lighthouse (best practices)",
        "pagespeed.best_practices_score",
        pagespeed.best_practices_score,
        "De obicei semnalează cod învechit sau practici nesigure care pot afecta încrederea browserului în site.",
        "Verifică raportul Lighthouse și corectează problemele listate acolo.",
        "mica"
      )
    );
  }

  if (pagespeed && pagespeed.ok && pagespeed.seo_score !== null && pagespeed.seo_score < 80) {
    candidates.push(
      candidate(
        "seo",
        "Lighthouse a semnalat probleme SEO tehnice",
        "pagespeed.seo_score",
        pagespeed.seo_score,
        "Probleme tehnice care pot afecta modul în care Google indexează și afișează paginile în căutări.",
        "Verifică raportul Lighthouse (secțiunea SEO) și corectează problemele listate acolo.",
        "medie"
      )
    );
  }

  if (!tech.is_https) {
    candidates.push(
      candidate(
        "tehnic",
        "Site-ul nu folosește HTTPS",
        "technical_signals.is_https",
        tech.is_https,
        "Browserele afișează avertisment de site nesigur, ceea ce alungă vizitatori, iar Google penalizează site-urile fără HTTPS în clasament.",
        "Activează un certificat SSL (gratuit prin Let's Encrypt sau prin hosting) și redirecționează tot traficul către HTTPS.",
        "mare"
      )
    );
  }

  if (!tech.has_viewport_meta) {
    candidates.push(
      candidate(
        "tehnic",
        "Lipsește meta tag-ul de viewport",
        "technical_signals.has_viewport_meta",
        tech.has_viewport_meta,
        "Fără el, site-ul poate apărea micșorat sau nescalat corect pe telefon — majoritatea vizitatorilor vin de pe mobil.",
        "Adaugă <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> în <head>.",
        "mare"
      )
    );
  }

  if (!tech.has_favicon) {
    candidates.push(
      candidate(
        "tehnic",
        "Lipsește favicon-ul",
        "technical_signals.has_favicon",
        tech.has_favicon,
        "Tab-ul browserului arată o iconiță generică — mic detaliu, dar dă impresia de site neterminat.",
        "Adaugă un favicon (32x32px) în <head>.",
        "mica"
      )
    );
  }

  if (!(tech.has_og_title && tech.has_og_description && tech.has_og_image)) {
    candidates.push(
      candidate(
        "seo",
        "Lipsesc etichetele Open Graph pentru distribuire pe social media",
        "technical_signals.og_tag_count",
        tech.og_tag_count,
        "Când cineva distribuie linkul pe Facebook, Instagram sau WhatsApp, previzualizarea arată generic sau ruptă, ceea ce scade rata de click.",
        "Adaugă og:title, og:description și og:image pentru fiecare pagină importantă.",
        "medie"
      )
    );
  }

  if (!tech.has_structured_data) {
    candidates.push(
      candidate(
        "seo",
        "Lipsesc datele structurate (schema.org)",
        "technical_signals.has_structured_data",
        tech.has_structured_data,
        "Fără ele, Google afișează un link simplu în căutări, în loc de rezultat îmbogățit (rating, program, adresă) — scade rata de click din căutare.",
        "Adaugă date structurate schema.org (LocalBusiness, Organization) pentru firma și serviciile oferite.",
        "medie"
      )
    );
  }

  if (links && links.checked_count > 0 && links.broken_count > 0) {
    candidates.push(
      candidate(
        "tehnic",
        "Există link-uri interne stricate",
        "broken_links.broken_count",
        links.broken_count,
        "Vizitatorul dă peste o pagină de eroare în loc de conținutul căutat — pierde încrederea și de multe ori părăsește site-ul.",
        "Repară sau elimină link-urile stricate găsite: " + links.broken_samples.join(", "),
        "mare"
      )
    );
  }

  if (tech.image_count > 5 && tech.images_without_lazy_loading > 5) {
    candidates.push(
      candidate(
        "tehnic",
        "Imaginile nu se încarcă lazy",
        "technical_signals.images_without_lazy_loading",
        tech.images_without_lazy_loading,
        "Pe o conexiune mobilă mai slabă, toate imaginile se încarcă deodată, ceea ce încetinește vizibil pagina.",
        "Adaugă loading=\"lazy\" la imaginile care nu sunt vizibile imediat la încărcarea paginii.",
        "mica"
      )
    );
  }

  if (multiPage && multiPage.secondary_page_reachable && multiPage.duplicate_title) {
    candidates.push(
      candidate(
        "seo",
        "Titlul paginii se repetă identic pe mai multe pagini",
        "multi_page.duplicate_title",
        multiPage.duplicate_title,
        "Google nu poate distinge paginile între ele, ceea ce le afectează șansele de a apărea separat în căutări.",
        `Scrie un titlu unic pentru fiecare pagină importantă (verificat pe ${multiPage.secondary_page_url}).`,
        "medie"
      )
    );
  }

  if (multiPage && multiPage.secondary_page_reachable && multiPage.duplicate_meta_description) {
    candidates.push(
      candidate(
        "seo",
        "Meta description se repetă identic pe mai multe pagini",
        "multi_page.duplicate_meta_description",
        multiPage.duplicate_meta_description,
        "Fragmentul afișat în Google e identic pentru mai multe pagini, ceea ce reduce șansa de click pentru fiecare în parte.",
        `Scrie o meta description unică pentru fiecare pagină importantă (verificat pe ${multiPage.secondary_page_url}).`,
        "mica"
      )
    );
  }

  if (!seo.has_canonical) {
    candidates.push(
      candidate(
        "seo",
        "Lipsește tag-ul canonical",
        "seo_basics.has_canonical",
        seo.has_canonical,
        "Fără el, Google poate indexa variante duplicate ale aceleiași pagini (cu/fără www, cu/fără slash), diluând autoritatea SEO.",
        "Adaugă <link rel=\"canonical\"> pe fiecare pagină, către URL-ul preferat.",
        "mica"
      )
    );
  }

  if (seo.h1_count > 1) {
    candidates.push(
      candidate(
        "seo",
        "Pagina are mai multe titluri H1",
        "seo_basics.h1_count",
        seo.h1_count,
        "Confuzie pentru Google despre care e subiectul principal al paginii — poate afecta relevanța în căutări.",
        "Păstrează un singur H1 pe pagină, cel mai important mesaj.",
        "mica"
      )
    );
  }

  if (seo.alt_text_coverage_pct !== null && seo.alt_text_coverage_pct < 50) {
    candidates.push(
      candidate(
        "seo",
        "Majoritatea imaginilor nu au text alternativ",
        "seo_basics.alt_text_coverage_pct",
        seo.alt_text_coverage_pct,
        "Reduce accesibilitatea pentru cititoare de ecran și pierde trafic din căutarea de imagini Google.",
        "Adaugă un text alt descriptiv la fiecare imagine relevantă.",
        "mica"
      )
    );
  }

  return candidates;
}
