export type TechnicalSheet = {
  version: string;
  /** Año y transmisión de la flota, confirmados por A&M. */
  year?: number;
  transmission?: string;
  publisher: string;
  source: string;
  fields: Record<string, string>;
};

// Published versions for Peru, not the specifications of a particular rental unit.
export const technicalSheets: Partial<Record<string, TechnicalSheet>> = {
  'ford-territory': {
    year: 2026, transmission: 'Automática',
    version: 'Territory 1.5 EcoBoost AT · acabado por confirmar', publisher: 'Ford Perú',
    source: 'https://www.ford.pe/content/dam/Ford/website-assets/latam/pe/nameplate/territory/2025/pdf/fpe-territory-ficha-tecnica.pdf',
    fields: {
      'Motor': '1.5 L EcoBoost',
      'Potencia': '158 hp a 5700 rpm',
      'Torque': '248 Nm a 3500 rpm',
      'Transmisión': 'Automática de doble embrague, 7 velocidades',
    },
  },
  'changan-x7-plus': {
    year: 2026, transmission: 'Automática',
    version: 'X7 Plus 1.5 Turbo AT · acabado por confirmar', publisher: 'Changan Perú',
    source: 'https://www.changan.com.pe/noticia/tecnologia-avanzada-en-suv-para-7-pasajeros/',
    fields: {
      'Motor': '1.5 L turbo, 1494 cm³',
      'Potencia': 'Hasta 185 hp',
      'Torque': '300 Nm',
      'Transmisión': 'Automática DCT de 7 velocidades',
      'Plazas': '7 en tres filas',
    },
  },
  'changan-cx70': {
    version: 'Basic 1.6 MT', publisher: 'Changan / Derco (ficha en Pandero Perú)',
    source: 'https://www.pandero.com.pe/wp-content/uploads/2019/10/CX70-Basic.pdf',
    fields: {
      'Motor': '1.6 L DOHC, 1584 cm³',
      'Potencia': '115 hp a 6000 rpm',
      'Torque': '150 Nm entre 3500 y 4500 rpm',
      'Transmisión': 'Manual de 5 velocidades',
      'Plazas': '7',
    },
  },
  'jetur-x70': {
    version: 'X70 1.5 Turbo · gama 2025', publisher: 'Jetour Perú',
    source: 'https://www.jetour.com.pe/blog/modelos-jetour-2025-lo-nuevo-de-la-marca-de-carros-chinos-mas-prometedora',
    fields: {
      'Motor': '1.5 L turbo',
      'Potencia': '145 hp',
      'Transmisión': 'Manual o automática, según versión',
      'Tracción': 'Delantera',
      'Plazas': '7 en tres filas',
    },
  },
  'glory-580': {
    version: 'New Glory 580 Comfort 1.5T MT', publisher: 'DFSK Perú',
    source: 'https://www.dfsk.com.pe/dfsk/site/docs/20190411/20190411154409/580_glory_ft__1_.pdf',
    fields: {
      'Motor': '1.5 L turbo, 1499 cm³',
      'Potencia': '143 hp a 5600 rpm',
      'Torque': '220 Nm entre 2000 y 4000 rpm',
      'Transmisión': 'Manual de 6 velocidades',
    },
  },
  'glory-560': {
    version: 'Glory 560 1.8 L', publisher: 'DFSK Perú',
    source: 'https://dev.dfsk.com.pe/media/ogipgjak/ft_560glory__actualizada_.pdf',
    fields: {
      'Motor': '1.8 L a gasolina, 1798 cm³',
      'Potencia': '138 hp a 6000 rpm',
      'Torque': '187 Nm entre 3600 y 4400 rpm',
      'Plazas': '5',
      'Tanque': '58 L',
    },
  },
  'jac-s8': {
    year: 2023, transmission: 'Automática',
    version: 'JS8 1.5 TGDI 6DCT · acabado por confirmar', publisher: 'JAC Perú',
    source: 'https://www.jac.pe/media/xxrfc353/2023-07-19-ficha-te-cnica-js8_compressed.pdf',
    fields: {
      'Motor': '1.5 L turbo con inyección directa',
      'Potencia': '172 hp a 5500 rpm',
      'Torque': '288 Nm entre 1800 y 3500 rpm',
      'Transmisión': 'Automática DCT de 6 velocidades',
      'Plazas': '7 en tres filas',
    },
  },
  'toyota-yaris': {
    version: 'Yaris sedán GLI 1.3 CVT', publisher: 'Toyota Perú',
    source: 'https://www.toyotaperu.com.pe/comparador/generarpdf?modelo=38&version=133',
    fields: {
      'Motor': '1.3 L Dual VVT-i, 1329 cm³',
      'Potencia': '93,8 hp a 6000 rpm',
      'Torque': '12,2 kgf·m a 4200 rpm',
      'Transmisión': 'CVT con 7 relaciones simuladas',
    },
  },
  'hyundai-verna': {
    year: 2022, transmission: 'Automática y mecánica',
    version: 'Verna 1.4 MPI · AT y MT', publisher: 'Hyundai Perú',
    source: 'https://hyundai.pe/wp-content/uploads/2020/04/hyundai-verna.pdf',
    fields: {
      'Motor': '1.4 L MPI, 1368 cm³',
      'Potencia': '95 hp a 6000 rpm',
      'Torque': '13,5 kgf·m a 4000 rpm',
      'Transmisión': 'Automática de 4 o mecánica de 5 velocidades',
    },
  },
  'hyundai-accent': {
    version: 'Accent MT Comfort Plus', publisher: 'Hyundai Perú',
    source: 'https://hyundai.pe/wp-content/uploads/2025/06/FT-ACCENT-Jun2025-v1.pdf',
    fields: {
      'Motor': '1.5 L MPI a gasolina, 1497 cm³',
      'Potencia': '113 hp a 6300 rpm',
      'Torque': '14,7 kgf·m a 4500 rpm',
      'Transmisión': 'Manual de 6 velocidades',
      'Maletero': '528 L',
    },
  },
  'changan-alsvin': {
    year: 2022, transmission: 'Mecánica',
    version: 'Alsvin 1.4 MT · acabado por confirmar', publisher: 'Changan Perú',
    source: 'https://www.changan.com.pe/media/wfpkut52/ficha-te-cnica-new-alsvin.pdf',
    fields: {
      'Motor': '1.4 L DOHC VVT, 1370 cm³',
      'Potencia': '93 hp a 6000 rpm',
      'Transmisión': 'Manual de 5 velocidades',
      'Cilindros': '4, con 16 válvulas',
    },
  },
  'suzuki-ertiga': {
    year: 2020, transmission: 'Automática',
    version: 'Ertiga 1.5 AT · acabado por confirmar', publisher: 'Suzuki Perú',
    source: 'https://d1extt4q0kbmr.cloudfront.net/wp-content/uploads/2019/10/New-Ertiga-1.pdf',
    fields: {
      'Motor': '1.5 L K15B, 1462 cm³',
      'Potencia': '103 hp a 6000 rpm',
      'Torque': '138 Nm a 4400 rpm',
      'Transmisión': 'Automática de 4 velocidades',
      'Tracción': 'Delantera',
    },
  },
};
