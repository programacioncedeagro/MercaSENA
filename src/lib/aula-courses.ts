export interface AulaCourse {
  id: string;
  title: string;
  hours: number;
  description?: string;
}

export const AULA_COURSES: AulaCourse[] = [
  { id: 'c1', title: 'Preparacion de soluciones nutritivas para fertirriego', hours: 48, description: 'Formulación y manejo de soluciones nutritivas para sistemas de fertirriego en cultivos de hortalizas y frutales.' },
  { id: 'c2', title: 'Aplicacion de herramientas informaticas a la gestion del predio rural agropecuario', hours: 96, description: 'Uso de herramientas digitales para registro de labores, trazabilidad y gestión económica del predio.' },
  { id: 'c3', title: 'Sistemas de informacion geograficos aplicados a la agricultura de precision', hours: 40, description: 'Introducción a SIG: recolección de datos, interpretación de mapas y toma de decisiones agronómicas.' },
  { id: 'c4', title: 'Basico en agricultura ecologica', hours: 40, description: 'Principios de la agricultura ecológica, manejo de suelos y prácticas sostenibles para pequeños productores.' },
  { id: 'c5', title: 'Implementacion de procesos para la transicion agroecologica', hours: 48, description: 'Metodologías para la transición desde sistemas convencionales hacia sistemas agroecológicos.' },
  { id: 'c6', title: 'Manejo agronomico del cultivo de aguacate Hass', hours: 96, description: 'Prácticas de siembra, nutrición, sanidad y cosecha específicas para aguacate Hass.' },
  { id: 'c7', title: 'Costos de produccion aplicados a negocios rurales', hours: 48, description: 'Cálculo de costos, análisis de rentabilidad y estrategias para mejorar márgenes en unidades productivas.' },
  { id: 'c8', title: 'Aplicacion de las buenas practicas agricolas', hours: 96, description: 'Buenas prácticas en manejo agrícola para mejorar calidad, inocuidad y rendimiento.' },
  { id: 'c9', title: 'Elaboracion de biopreparados liquidos', hours: 48, description: 'Técnicas para preparar biofertilizantes y biocontroladores líquidos con recursos locales.' },
  { id: 'c10', title: 'Agricultura ecologica: fertilizacion, suelos y cultivos', hours: 40, description: 'Manejo de fertilidad y prácticas de conservación de suelos en sistemas ecológicos.' },
  { id: 'c11', title: 'Analisis fisico de suelos', hours: 60, description: 'Laboratorio y campo: texturas, estructura, y manejo para mejorar la productividad.' },
  { id: 'c12', title: 'Manejo de la nutricion en cultivos agricolas', hours: 60, description: 'Diagnóstico de nutrimentos, enmiendas y estrategias de fertilización eficiente.' },
  { id: 'c13', title: 'Manejo racional de plaguicidas', hours: 48, description: 'Uso seguro y responsable de plaguicidas, manejo integrado de plagas (MIP) y alternativas biológicas.' },
  { id: 'c14', title: 'Muestreo de suelos agricolas', hours: 48, description: 'Diseño de muestreos y toma de muestras representativas para análisis de suelos.' },
  { id: 'c15', title: 'Poda de especies vegetales', hours: 48, description: 'Técnicas de poda para frutales y otros cultivos orientadas a producción y salud vegetal.' },
  { id: 'c16', title: 'Fortalecimiento en el manejo agronomico del cultivo de aguacate', hours: 96, description: 'Módulo avanzado sobre riego, nutrición y control fitosanitario del cultivo de aguacate.' },
  { id: 'c17', title: 'Sistemas de informacion geografica aplicados a la agricultura', hours: 48, description: 'Herramientas prácticas de SIG para monitoreo y planeación de cultivos.' },
  { id: 'c18', title: 'Elaboracion de biocontroladores para cultivos agricolas', hours: 48, description: 'Producción y aplicación de agentes biológicos para control de plagas y enfermedades.' },
  { id: 'c19', title: 'Preparacion de suelos para siembra y manejo', hours: 48, description: 'Prácticas de preparación del terreno, camas y conservación para siembras eficientes.' },
  { id: 'c20', title: 'Manejo agroecologico de suelos', hours: 48, description: 'Estrategias agroecológicas para recuperar y mantener la salud del suelo a nivel de finca.' },
];

export default AULA_COURSES;
