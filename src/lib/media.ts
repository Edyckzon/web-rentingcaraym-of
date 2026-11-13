export type CatalogImage = { src: string; alt: string; reference?: boolean; credit?: string | null; sourceUrl?: string | null; license?: string | null; licenseUrl?: string | null };

// Fotografías temporales autorizadas para la revisión. Sustituir por imágenes reales
// de A&M y quitar reference solo cuando la foto corresponda a la unidad anunciada.
export const referenceImages: Record<'suv' | 'sedan' | 'excavator' | 'truck' | 'volquete', CatalogImage> = {
  suv: { src: 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/8a37378a9258429c0a30973e07554a1e3bc0b01ff03025fbc5607f74f0ca9eff.webp', alt: 'Fotografía referencial de una SUV; no corresponde a la unidad ofrecida', reference: true, credit: 'Unsplash' },
  sedan: { src: '/images/sedan.webp', alt: 'Fotografía referencial de un sedán; no corresponde a la unidad ofrecida', reference: true, credit: 'Unsplash' },
  excavator: { src: '/images/excavator.webp', alt: 'Fotografía referencial de maquinaria en obra; no corresponde al equipo ofrecido', reference: true, credit: 'Unsplash' },
  truck: { src: '/images/truck.webp', alt: 'Fotografía referencial de transporte de carga; no corresponde a la unidad ofrecida', reference: true, credit: 'Unsplash' },
  volquete: { src: '/images/volquete.webp', alt: 'Fotografía referencial de un volquete en obra; no corresponde a la unidad ofrecida', reference: true, credit: 'Corey Willett / Unsplash' },
};
