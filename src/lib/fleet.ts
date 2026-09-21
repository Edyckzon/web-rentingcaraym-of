export type Vehicle = { id: string; name: string; category: 'SUV' | 'Sedán' | 'Pickup'; tag: string; price: number; seats: number; transmission: string; image: string; description: string };
export const fleet: Vehicle[] = [
 { id: 'suv', name: 'SUV Explorer', category: 'SUV', tag: 'Espacio para más planes', price: 220, seats: 5, transmission: 'Automática', image: 'photo-1519641471654-76ce0107ad1b', description: 'Comodidad y espacio para compartir el camino. Una opción versátil para escapadas y viajes en familia.' },
 { id: 'sedan', name: 'Sedán Urban', category: 'Sedán', tag: 'La ciudad es tuya', price: 140, seats: 5, transmission: 'Automática', image: 'photo-1555215695-3004980ad54e', description: 'Diseñado para moverte a tu ritmo. Una propuesta de categoría sedán para tus recorridos urbanos.' },
 { id: 'pickup', name: 'Pickup Adventure', category: 'Pickup', tag: 'Ve un poco más lejos', price: 280, seats: 5, transmission: 'Manual', image: 'photo-1551830820-330a71b99659', description: 'Más espacio para el equipaje y los grandes planes. Consulta las rutas y usos permitidos antes de viajar.' }
];
export const photo = (id: string, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
export function rentalDays(start: string, end: string) { if (!start || !end) return 0; const days = (Date.parse(end + 'T00:00:00Z') - Date.parse(start + 'T00:00:00Z')) / 86400000; return Number.isFinite(days) && days > 0 ? days : 0; }
export function localDate() { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`; }
