// Fuentes de las reglas, tal como están citadas en docs/FUENTES.md. Si una
// regla no tiene fuente ahí, usa null (pendiente de validar), nunca una nueva.
import type { Source } from "@/domain/finding";

export const SOURCES = {
  plews2012: {
    name: "Plews et al. 2012",
    url: "https://pubmed.ncbi.nlm.nih.gov/22367011/",
  },
  plews2014: {
    name: "Plews et al. 2014",
    url: "https://doi.org/10.1123/ijspp.2013-0455",
  },
  news2: {
    name: "NEWS2 (Royal College of Physicians)",
    url: "https://www.rcp.ac.uk/media/alxev00t/news2-chart-1_the-news-scoring-system_0_0.pdf",
  },
  news2Response: {
    name: "Respuesta clínica NEWS2",
    url: "https://www.rcp.ac.uk/media/mrllczrj/news2-chart-4_clinical-response-to-news-trigger-thresholds_0.pdf",
  },
  bts2017: {
    name: "BTS 2017",
    url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5531304/",
  },
  aasm2015: {
    name: "AASM/SRS 2015",
    url: "https://www.aasm.org/resources/pdf/adultsleepdurationconsensus.pdf",
  },
  nhsRepeat: {
    name: "NHS",
    url: "https://www.northyorkshireccg.nhs.uk/wp-content/uploads/2020/12/Annex-3-Patient-Information-V1.1-HHR.pdf",
  },
  ochmoCo2: {
    name: "OCHMO-TB-004",
    url: "https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-004-carbon-dioxide.pdf",
  },
  ochmoRadiation: {
    name: "OCHMO, radiación",
    url: "https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf",
  },
  ochmoExercise: {
    name: "OCHMO-TB-031",
    url: "https://www.nasa.gov/wp-content/uploads/2023/12/ochmo-tb-031-exercise-overview.pdf",
  },
} satisfies Record<string, Source>;
