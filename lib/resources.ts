export interface ResourceCategory {
  category: string;
  title: string;
  description: string;
}

export const resourceCategories: ResourceCategory[] = [
  {
    category: "Fundamentos",
    title: "Programación para IA",
    description:
      "Diagramas, estructuras de datos, algoritmos y todo lo que debería haberse enseñado en primer año.",
  },
  {
    category: "Tools IA",
    title: "IA como tu compañera",
    description:
      "Prompts, workflows y herramientas para potenciar tu aprendizaje y tu laburo del día a día.",
  },
  {
    category: "Proyectos",
    title: "Gestión y mejora continua",
    description:
      "Scrum, dailies, code review y deploy sin sorpresas en producción.",
  },
  {
    category: "Comunidad",
    title: "Grabaciones de talleres",
    description:
      "Todo lo que pasó en nuestros eventos, disponible para revisitar cuando lo necesites.",
  },
];
