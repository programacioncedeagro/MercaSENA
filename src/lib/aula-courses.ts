export interface AulaCourse {
  id: string;
  title: string;
  hours: number;
  description?: string;
  instructor?: string;
  area?: string; // área de desempeño
}

export const AULA_COURSES: AulaCourse[] = [
  { id: 'c1', title: 'Preparacion de soluciones nutritivas para fertirriego', hours: 48, description: 'Formulación y manejo de soluciones nutritivas para sistemas de fertirriego en cultivos de hortalizas y frutales.', instructor: 'Ing. Laura Pérez', area: 'Hortofrutícola' },
  { id: 'c3', title: 'Sistemas de informacion geograficos aplicados a la agricultura de precision', hours: 40, description: 'Introducción a SIG: recolección de datos, interpretación de mapas y toma de decisiones agronómicas.', instructor: 'Técnico Javier Ruiz', area: 'SIG / Agricultura de precisión' },
  { id: 'c4', title: 'Basico en agricultura ecologica', hours: 40, description: 'Principios de la agricultura ecológica, manejo de suelos y prácticas sostenibles para pequeños productores.', instructor: 'Ing. Ana Ramírez', area: 'Agroecología' },
  { id: 'c5', title: 'Implementacion de procesos para la transicion agroecologica', hours: 48, description: 'Metodologías para la transición desde sistemas convencionales hacia sistemas agroecológicos.', instructor: 'Ing. Ana Ramírez', area: 'Agroecología' },
  { id: 'c7', title: 'Costos de produccion aplicados a negocios rurales', hours: 48, description: 'Cálculo de costos, análisis de rentabilidad y estrategias para mejorar márgenes en unidades productivas.', instructor: 'Economista María López', area: 'Economía rural' },
  { id: 'c9', title: 'Elaboracion de biopreparados liquidos', hours: 48, description: 'Técnicas para preparar biofertilizantes y biocontroladores líquidos con recursos locales.', instructor: 'Técnico Miguel Torres', area: 'Producción de insumos' },
  { id: 'c10', title: 'Agricultura ecologica: fertilizacion, suelos y cultivos', hours: 40, description: 'Manejo de fertilidad y prácticas de conservación de suelos en sistemas ecológicos.', instructor: 'Ing. Laura Pérez', area: 'Agroecología' },
  { id: 'c13', title: 'Manejo racional de plaguicidas', hours: 48, description: 'Uso seguro y responsable de plaguicidas, manejo integrado de plagas (MIP) y alternativas biológicas.', instructor: 'Ing. Diana Castillo', area: 'Protección de cultivos' },
  { id: 'c15', title: 'Poda de especies vegetales', hours: 48, description: 'Técnicas de poda para frutales y otros cultivos orientadas a producción y salud vegetal.', instructor: 'Técnico Andrés Vargas', area: 'Fruticultura' },
  { id: 'c17', title: 'Sistemas de informacion geografica aplicados a la agricultura', hours: 48, description: 'Herramientas prácticas de SIG para monitoreo y planeación de cultivos.', instructor: 'Técnico Javier Ruiz', area: 'SIG / Agricultura de precisión' },
  { id: 'c18', title: 'Elaboracion de biocontroladores para cultivos agricolas', hours: 48, description: 'Producción y aplicación de agentes biológicos para control de plagas y enfermedades.', instructor: 'Técnico Miguel Torres', area: 'Producción de insumos' },
  { id: 'c20', title: 'Manejo agroecologico de suelos', hours: 48, description: 'Estrategias agroecológicas para recuperar y mantener la salud del suelo a nivel de finca.', instructor: 'Ing. Ana Ramírez', area: 'Agroecología' },
];

export default AULA_COURSES;
