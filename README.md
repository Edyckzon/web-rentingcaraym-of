# Renting Car A&M

Web estática de vehículos, maquinaria y transporte de carga, con Next.js, React y TypeScript. Exporta HTML a `out/` y utiliza Cloudflare Pages Functions para el panel y la API. Supabase gestiona autenticación, catálogo, galerías y contenido administrable.

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
- `public/images/`: imágenes estáticas que no pertenecen al catálogo de marketing.
- `src/lib/business.ts`: WhatsApp, central, correos, dirección y mapas.
- `src/lib/quote.ts`: validación y construcción del mensaje.
- `src/lib/seo.ts`: metadatos por página.
- `src/app/globals.css`: paleta, tipografía y adaptación a pantallas.

Para administrar la flota y sus galerías, usa el panel de marketing. Las fotos se guardan en Supabase Storage; el sitio conserva una instantánea de metadatos públicos para generar las páginas estáticas.

En `models` de `fleet.ts`, el orden del arreglo `images` de cada vehículo define su portada y miniaturas. Con una sola foto se puede ampliar; con dos o más aparecen flechas y miniaturas, y se puede deslizar en móvil. Los identificadores internos `jac-s8` y `jetur-x70` se conservan en Supabase. Sus URL públicas son `/flota/jac-js8/` y `/flota/jetour-x70/`; `public/_redirects` conserva los enlaces anteriores mediante 301 en Cloudflare Pages.

El WhatsApp confirmado es **+51 993 334 984**. `.env.example` documenta `NEXT_PUBLIC_WHATSAPP_NUMBER`; un cambio requiere recompilar. El número mostrado y todos los enlaces usan la misma configuración. Se conservan los correos existentes hasta confirmar que la nueva casilla comercial está activa.

## Pendientes del PDF antes de publicación

- Fotos reales, características de las unidades, capacidades, tarifas, modalidades, coberturas, seguros y requisitos comerciales aprobados.
- Historia, cifras de experiencia, razón social/RUC, horarios, misión/visión, equipo y testimonios autorizados. No se inventaron estos datos ni se publicaron bloques vacíos.
- Confirmación de `rentals@rentingcaraym.com`; por ahora se mantiene `rentingcaraym@gmail.com` y administración sin tilde.
- Política de privacidad completa y términos de alquiler aprobados. Las páginas actuales describen el funcionamiento y explicitan lo pendiente; están marcadas `noindex`.
- Libro de Reclamaciones real o enlace a un proveedor externo autorizado: la página actual informa que no hay registro habilitado y no simula recepción.
- Versión oficial de logo para fondo oscuro y favicon de marca. El footer conserva el logo original sobre una superficie blanca.
- IDs/accesos de Analytics, Google Business y Search Console si se decide habilitarlos. No se añadieron identificadores ficticios ni seguimiento de datos personales.

La presentación pública se exporta como HTML. El panel sí escribe en Supabase mediante Pages Functions. Las cotizaciones siguen preparándose para WhatsApp; el envío automático de correo y el registro de reclamaciones aún no están implementados.

## Fotos temporales

Autorizadas por el propietario mientras llegan las reales. No representan unidades de A&M y se identifican en la web.

