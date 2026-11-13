const storageRoot = 'https://pjkcihdiasktmwdpcmpt.supabase.co/storage/v1/object/public/renting-fotos/';
const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif' };

/** Download only public media, never an authenticated page or an arbitrary URL. */
export function imageDownloadUrl(src, origin) {
  const url = new URL(src, origin);
  const local = url.origin === origin && /^\/(?:images|brand|_next\/static\/media)\//.test(url.pathname);
  if (url.username || url.password || (!local && !url.href.startsWith(storageRoot))) {
    throw Error('Esta imagen no tiene una dirección de descarga válida.');
  }
  return url.href;
}

export function imageDownloadName(name, type) {
  const extension = extensions[type.split(';')[0].trim().toLowerCase()];
  if (!extension) throw Error('El archivo recibido no es una imagen compatible.');
  const base = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\.(jpe?g|png|webp|avif|gif)$/i, '')
    .toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100);
  return (base || 'renting-car-aym') + '.' + extension;
}

export async function downloadImage(src, name) {
  const url = imageDownloadUrl(src, window.location.origin);
  const response = await fetch(url, {
    credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer',
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw Error('No se pudo descargar la imagen. Inténtalo nuevamente.');
  const filename = imageDownloadName(name, response.headers.get('content-type') || '');
  const blob = await response.blob();
  if (!blob.size || blob.size > 15 * 1024 * 1024) throw Error('El archivo está vacío o supera los 15 MB.');
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // Give the browser time to begin saving before releasing the blob.
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
}
