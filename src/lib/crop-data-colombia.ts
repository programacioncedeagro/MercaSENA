/**
 * Datos realistas de cultivos agrícolas y producción pecuaria en Colombia
 * Basado en datos del ICA, MADR, DANE y FENALCE
 */

export interface CropCycleData {
  name: string;
  category: 'agricola' | 'pecuario';
  duration: number; // días
  phases: {
    preparation: number; // días
    planting: number; // días
    maintenance: number; // días
    harvest: number; // días
    postharvest: number; // días
  };
  costs: {
    perHectare: number; // COP por hectárea
    materials: number; // % del costo total
    labor: number; // % del costo total
    machinery: number; // % del costo total
  };
  yield: {
    min: number; // toneladas por hectárea
    average: number;
    max: number;
  };
  prices: {
    farm: number; // COP por kg en finca
    market: number; // COP por kg en mercado
  };
  seasons: {
    planting: string[];
    harvest: string[];
  };
  regions: string[];
  climate: {
    temperature: string;
    rainfall: string;
    altitude: string;
  };
}

export const COLOMBIA_CROP_DATA: Record<string, CropCycleData> = {
  // CEREALES
  'maiz': {
    name: 'Maíz',
    category: 'agricola',
    duration: 120,
    phases: {
      preparation: 15,
      planting: 5,
      maintenance: 80,
      harvest: 15,
      postharvest: 5
    },
    costs: {
      perHectare: 4500000,
      materials: 45, // semilla, fertilizantes, agroquímicos
      labor: 35,
      machinery: 20
    },
    yield: {
      min: 4,
      average: 6.5,
      max: 10
    },
    prices: {
      farm: 1200,
      market: 1800
    },
    seasons: {
      planting: ['marzo-abril', 'agosto-septiembre'],
      harvest: ['julio-agosto', 'diciembre-enero']
    },
    regions: ['Valle del Cauca', 'Córdoba', 'Tolima', 'Meta'],
    climate: {
      temperature: '20-30°C',
      rainfall: '800-1200mm',
      altitude: '0-1800 msnm'
    }
  },

  'arroz': {
    name: 'Arroz',
    category: 'agricola',
    duration: 125,
    phases: {
      preparation: 20,
      planting: 3,
      maintenance: 90,
      harvest: 10,
      postharvest: 2
    },
    costs: {
      perHectare: 5200000,
      materials: 50,
      labor: 30,
      machinery: 20
    },
    yield: {
      min: 5,
      average: 7.8,
      max: 12
    },
    prices: {
      farm: 1400,
      market: 2200
    },
    seasons: {
      planting: ['marzo-mayo', 'agosto-octubre'],
      harvest: ['julio-septiembre', 'diciembre-febrero']
    },
    regions: ['Tolima', 'Huila', 'Casanare', 'Meta'],
    climate: {
      temperature: '22-32°C',
      rainfall: '1200-2000mm',
      altitude: '0-1500 msnm'
    }
  },

  // HORTALIZAS
  'tomate': {
    name: 'Tomate',
    category: 'agricola',
    duration: 150,
    phases: {
      preparation: 20,
      planting: 5,
      maintenance: 110,
      harvest: 30,
      postharvest: 5
    },
    costs: {
      perHectare: 12000000,
      materials: 55,
      labor: 35,
      machinery: 10
    },
    yield: {
      min: 40,
      average: 65,
      max: 100
    },
    prices: {
      farm: 2800,
      market: 4500
    },
    seasons: {
      planting: ['febrero-marzo', 'julio-agosto'],
      harvest: ['mayo-septiembre', 'noviembre-enero']
    },
    regions: ['Boyacá', 'Norte de Santander', 'Cundinamarca', 'Antioquia'],
    climate: {
      temperature: '18-25°C',
      rainfall: '600-1000mm',
      altitude: '1800-2600 msnm'
    }
  },

  'lechuga': {
    name: 'Lechuga',
    category: 'agricola',
    duration: 75,
    phases: {
      preparation: 10,
      planting: 3,
      maintenance: 50,
      harvest: 10,
      postharvest: 2
    },
    costs: {
      perHectare: 8500000,
      materials: 40,
      labor: 45,
      machinery: 15
    },
    yield: {
      min: 15,
      average: 25,
      max: 35
    },
    prices: {
      farm: 3200,
      market: 5000
    },
    seasons: {
      planting: ['todo el año'],
      harvest: ['todo el año']
    },
    regions: ['Cundinamarca', 'Boyacá', 'Nariño', 'Antioquia'],
    climate: {
      temperature: '15-20°C',
      rainfall: '600-800mm',
      altitude: '2000-3000 msnm'
    }
  },

  // TUBÉRCULOS
  'papa': {
    name: 'Papa',
    category: 'agricola',
    duration: 180,
    phases: {
      preparation: 25,
      planting: 5,
      maintenance: 120,
      harvest: 25,
      postharvest: 5
    },
    costs: {
      perHectare: 15000000,
      materials: 60,
      labor: 30,
      machinery: 10
    },
    yield: {
      min: 15,
      average: 22,
      max: 35
    },
    prices: {
      farm: 1800,
      market: 2800
    },
    seasons: {
      planting: ['febrero-abril', 'agosto-octubre'],
      harvest: ['junio-octubre', 'enero-abril']
    },
    regions: ['Boyacá', 'Cundinamarca', 'Nariño', 'Antioquia'],
    climate: {
      temperature: '8-20°C',
      rainfall: '600-1200mm',
      altitude: '2000-3500 msnm'
    }
  },

  // PERMANENTES
  'cafe': {
    name: 'Café',
    category: 'agricola',
    duration: 1095, // 3 años hasta primera cosecha
    phases: {
      preparation: 90,
      planting: 30,
      maintenance: 900,
      harvest: 60,
      postharvest: 15
    },
    costs: {
      perHectare: 8000000, // costo anual después del establecimiento
      materials: 40,
      labor: 50,
      machinery: 10
    },
    yield: {
      min: 1.2, // carga/hectárea
      average: 1.8,
      max: 3.0
    },
    prices: {
      farm: 6800, // por kg café pergamino seco
      market: 12000 // café tostado
    },
    seasons: {
      planting: ['marzo-mayo', 'septiembre-noviembre'],
      harvest: ['marzo-junio', 'septiembre-enero']
    },
    regions: ['Huila', 'Nariño', 'Cauca', 'Tolima', 'Quindío', 'Caldas', 'Risaralda'],
    climate: {
      temperature: '17-23°C',
      rainfall: '1200-1800mm',
      altitude: '1200-2000 msnm'
    }
  },

  // FRUTAS
  'aguacate': {
    name: 'Aguacate',
    category: 'agricola',
    duration: 1460, // 4 años hasta producción comercial
    phases: {
      preparation: 60,
      planting: 30,
      maintenance: 1300,
      harvest: 60,
      postharvest: 10
    },
    costs: {
      perHectare: 12000000, // costo anual después del establecimiento
      materials: 35,
      labor: 45,
      machinery: 20
    },
    yield: {
      min: 8,
      average: 15,
      max: 25
    },
    prices: {
      farm: 4500,
      market: 7000
    },
    seasons: {
      planting: ['marzo-mayo', 'septiembre-noviembre'],
      harvest: ['todo el año según variedad']
    },
    regions: ['Antioquia', 'Tolima', 'Caldas', 'Valle del Cauca'],
    climate: {
      temperature: '18-28°C',
      rainfall: '1000-1500mm',
      altitude: '800-2500 msnm'
    }
  },

  // PECUARIOS
  'pollo_engorde': {
    name: 'Pollo de Engorde',
    category: 'pecuario',
    duration: 42,
    phases: {
      preparation: 3,
      planting: 1, // ingreso de pollitos
      maintenance: 35,
      harvest: 2,
      postharvest: 1
    },
    costs: {
      perHectare: 45000000, // por galpón de 10,000 pollos
      materials: 75, // concentrado principalmente
      labor: 20,
      machinery: 5
    },
    yield: {
      min: 2.1, // kg peso vivo por pollo
      average: 2.4,
      max: 2.8
    },
    prices: {
      farm: 5200, // por kg peso vivo
      market: 8500 // por kg beneficiado
    },
    seasons: {
      planting: ['todo el año'],
      harvest: ['todo el año']
    },
    regions: ['Valle del Cauca', 'Cundinamarca', 'Santander', 'Antioquia'],
    climate: {
      temperature: '20-25°C',
      rainfall: 'controlado',
      altitude: '0-2600 msnm'
    }
  },

  'cerdo_ceba': {
    name: 'Cerdo de Ceba',
    category: 'pecuario',
    duration: 150,
    phases: {
      preparation: 7,
      planting: 1, // ingreso de lechones
      maintenance: 135,
      harvest: 5,
      postharvest: 2
    },
    costs: {
      perHectare: 35000000, // por 500 cerdos
      materials: 70,
      labor: 25,
      machinery: 5
    },
    yield: {
      min: 90, // kg peso vivo
      average: 105,
      max: 120
    },
    prices: {
      farm: 6800,
      market: 12000
    },
    seasons: {
      planting: ['todo el año'],
      harvest: ['todo el año']
    },
    regions: ['Antioquia', 'Valle del Cauca', 'Cundinamarca', 'Córdoba'],
    climate: {
      temperature: '18-25°C',
      rainfall: 'controlado',
      altitude: '0-2000 msnm'
    }
  }
};