- SUV y sedán: imágenes Unsplash ya usadas en el proyecto (`photo-1519641471654-76ce0107ad1b`, `photo-1555215695-3004980ad54e`).
- Excavadora: [Caspar Rae / Unsplash](https://unsplash.com/photos/5kC7MgYArbY).
- Transporte: [Scott Horn / Unsplash](https://unsplash.com/photos/l9U4QP8BEVk).
- Volquete: [Corey Willett / Unsplash](https://unsplash.com/photos/L6yvv2Byy3c).

## Hosting

Se mantiene la exportación estática para Cloudflare Pages. Comando `pnpm build`, salida `out/`, Node.js 22+ y pnpm 11.19.0. La integración Git de Pages publica los commits enviados a main.

El workflow existente comprueba tipos y compilación. `pnpm test` verifica los cinco tipos de cotización, datos opcionales, solicitudes inválidas y codificación de mensajes sin contactar a WhatsApp.

### Marketing con Supabase y Cloudflare Pages

El sitio y el editor leen la configuración, la flota y sus categorías desde Supabase.
Los cambios en marketing se guardan directamente en Postgres; los archivos subidos se guardan en el bucket público renting-fotos. No se usa el contenido de .marketing/content.json.
El orden de la galería determina la principal. Una categoría no se puede eliminar mientras tenga vehículos asignados.

En una instalación nueva aplica los SQL 01, 02 y 03 en orden, creando primero la cuenta de marketing en Authentication > Users antes del 02.
Desactiva el registro público de Auth. El panel verifica el rol de administrador por UID en la base usando el token personal de sesión y las políticas RLS. El navegador recibe una cookie HttpOnly; no se necesita una clave de servicio.
Las imágenes migradas conservan los créditos y las licencias de las fotografías referenciales.

Desarrollo: guarda SUPABASE_PUBLISHABLE_KEY en .marketing/auth.env (ignorado por Git) y ejecuta npm run marketing:local con Node 22+. Usa http://127.0.0.1:4318/admin/.
Cloudflare Pages: usa la raíz de la app que contiene functions/, comando pnpm build, salida out/ y el binding de servidor SUPABASE_PUBLISHABLE_KEY en el entorno correspondiente.
Despliega con integración Git o Wrangler Pages desde esa raíz para incluir las Functions; subir solo out/ no incluye la API.
En producción vincula una base Cloudflare D1 con el nombre de binding LOGIN_GUARD_DB.
La API crea su tabla automáticamente. Solo /marketing-api/login/ requiere el binding;
sin él se mantiene el login anterior con los límites de Supabase. Un error de D1 una vez vinculado no permite saltarse la protección. El séptimo error de credenciales del mismo correo en una ventana
de 15 minutos bloquea ese login durante otros 15 minutos. Una contraseña correcta
antes del bloqueo reinicia el contador. No afecta a sesiones abiertas ni al login
directo de Supabase. En desarrollo se usa SQLite en .marketing/ (excluido de Git).


## SEO administrable y publicación (noviembre de 2026)

- Migraciones `05-seo-administrable.sql` y `06-contenido-seo.sql`: campos SEO e Ideal para en vehículos, tabla `paginas_web` con RLS y fechas de modificación. La RPC sigue aceptando al panel anterior sin borrar los campos nuevos.
- `07-textos-alternativos.sql` mejora los alt referenciales conservando los archivos y créditos.
- El admin permite editar títulos, descripciones, encabezados e introducciones de 10 páginas. El texto del inicio se edita ahora en Páginas y SEO; Portada administra su imagen.
- Guardar actualiza Supabase. **Publicar SEO en Cloudflare** solicita una compilación mediante el secreto de servidor `CLOUDFLARE_DEPLOY_HOOK`; no afirma que el despliegue haya terminado. Crear el hook para `main` en el proyecto Pages correcto. Se mantiene el plan Free; cada publicación consume una compilación del plan.
- `SUPABASE_PUBLISHABLE_KEY` debe estar tanto en el entorno de compilación como disponible para las Functions. La compilación refresca la instantánea pública; en Pages falla si falta esta configuración, evitando publicar datos antiguos silenciosamente.
- Un vehículo nuevo usa temporalmente `/flota/ficha/?id=...` (noindex) hasta compilar su URL propia. Las fichas exportadas tienen metadatos por vehículo; el sitemap incluye las rutas corregidas y fechas reales guardadas en la base.
- Las redirecciones 301 de `_redirects` se aplican en Pages, no en el servidor simple `pnpm preview`.

### Textos comerciales y legales

Las migraciones de `supabase/migrations/` añaden el horario, los textos Ideal para y 44 bloques de contenido ya cargados. Aplicarlas después de los SQL 01 a 07; ya están aplicadas en el proyecto actual. No ejecutar `db push` sobre una instalación vacía sin los SQL anteriores.

**Textos y enlaces** administra requisitos, duración, garantías, tarifas, coberturas, pasos, ventajas, preguntas frecuentes, llamadas a cotizar, condiciones, privacidad y reclamaciones. **Contacto** administra correos, dirección, horario y enlaces de ubicación/grupo. La lectura es pública; la escritura requiere el rol administrador mediante RLS. Se guardan textos simples, sin HTML, y enlaces internos o HTTPS. Los bloques no se pueden borrar ni dejar sin título/contenido desde el editor.

El horario confirmado es 9:00 a. m. a 6:00 p. m.; no se inventan días de atención. Tarifas, garantías, coberturas y disponibilidad se consultan y confirman en la propuesta. El enlace del Libro puede cambiarse cuando la empresa entregue un sistema real; editar un texto no crea un registro ni envía constancias.

En local, el Deploy Hook debe configurarse aparte en `.marketing/auth.env` y requiere reiniciar `marketing:local`. No copiar el secreto al frontend ni al repositorio. La variable configurada en Cloudflare no se hereda en el equipo local. El botón solicita una compilación; no garantiza su finalización.

Pendientes del requerimiento: Libro de Reclamaciones operativo con constancias, validación final de políticas de la empresa, datos comerciales específicos, página para conductores condicionada a autorización y fotos reales faltantes. Por decisión del usuario se posponen `www`, Search Console y mediciones PageSpeed. La propuesta de contenido está implementada con textos conservadores, sin promesas comerciales no confirmadas.
