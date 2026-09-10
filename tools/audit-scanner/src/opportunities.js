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

  return candidates;
}