// Función para obtener datos realistas de un cultivo
export function getCropData(cropName: string): CropCycleData | null {
  const normalizedName = cropName.toLowerCase()
    .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
    .replace(/ó/g, 'o').replace(/ú/g, 'u').replace(/ñ/g, 'n');
  
  // Buscar coincidencias exactas o parciales
  for (const [key, data] of Object.entries(COLOMBIA_CROP_DATA)) {
    if (key === normalizedName || 
        data.name.toLowerCase().includes(normalizedName) ||
        normalizedName.includes(key)) {
      return data;
    }
  }
  
  return null;
}

// Función para obtener costos realistas por hectárea
export function getRealisticCosts(cropName: string, area: number): {
  totalCost: number;
  breakdown: {
    materials: number;
    labor: number;
    machinery: number;
  };
} {
  const cropData = getCropData(cropName);
  
  if (!cropData) {
    // Valores por defecto conservadores
    const defaultCost = 6000000 * area;
    return {
      totalCost: defaultCost,
      breakdown: {
        materials: defaultCost * 0.45,
        labor: defaultCost * 0.35,
        machinery: defaultCost * 0.20
      }
    };
  }
  
  const totalCost = cropData.costs.perHectare * area;
  return {
    totalCost,
    breakdown: {
      materials: totalCost * (cropData.costs.materials / 100),
      labor: totalCost * (cropData.costs.labor / 100),
      machinery: totalCost * (cropData.costs.machinery / 100)
    }
  };
}

// Función para obtener rendimientos esperados
export function getExpectedYield(cropName: string, area: number): {
  minYield: number;
  averageYield: number;
  maxYield: number;
  unit: string;
} {
  const cropData = getCropData(cropName);
  
  if (!cropData) {
    return {
      minYield: area * 5,
      averageYield: area * 8,
      maxYield: area * 12,
      unit: 'toneladas'
    };
  }
  
  return {
    minYield: cropData.yield.min * area,
    averageYield: cropData.yield.average * area,
    maxYield: cropData.yield.max * area,
    unit: cropData.category === 'pecuario' ? 'kg por animal' : 'toneladas'
  };
}

// Función para obtener precios actuales del mercado
export function getCurrentMarketPrices(cropName: string): {
  farmPrice: number;
  marketPrice: number;
  currency: string;
} {
  const cropData = getCropData(cropName);
  
  if (!cropData) {
    return {
      farmPrice: 2500,
      marketPrice: 4000,
      currency: 'COP/kg'
    };
  }
  
  return {
    farmPrice: cropData.prices.farm,
    marketPrice: cropData.prices.market,
    currency: 'COP/kg'
  };
}