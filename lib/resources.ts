export interface ResourceCategory {
  category: string;
  title: string;
  description: string;
  count: string;
}

export const resourceCategories: ResourceCategory[] = [
  {
    category: "Fundamentos",
    title: "Programación para IA",
    description:
      "Diagramas, estructuras de datos, algoritmos y todo lo que debería haberse enseñado en primer año.",
    count: "0 recursos",
  },
  {
    category: "Tools IA",
    title: "IA como tu compañera",
    description:
      "Todo para potenciar tu aprendizaje y tu laburo",
    count: "0 recursos",
  },
  {
    category: "Proyectos",
    title: "Gestión y mejora continua",
    description:
      "Como llevar adelante un proyecto, gestionar el trabajo en equipo, y llevarlo a producción sin morir en el intento",
    count: "0 recursos",
  },
  {
    category: "Comunidad",
    title: "Grabaciones de talleres",
    description:
      "Todo lo que pasó en nuestros eventos",
    count: "0 recursos",
  },
];
