# Renting Car A&M

Web estática de vehículos, maquinaria y transporte de carga, con Next.js, React y TypeScript. Exporta HTML a `out/`; no necesita servidor de aplicación, base de datos ni credenciales.

## Desarrollo y comprobación

Requiere Node.js 22+ y pnpm 11.19.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm typecheck
pnpm build
pnpm preview
```

Abrir http://localhost:3000. `preview` sirve la compilación de `out/`; volver a compilar tras editar. Si Node del sistema es anterior a 22, usar un runtime compatible.

## Páginas

Inicio, catálogo con filtros y 12 fichas de modelos, maquinaria y transporte con 3 fichas de servicio, nosotros, contacto y cómo trabajamos. Se conserva `/planear/` como entrada a la cotización. También hay páginas informativas de privacidad, condiciones, reclamaciones y continuidad de solicitud, más sitemap XML y robots.

## Cotizaciones: siempre estáticas

El formulario prepara un mensaje en el navegador, valida los campos y permite revisarlo o copiarlo. El cliente debe abrir WhatsApp y enviar el mensaje allí. No hay envío automático de correo, registro de reservas, pagos ni confirmación ficticia de recepción. Los enlaces de correo usan `mailto:` y requieren una aplicación de correo del visitante. El formulario no persiste datos personales ni usa almacenamiento local.

## Contenido y fotos

- `src/lib/fleet.ts`: modelos, categorías, imágenes por vehículo y campos opcionales de especificaciones y tarifa aprobada.
- `src/lib/technicalSheets.ts`: referencias técnicas de versiones comerciales de Perú, con fuente y versión identificadas. Se muestran en la vista rápida y en la ficha. No certifican la configuración de la unidad alquilada.
- `src/lib/services.ts`: equipos, servicios y datos necesarios para cotizarlos.
- `src/lib/media.ts`: fotos temporales centralizadas; `reference: true` muestra el aviso de fotografía referencial.
- `public/images/`: fotografías WebP servidas localmente.
- `src/lib/business.ts`: WhatsApp, central, correos, dirección y mapas.
- `src/lib/quote.ts`: validación y construcción del mensaje.
- `src/lib/seo.ts`: metadatos por página.
- `src/app/globals.css`: paleta, tipografía y adaptación a pantallas.

Para reemplazar fotos, guardar el archivo real optimizado en `public/images/` y asignar `{ src: '/images/unidad.webp', alt: 'Descripción real', reference: false }` en las imágenes del modelo o equipo correspondiente. Pueden añadirse más imágenes para la galería. No marcar una foto genérica como real. Para incorporar unidades, agregar un modelo con un `id` único sin tildes: la ficha y el sitemap se generan al compilar.

En `models` de `fleet.ts`, el orden del arreglo `images` de cada vehículo define su portada y miniaturas. Con una sola foto se puede ampliar; con dos o más aparecen flechas y miniaturas, y se puede deslizar en móvil. Los identificadores históricos `jac-s8` y `jetur-x70` conservan sus URL; los nombres visibles son JAC JS8 y Jetour X70.

El WhatsApp confirmado es **+51 993 334 984**. `.env.example` documenta `NEXT_PUBLIC_WHATSAPP_NUMBER`; un cambio requiere recompilar. El número mostrado y todos los enlaces usan la misma configuración. Se conservan los correos existentes hasta confirmar que la nueva casilla comercial está activa.

## Pendientes del PDF antes de publicación

- Fotos reales, características de las unidades, capacidades, tarifas, modalidades, coberturas, seguros y requisitos comerciales aprobados.
- Historia, cifras de experiencia, razón social/RUC, horarios, misión/visión, equipo y testimonios autorizados. No se inventaron estos datos ni se publicaron bloques vacíos.
- Confirmación de `rentals@rentingcaraym.com`; por ahora se mantiene `rentingcaraym@gmail.com` y administración sin tilde.
- Política de privacidad completa y términos de alquiler aprobados. Las páginas actuales describen el funcionamiento y explicitan lo pendiente; están marcadas `noindex`.
- Libro de Reclamaciones real o enlace a un proveedor externo autorizado: la página actual informa que no hay registro habilitado y no simula recepción.
- Versión oficial de logo para fondo oscuro y favicon de marca. El footer conserva el logo original sobre una superficie blanca.
- IDs/accesos de Analytics, Google Business y Search Console si se decide habilitarlos. No se añadieron identificadores ficticios ni seguimiento de datos personales.

Por decisión del propietario el sitio seguirá siendo estático. El envío automático de formularios/correos, un CMS con escritura y la recepción de reclamaciones requieren un servicio externo independiente; no se agregan como supuestos de esta web.

## Fotos temporales

Autorizadas por el propietario mientras llegan las reales. No representan unidades de A&M y se identifican en la web.

- SUV y sedán: imágenes Unsplash ya usadas en el proyecto (`photo-1519641471654-76ce0107ad1b`, `photo-1555215695-3004980ad54e`).
- Excavadora: [Caspar Rae / Unsplash](https://unsplash.com/photos/5kC7MgYArbY).
- Transporte: [Scott Horn / Unsplash](https://unsplash.com/photos/l9U4QP8BEVk).
- Volquete: [Corey Willett / Unsplash](https://unsplash.com/photos/L6yvv2Byy3c).

## Hosting

Se mantiene la exportación estática para Cloudflare Pages. Comando `pnpm build`, salida `out/`, Node.js 22+ y pnpm 11.19.0. No se publican cambios automáticamente desde esta revisión local.

El workflow existente comprueba tipos y compilación. `pnpm test` verifica los cinco tipos de cotización, datos opcionales, solicitudes inválidas y codificación de mensajes sin contactar a WhatsApp.
