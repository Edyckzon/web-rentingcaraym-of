'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, ArrowRight, Check, ChevronDown, MapPin, CalendarDays, Users, Gauge, ShieldCheck, Route, Menu, X, MoveDown, CarFront, MessageCircle } from 'lucide-react';
import { fleet, photo, rentalDays, localDate, type Vehicle } from '@/lib/fleet';
import brandLogo from '@/lib/img/RENTING-CAR.png';
import Contact from '@/components/Contact';
import { whatsappNumber } from '@/lib/business';
import { useSectionNavigation } from '@/lib/useSectionNavigation';

export default function Home() {
 useSectionNavigation();
 const [category, setCategory] = useState('Todos');
 const [today, setToday] = useState('');
 const [menu, setMenu] = useState(false);
 const [selected, setSelected] = useState<Vehicle | null>(null);
 const [start, setStart] = useState('');
 const [end, setEnd] = useState('');
 const [location, setLocation] = useState('Surco · Sede principal');
 const [notice, setNotice] = useState('');
 const [copied, setCopied] = useState(false);
 const dialog = useRef<HTMLDialogElement>(null);
 const days = rentalDays(start, end);
 const whatsapp = whatsappNumber;
 const vehicles = fleet.filter(v => category === 'Todos' || v.category === category);

 useEffect(() => {
  setToday(localDate());
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  return () => observer.disconnect();
 }, []);
 useEffect(() => {
  if (selected) { dialog.current?.showModal(); document.body.style.overflow = 'hidden'; }
  else { dialog.current?.close(); document.body.style.overflow = ''; }
  return () => { document.body.style.overflow = ''; };
 }, [selected]);
 function search(event: FormEvent) {
  event.preventDefault();
  if (!days || start < localDate()) { setNotice('Elige una fecha de recojo desde hoy y una devolución posterior.'); return; }
  setNotice(`Tu viaje: ${days} ${days === 1 ? 'día' : 'días'} · ${location}. Elige una categoría para preparar tu cotización. Disponibilidad por confirmar.`);
  document.getElementById('flota')?.scrollIntoView({ behavior: 'smooth' });
 }
 const quote = selected ? `Hola, RentingCar AyM. Quisiera consultar por ${selected.name} (categoría ${selected.category}) en ${location}, del ${start} al ${end}, por ${days} días. Referencia de la demo: S/ ${selected.price * days}. Por favor, confirmen vehículo, tarifa final y disponibilidad.` : '';
 async function copyQuote() { try { await navigator.clipboard.writeText(quote); setCopied(true); } catch { setNotice('No se pudo copiar. Selecciona el resumen de la cotización y cópialo manualmente.'); } }

 return <>
  <a className="skip" href="/flota">Ir al catálogo</a>
  <header className="header">
   <a href="/" className="brand" aria-label="RentingCar AyM, inicio"><img className="brand-logo" src={brandLogo.src} width={brandLogo.width} height={brandLogo.height} alt="Renting Car A&M"/></a>
   <nav className={menu ? 'nav open' : 'nav'} aria-label="Navegación principal">
    {[['Nuestra flota', '/flota'], ['Cómo funciona', '/como-funciona'], ['Por qué AyM', '/nosotros'], ['Contacto', '/contacto']].map(([label, href]) => <a key={href} href={href} onClick={() => setMenu(false)}>{label}</a>)}
   </nav>
   <a className="header-cta" href="/planear">Planea tu viaje <ArrowUpRight size={17}/></a>
   <button className="menu-toggle" aria-label={menu ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
  </header>
  <main>
   <section className="hero" aria-labelledby="hero-title">
    <img className="hero-image" src={photo('photo-1519641471654-76ce0107ad1b', 2200)} alt="SUV blanco en un paisaje de montaña" fetchPriority="high" />
    <div className="hero-shade"/>
    <div className="hero-content container">
     <p className="eyebrow hero-enter"><span className="live-dot"/> EL CAMINO LO ELIGES TÚ</p>
     <h1 id="hero-title" className="hero-enter">Menos rutina.<br/>Más <span>kilómetros.</span></h1>
     <p className="hero-description hero-enter">Sal de lo de siempre. Encuentra el vehículo<br className="desktop-break"/> para tu próxima historia con RentingCar AyM.</p>
     <a className="button accent hero-enter" href="/flota">Encuentra tu vehículo <ArrowUpRight size={20}/></a>
     <div className="hero-foot"><span><Route size={16}/> TU VIAJE. A TU MANERA.</span><a href="/flota">EXPLORA <MoveDown size={17}/></a></div>
    </div>
    <span className="hero-coordinate">PERÚ · INFINITAS RUTAS POR DESCUBRIR</span>
   </section>
   <div className="search-wrap container" id="buscador">
    <form className="search-bar" onSubmit={search}>
     <label><span><MapPin size={15}/> PUNTO DE RECOJO</span><select value={location} onChange={e => setLocation(e.target.value)}><option>Surco · Sede principal</option></select></label>
     <label><span><CalendarDays size={15}/> FECHA DE RECOJO</span><input aria-label="Fecha de recojo" type="date" required min={today} value={start} onChange={e => {setStart(e.target.value); setCopied(false); setNotice('');}}/></label>
     <label><span><CalendarDays size={15}/> FECHA DE DEVOLUCIÓN</span><input aria-label="Fecha de devolución" type="date" required min={start || today} value={end} onChange={e => {setEnd(e.target.value); setCopied(false); setNotice('');}}/></label>
     <button className="button dark" type="submit">Explorar vehículos <ArrowRight size={19}/></button>
    </form>
    <p className="search-note"><ShieldCheck size={14}/> Explora, elige y consulta. La disponibilidad se confirma con un asesor.</p>
   </div>

   <section className="fleet-section container" id="flota">
    <div className="section-heading reveal"><div><p className="eyebrow muted">01 / ENCUENTRA TU COMPAÑERO DE RUTA</p><h2>Un vehículo para<br/><span>cada versión de ti.</span></h2></div><p>Un día de trabajo. Un fin de semana fuera.<br/>Ese viaje que llevas tiempo imaginando.</p></div>
    <div className="fleet-toolbar"><div className="tabs" aria-label="Filtrar por categoría">{['Todos','SUV','Sedán','Pickup'].map(tab => <button key={tab} className={category === tab ? 'tab active' : 'tab'} aria-pressed={category === tab} onClick={() => setCategory(tab)}>{tab === 'Todos' && <CarFront size={16}/>} {tab}</button>)}</div><span className="result-count">{vehicles.length} {vehicles.length === 1 ? 'opción para explorar' : 'opciones para explorar'}</span></div>
    {notice && <p className="notice" role="status">{notice}</p>}
    <div className="vehicle-grid">{vehicles.map((vehicle, index) => <article className="vehicle-card" key={vehicle.id} style={{animationDelay: `${index * 80}ms`}}>
     <button className="vehicle-image" onClick={() => {setSelected(vehicle);setCopied(false);}} aria-label={`Ver detalles de ${vehicle.name}`}><img src={photo(vehicle.image)} alt={`Imagen referencial de categoría ${vehicle.category}`} loading="lazy"/><span className="category-badge">{vehicle.category}</span><span className="image-link"><ArrowUpRight size={21}/></span><span className="photo-label">Imagen referencial</span></button>
     <div className="vehicle-info"><p className="vehicle-tag">{vehicle.tag}</p><h3>{vehicle.name}</h3><div className="specs"><span><Users size={15}/>{vehicle.seats} personas</span><span><Gauge size={15}/>{vehicle.transmission}</span></div><div className="vehicle-bottom"><p><strong>S/ {vehicle.price}</strong><span> / día</span></p><button onClick={() => {setSelected(vehicle);setCopied(false);}}>Ver vehículo <ArrowUpRight size={17}/></button></div></div>
    </article>)}</div>
    <p className="demo-note">CATÁLOGO DEMO · Vehículos, fotos y tarifas referenciales. No representan inventario ni ofertas confirmadas.</p>
   </section>

   <section className="experience" id="nosotros"><div className="experience-photo"><img src={photo('photo-1500534623283-312aade485b7', 1300)} loading="lazy" alt="Paisaje verde y montañas para una escapada"/><span className="photo-caption">HAZ ESPACIO PARA LO INESPERADO. <ArrowUpRight size={24}/></span></div><div className="experience-copy reveal"><p className="eyebrow">NO SOLO SE TRATA DE LLEGAR</p><h2>Lo mejor del viaje<br/>empieza cuando<br/><em>tomas el volante.</em></h2><p>Hay planes que merecen salir del chat. En AyM queremos acompañarte a convertirlos en kilómetros, paisajes y buenos recuerdos.</p><a href="/planear" className="text-link">Empieza a planearlo <ArrowUpRight size={21}/></a><div className="experience-stamp"><Route size={26}/><span>MÁS LIBERTAD.<br/>MÁS HISTORIAS.</span></div></div></section>

   <section className="steps container" id="como-funciona"><div className="section-heading reveal"><div><p className="eyebrow muted">02 / ASÍ DE SIMPLE</p><h2>Tu próxima ruta,<br/><span>a tres pasos.</span></h2></div><a href="/flota" className="text-link">Empezar ahora <ArrowUpRight size={18}/></a></div><div className="steps-grid">{[{n:'01',title:'Encuentra tu match',text:'Explora las categorías y elige el vehículo que encaja con tu plan.',icon:<CarFront/>},{n:'02',title:'Cuéntanos tu plan',text:'Selecciona tus fechas y prepara una consulta con los detalles de tu viaje.',icon:<CalendarDays/>},{n:'03',title:'Confirma y sal a la ruta',text:'Coordina con un asesor la disponibilidad, las condiciones y el recojo.',icon:<Route/>}].map(step => <div className="step reveal" key={step.n}><div><span>{step.n}</span>{step.icon}</div><h3>{step.title}</h3><p>{step.text}</p></div>)}</div></section>
   <section className="faq container"><p className="eyebrow muted">ANTES DE ARRANCAR</p><h2>Despejemos el camino.</h2>{[{q:'¿Cómo solicito una cotización?',a:'Elige una categoría, ingresa tus fechas y abre la ficha del vehículo. Envía tu consulta por WhatsApp al +51 993 334 984. Nuestro equipo confirmará disponibilidad y condiciones contigo.'},{q:'¿El precio que veo es el precio final?',a:'Esta es una versión de demostración. Las tarifas son referenciales; un asesor deberá confirmar precio final, garantías, coberturas y disponibilidad antes de cualquier reserva.'},{q:'¿Qué necesito para alquilar?',a:'Los requisitos de edad, documentos, licencia y garantía deben confirmarse con AyM según el vehículo y las condiciones del servicio. No se confirma ninguna reserva desde esta demo.'}].map(item => <details key={item.q}><summary>{item.q}<ChevronDown size={20}/></summary><p>{item.a}</p></details>)}</section>
   <Contact/>
   <section className="closing"><div className="container"><p className="eyebrow">EL PRÓXIMO DESTINO LO PONES TÚ</p><h2>¿Y si nos vamos?</h2><a href="/flota" className="button dark">Encuentra tu vehículo <ArrowUpRight size={21}/></a><span className="closing-route" aria-hidden="true">↗</span></div></section>
  </main>
  <footer className="footer container"><a className="brand footer-brand" href="/" aria-label="RentingCar AyM, volver al inicio"><img className="brand-logo" src={brandLogo.src} width={brandLogo.width} height={brandLogo.height} alt="Renting Car A&M"/></a><span>Hecho para seguir tu camino.</span><p>© {new Date().getFullYear()} RentingCar AyM · Versión de demostración</p></footer>

  <dialog ref={dialog} className="vehicle-dialog" onCancel={() => setSelected(null)} onClick={event => { if(event.target === event.currentTarget) setSelected(null); }} aria-labelledby="dialog-title">
   {selected && <><button className="dialog-close" autoFocus aria-label="Cerrar detalle" onClick={() => setSelected(null)}><X/></button><img className="dialog-image" src={photo(selected.image)} alt={`Imagen referencial de ${selected.category}`}/><div className="dialog-content"><p className="eyebrow muted">{selected.category} · MODELO DEMO</p><h2 id="dialog-title">{selected.name}</h2><p>{selected.description}</p><div className="specs"><span><Users size={16}/>{selected.seats} personas</span><span><Gauge size={16}/>{selected.transmission}</span></div><form onSubmit={e => e.preventDefault()}><div className="dialog-dates"><label>Recojo<input type="date" aria-label="Recojo para cotización" min={today} value={start} onChange={e => {setStart(e.target.value);setCopied(false);}}/></label><label>Devolución<input type="date" aria-label="Devolución para cotización" min={start || today} value={end} onChange={e => {setEnd(e.target.value);setCopied(false);}}/></label></div><div className="quote-total"><span>{days ? `${days} días × S/ ${selected.price}` : 'Tarifa referencial por día'}</span><strong>S/ {days ? days * selected.price : selected.price}</strong></div><p className="quote-disclaimer">Referencia de demostración. No incluye cargos adicionales por confirmar ni constituye una reserva.</p>{days > 0 && start >= localDate() ? <><p className="quote-summary">{quote}</p>{whatsapp ? <a className="button accent full" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(quote)}`}><MessageCircle size={18}/>Consultar por WhatsApp</a> : <><button className="button dark full" type="button" onClick={copyQuote}>{copied ? <Check size={18}/> : <MessageCircle size={18}/>} {copied ? 'Consulta copiada' : 'Copiar consulta'}</button><p className="quote-disclaimer" role="status">{copied ? 'Consulta lista para compartir con un asesor.' : 'El canal de WhatsApp estará disponible próximamente.'}</p></>}</> : <p className="date-hint" role="status">Elige fechas desde hoy, con devolución posterior al recojo.</p>}</form></div></>}
  </dialog>
 </>;
}
