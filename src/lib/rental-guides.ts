export const rentalGuides = [
  {
    slug: 'requisitos-alquilar-auto-lima',
    title: 'Requisitos para alquilar un auto en Lima',
    description: 'Qué documentos, fechas y condiciones conviene revisar antes de cotizar el alquiler de un auto en Lima.',
    published: false,
    sections: [
      { title: 'Documentos y fechas', body: 'Antes de cotizar, defina las fechas, las horas de recojo y devolución y el lugar de entrega. Revise que el conductor tenga su identificación y licencia vigentes. Si el vehículo se usará fuera de Lima o tendrá más de un conductor, comparta esos datos para confirmar las condiciones del alquiler.' },
      { title: 'Tarifa, garantía y devolución', body: 'Solicite el detalle de la tarifa, el kilometraje incluido y la garantía. Pregunte por coberturas, exclusiones, combustible y devolución. La garantía se informa por separado. La cotización sirve para comparar opciones y coordinar la disponibilidad con el equipo.' },
    ],
    links: [
      { path: '/requisitos/', label: 'Revisar requisitos de alquiler' },
      { path: '/flota/', label: 'Explorar vehículos' },
    ],
  },
  {
    slug: 'glp-o-gasolina',
    title: 'GLP o gasolina para su alquiler',
    description: 'Compare el recorrido, los puntos de recarga y las condiciones de entrega al elegir un auto a GLP o gasolina.',
    published: false,
    sections: [
      { title: 'Compare según su recorrido', body: 'El tipo de combustible que le conviene depende del recorrido, de los puntos de recarga cercanos y de la unidad que elija. Compare el gasto estimado según la distancia, el consumo de la unidad y el precio disponible en su ruta. Los valores pueden variar según la conducción, la carga y el tráfico.' },
      { title: 'Consulte antes del recojo', body: 'En una unidad bicombustible, pida al equipo que explique el funcionamiento antes de salir. Confirme el nivel de combustible de entrega y cómo debe devolver el vehículo. En el catálogo puede filtrar los modelos GLP y revisar las características confirmadas de cada unidad.' },
    ],
    links: [{ path: '/alquiler-de-autos-glp/', label: 'Ver autos a GLP' }],
  },
  {
    slug: 'elegir-pickup-4x4-para-viajar',
    title: 'Cómo elegir una pickup 4x4 para un viaje',
    description: 'Qué consultar sobre tracción, equipaje, kilometraje y cobertura al cotizar una pickup 4x4 para viajar.',
    published: false,
    sections: [
      { title: 'Itinerario, pasajeros y carga', body: 'Comparta su itinerario, el estado previsto de las vías, la cantidad de pasajeros y las dimensiones y el peso del equipaje o de la carga. Además de la tracción, conviene revisar el espacio disponible, las restricciones de uso y el kilometraje del alquiler.' },
      { title: 'Confirme las condiciones de la ruta', body: 'Antes de contratar, confirme por escrito qué recorridos están permitidos, cómo se coordina la asistencia y qué condiciones de cobertura aplican. Indique las fechas y el lugar de devolución para que el equipo confirme si hay una unidad adecuada para su ruta.' },
    ],
    links: [{ path: '/flota/pickup-4x4/', label: 'Consultar pickups 4x4' }],
  },
];

export const publishedRentalGuides = rentalGuides.filter(guide => guide.published);

export function visibleRentalGuides() {
  return process.env.NODE_ENV === 'development' ? rentalGuides : publishedRentalGuides;
}
