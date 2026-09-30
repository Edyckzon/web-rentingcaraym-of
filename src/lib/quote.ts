export const serviceOptions = [
  { value: 'vehiculos', label: 'Alquiler de auto o camioneta' },
  { value: 'excavadora-cat-330dl', label: 'Excavadora CAT 330DL' },
  { value: 'volquetes', label: 'Volquete' },
  { value: 'transporte-de-carga', label: 'Transporte de carga' },
  { value: 'otro', label: 'Otro' },
] as const;
export type ServiceId = (typeof serviceOptions)[number]['value'];

export function todayInLima() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  return ['year', 'month', 'day'].map(type => parts.find(part => part.type === type)?.value).join('-');
}

export function buildQuote(data: FormData): string {
  const get = (name: string) => String(data.get(name) || '').trim();
  const service = serviceOptions.find(option => option.value === get('service'));
  if (!service) throw new Error('Seleccione un tipo de servicio.');
  if (!get('name') || !get('location') || !get('duration')) throw new Error('Complete su nombre, ubicación y duración.');
  const digits = get('phone').replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) throw new Error('Ingrese un teléfono válido, con código de país si corresponde.');
  if (get('ruc') && !/^\d{11}$/.test(get('ruc'))) throw new Error('El RUC debe tener 11 dígitos.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(get('start')) || get('start') < todayInLima()) throw new Error('Seleccione una fecha de inicio desde hoy.');
  if (service.value === 'transporte-de-carga' && !get('destination')) throw new Error('Indique el destino de la carga.');
  if (data.get('consent') !== 'on') throw new Error('Autorice el uso de sus datos para atender esta solicitud.');
  const date = get('start').split('-').reverse().join('/');
  return [
    'Hola, Renting Car A&M. Deseo una cotización.',
    `Servicio: ${service.label}`,
    get('model') && service.value === 'vehiculos' ? `Modelo: ${get('model')}` : '',
    `Nombre: ${get('name')}`,
    get('company') ? `Empresa: ${get('company')}` : '',
    get('ruc') ? `RUC: ${get('ruc')}` : '',
    `Teléfono: ${get('phone')}`,
    get('email') ? `Correo: ${get('email')}` : '',
    `Fecha de inicio: ${date}`,
    `Duración estimada: ${get('duration')}`,
    `${service.value === 'transporte-de-carga' ? 'Origen' : 'Lugar de recojo u obra'}: ${get('location')}`,
    service.value === 'transporte-de-carga' ? `Destino: ${get('destination')}` : '',
    get('message') ? `Detalles: ${get('message')}` : '',
    'Autorizo el uso de estos datos para atender mi solicitud de cotización.',
    'Por favor, confirmen disponibilidad, tarifa y condiciones del servicio.',
  ].filter(Boolean).join('\n');
}
