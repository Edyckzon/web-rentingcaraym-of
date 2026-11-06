import { edits } from './marketing';
export const business = {
  whatsapp: '51993334984',
  whatsappLabel: '+51 993 334 984',
  phone: edits.phone?.replace(/[^+0-9]/g, "") || '+5114800300',
  phoneLabel: edits.phone || '01 4800-300',
  email: 'rentingcaraym@gmail.com',
  adminEmail: 'administracion@grupoaym.com',
  address: 'Av. Santiago de Surco 3573, Santiago de Surco 15038',
  groupUrl: 'https://grupoaym.com/',
  siteUrl: 'https://rentingcaraym.com',
  wazeUrl: edits.waze || 'https://waze.com/ul?q=Av.%20Santiago%20de%20Surco%203573%2C%20Lima&navigate=yes',
  mapsUrl: edits.maps || 'https://www.google.com/maps/search/?api=1&query=Av.%20Santiago%20de%20Surco%203573%2C%20Santiago%20de%20Surco%2015038',
  mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3900.680174195152!2d-76.99712679999999!3d-12.134021599999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105b808cb930b7f%3A0x1ff6d1a901d043ee!2sAv.%20Santiago%20de%20Surco%203573%2C%20Santiago%20de%20Surco%2015038!5e0!3m2!1ses-419!2spe!4v1790029298492!5m2!1ses-419!2spe',
};
export const whatsappNumber = edits.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '') || business.whatsapp;
export const whatsappLabel = whatsappNumber === business.whatsapp ? business.whatsappLabel : `+${whatsappNumber}`;
export const whatsappLink = (message: string) => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
