export type ResourceCategory =
  | "fundamentos"
  | "modelos"
  | "herramientas"
  | "proyectos";

export type ResourceLevel = "Básico" | "Intermedio" | "Avanzado";
export type ResourceLanguage = "ES" | "EN";
export type ResourceKind = "Curso" | "Guía" | "Libro" | "Práctica";

export interface ResourceItem {
  id: string;
  title: string;
  description: string;
  url: string;
  category: ResourceCategory;
  level: ResourceLevel;
  language: ResourceLanguage;
  kind: ResourceKind;
  certificate?: boolean;
  featured: boolean;
}

export const resourceCategoryLabels: Record<ResourceCategory, string> = {
  fundamentos: "Fundamentos",
  modelos: "Modelos y LLMs",
  herramientas: "Herramientas de IA",
  proyectos: "Proyectos reales",
};

export const resourceCategoryOrder: ResourceCategory[] = [
  "fundamentos",
  "modelos",
  "herramientas",
  "proyectos",
];

export const resources: ResourceItem[] = [
  {
    id: "ai-capabilities-limitations",
    title: "AI Capabilities and Limitations",
    description: "Una introducción breve y práctica a cómo funciona la IA. Incluye certificado de Anthropic.",
    url: "https://anthropic.skilljar.com/ai-capabilities-and-limitations",
    category: "fundamentos",
    level: "Básico",
    language: "EN",
    kind: "Curso",
    certificate: true,
    featured: false,
  },
  {
    id: "google-ml-crash-course",
    title: "Machine Learning Crash Course",
    description: "Conceptos esenciales de machine learning con ejercicios prácticos y explicaciones visuales.",
    url: "https://developers.google.com/machine-learning/crash-course?hl=es-419",
    category: "fundamentos",
    level: "Básico",
    language: "ES",
    kind: "Curso",
    featured: true,
  },
  {
    id: "kaggle-learn",
    title: "Kaggle Learn",
    description: "Microcursos para practicar Python, datos y machine learning en notebooks interactivos.",
    url: "https://www.kaggle.com/learn",
    category: "fundamentos",
    level: "Básico",
    language: "EN",
    kind: "Práctica",
    certificate: true,
    featured: false,
  },
  {
    id: "claude-101",
    title: "Claude 101",
    description: "Primeros pasos y ejercicios para usar Claude en tareas cotidianas. Incluye certificado de Anthropic.",
    url: "https://anthropic.skilljar.com/claude-101",
    category: "herramientas",
    level: "Básico",
    language: "EN",
    kind: "Curso",
    certificate: true,
    featured: true,
  },
  {
    id: "hugging-face-llm-course",
    title: "Hugging Face LLM Course",
    description: "Transformers, datasets y modelos de lenguaje con teoría y práctica en español.",
    url: "https://huggingface.co/learn/llm-course/es/chapter0/1",
    category: "modelos",
    level: "Intermedio",
    language: "ES",
    kind: "Curso",
    featured: true,
  },
  {
    id: "openai-prompt-engineering",
    title: "OpenAI Prompt Engineering",
    description: "Patrones y técnicas oficiales para obtener resultados más confiables con modelos de OpenAI.",
    url: "https://developers.openai.com/api/docs/guides/prompt-engineering",
    category: "herramientas",
    level: "Intermedio",
    language: "EN",
    kind: "Guía",
    featured: false,
  },
  {
    id: "anthropic-ai-fluency",
    title: "AI Fluency: Framework & Foundations",
    description: "Un curso práctico de poco más de una hora para colaborar mejor con IA. Incluye certificado.",
    url: "https://anthropic.skilljar.com/ai-fluency-framework-foundations",
    category: "herramientas",
    level: "Básico",
    language: "EN",
    kind: "Curso",
    certificate: true,
    featured: false,
  },
  {
    id: "github-skills",
    title: "GitHub Skills",
    description: "Ejercicios guiados dentro de GitHub para dominar sus flujos de trabajo principales.",
    url: "https://skills.github.com/",
    category: "proyectos",
    level: "Básico",
    language: "EN",
    kind: "Práctica",
    featured: true,
  },
  {
    id: "ibm-ai-literacy",
    title: "Alfabetización en IA de IBM",
    description: "Fundamentos de IA en cuatro horas y en español. Entrega una credencial digital para compartir.",
    url: "https://skillsbuild.org/college-students/course-catalog/ai-literacy",
    category: "fundamentos",
    level: "Básico",
    language: "ES",
    kind: "Curso",
    certificate: true,
    featured: false,
  },
];

export const featuredResources = resourceCategoryOrder.map((category) => {
  const resource = resources.find((item) => item.category === category && item.featured);
  if (!resource) throw new Error(`Missing featured resource for ${category}`);
  return resource;
});
