// Recognize the campaign before and after the admin imports it into Storage.
// Other photos selected in the admin keep their own URL and proportions.
const previousCover = 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/8a37378a9258429c0a30973e07554a1e3bc0b01ff03025fbc5607f74f0ca9eff.webp';
const importedCover = 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/cd516ed409d3b85cf33bb181d41f4ce7166b17a452e58fa70c695cd3d2ec78cc.webp';
export const limaCover = '/images/portada-lima/portada-lima.webp';

export function resolveHomeCover(src: string, alt = 'Portada de Renting Car A&M') {
  if (src !== previousCover && src !== limaCover && src !== importedCover) {
    return { src, alt, width: 1600, height: 900, mobile: undefined, original: undefined };
  }
  return {
    src: limaCover,
    alt: 'SUV rojo y asesora de Renting Car A&M junto al malecón de Lima. Movilidad que no te detiene.',
    width: 1672,
    height: 941,
    original: '/images/portada-lima/portada-lima-original.png',
    mobile: { src: '/images/portada-lima/portada-lima-mobile.webp', width: 900, height: 1125, original: '/images/portada-lima/portada-lima-mobile-original.png' },
  };
}
