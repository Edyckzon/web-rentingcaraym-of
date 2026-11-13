# Catálogo comercial de Renting Car A&M

Plan derivado del requerimiento del 12 de noviembre de 2026. Cada entrega tiene un alcance y una prueba de aceptación propios.

## Avance actual

- **Correo aplazado por decisión del equipo (12/11/2026).** La siguiente fase reunirá suscripciones y notificaciones de formularios, además del formulario de llamada. Requiere definir proveedor, remitente, consentimiento y flujo de bajas. WhatsApp mantiene su flujo independiente. No activar correo ni suscripciones con esta entrega.
- **Animación de sede, versión 2:** propuesta local de 24 segundos en 1080p, con zoom lento, nubes por capas y llegada a una reconstrucción de la fachada con el SUV rojo y la asesora saludando. Video bajo demanda con controles nativos, sin reproducción automática. La asesora aparece dentro del video. Se identifica la escena como recreación con IA, no como una grabación real. Pendiente aprobación visual antes de publicar.

- [x] Crear la estructura de tarifas y el historial de cambios. Migración aplicada en Supabase.
- [x] Añadir **Admin → Tarifas** con edición por vehículo y confirmación de guardado.
- [x] Mostrar el precio de partida y su tramo en tarjetas, vista rápida y fichas.
- [x] Calcular por fechas y horas, redondear por días y mostrar la garantía aparte del total.
- [x] Preparar el mensaje con modelo, fechas, lugar, tramo y total para WhatsApp.
- [x] Verificar compilación, permisos y cálculo para 3, 10 y 35 días. Las 18 pruebas pasan.
- [x] El equipo probó el guardado de tarifas y confirmó el resultado de 18 días.
- [x] Integrar ficha técnica, categorías adicionales, borradores, páginas de categoría y filtros en URL.
- [x] Integrar tramos, extras, campañas por modelo, tarifas de servicios y exportación del historial.
- [x] Preparar formulario privado de llamada, recálculo en servidor, bandeja y aviso por correo.
- [x] Integrar buscador de portada, tarifario, requisitos, GLP, promociones y barra móvil en fichas.
- [x] Añadir eventos para GTM con consentimiento y datos estructurados de fichas y servicios.
- [x] Preparar editor privado de carga, vista general y por ruta, y vista previa del mensaje de cotización.
- [x] Preparar tres guías en `/guias/` para revisión local. Cada guía entra en la web pública y en el sitemap después de su aprobación.
- [x] Integrar campañas por categoría con revisión por vehículo y guardado transaccional.
- [ ] Revisar visualmente el diseño a 360 px y confirmar fotos y datos técnicos con Operaciones.
- [ ] Cargar tarifas aprobadas, comprobar su reflejo en toda la web y desplegar la entrega.

## Entregas

| Entrega | Trabajo | Criterio de aceptación | Insumos |
| --- | --- | --- | --- |
| 1. Tarifario y cotizador base | Editar importes por vehículo. Mostrar el tramo del precio «desde». Calcular duración, tarifa, garantía y total en la ficha. Enviar el detalle por WhatsApp. Registrar cambios de tarifa en Supabase. | Comprobar 3, 10 y 35 días, fracciones de día, importes sin configurar y garantía separada. Guardar desde el admin y verificar que la ficha y la tarjeta usen la misma tarifa. | Tarifario aprobado para cargar precios reales. |
| 2. Flota y contenido | Administrar ficha técnica, publicación y varias categorías por vehículo. Crear Pickup 4x4 y páginas de categoría. Implementar filtros compartibles y orden por año o precio. Sustituir imágenes referenciales por material aprobado o una silueta. Redactar textos propios y guías. | El vehículo aparece en todas sus categorías sin duplicar la ficha. La URL restaura filtros y el catálogo ofrece limpiar filtros cuando está vacío. Validar las fichas y fotos con Operaciones. | Inventario y datos confirmados, fotos y aprobación editorial. |
| 3. Promociones y extras | Gestionar campañas, vigencias, bases, extras y reglas configurables. Aplicar historial real de precios, control de solapamientos y cálculo compartido. Mostrar tabla de tarifas y promociones vigentes. Exportar historial. | El cálculo pasa los casos con y sin extras. El panel bloquea campañas sin historial suficiente. Al vencer se retiran la campaña, su descuento y los precios promocionales del contenido generado. | Política de promociones validada, catálogo de extras y bases. |
| 4. Solicitudes y correo | Formulario breve, consentimiento y registro privado. Recalcular en servidor y guardar el detalle de la cotización recibida. Implementar revisión desde el panel y notificación por correo. | Una solicitud válida se registra una vez y la notificación llega al correo autorizado. Usuarios públicos no pueden listar solicitudes. | Correo del dominio, proveedor de envío y texto de privacidad aprobado. |
| 5. Rediseño comercial | Revisar portada y ficha con el equipo. Integrar buscador por fechas y categoría, tabla, llamadas a cotizar, páginas de GLP y requisitos. Completar empresas y maquinaria. Optimizar móvil y galería. | A 360 px se navega, filtra, consulta precio y cotiza sin desbordes. Las fechas viajan desde el buscador. Las imágenes y afirmaciones comerciales cuentan con aprobación. | Maqueta, marca, fotos, condiciones y precios de servicios. |
| 6. SEO, medición y entrega | Completar metadatos, marcado y navegación por categorías. Validar sitemap y redirecciones. Medir clics de contacto y formularios recibidos en GA4/GTM, configurar Search Console y tablero. Probar rendimiento y documentar el admin. | Pasan las pruebas de rutas y marcado, se verifican eventos en DebugView y se evalúan las métricas móviles en producción. Las solicitudes guardadas se distinguen de los clics de contacto. | Accesos de A&M y configuración de privacidad y analítica. |
| 7. Carga nacional | Preparar página y plantilla por ruta, tarifas y cotizador de flete. Publicar y redirigir la URL anterior al activar el servicio. | Las rutas aprobadas se pueden cotizar y el sitemap incluye solo las publicadas. | Confirmación escrita de la autorización MTC y datos del transportista, rutas y capacidades. |
| 8. Animaciones | Añadir al final las transiciones de galería, filtros y resultados que el equipo apruebe. | Revisar teclado, movimiento reducido y rendimiento móvil después de añadirlas. | Diseño y flujos principales aprobados. |

## Cómo probar y activar

- **Admin → Ficha técnica.** Confirme año, transmisión, combustible y plazas. Puede asignar varias categorías. Pickup 4x4 aparece en la ficha técnica y se incorpora al catálogo al asignarla a un modelo. Los vehículos nuevos se crean en borrador. Actualice la publicación SEO para regenerar las URLs, los metadatos y el sitemap.
- **Admin → Promociones y extras.** Los tramos iniciales son 1 a 6, 7 a 29 y desde 30 días. El administrador puede cambiar los límites y el divisor mensual. Cada tramo sin tarifa se consulta. Las campañas pueden aplicarse a un modelo o a los vehículos publicados de una categoría. La lista queda fijada al crear la campaña. La revisión informa qué modelo puede publicarse y la publicación requiere que todos cumplan las condiciones. El precio se aplica si la campaña y la fecha de recojo están vigentes. Cuando se habilita la acumulación, el porcentaje se aplica también a la tarifa de duración. Las campañas vigentes se consultan en tiempo real y se excluyen de los precios SEO estáticos. El CSV de historial abre en Excel.
- **Admin → Solicitudes.** El formulario de llamada se habilita con las variables de `.env.example` para Supabase, Turnstile y Resend. Configure el dominio permitido de Turnstile y el remitente verificado en Resend. La clave secreta de Supabase y las credenciales de envío van como secretos del servidor. Revise la política de privacidad antes de activar el formulario. Si falla el correo, la solicitud queda registrada con notificación pendiente. [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) · [Resend](https://resend.com/docs/api-reference/emails/send-email).
- **Analítica.** Configure `NEXT_PUBLIC_GTM_ID` en la compilación. En GTM cree la etiqueta de GA4 y los disparadores para `page_view`, `whatsapp_click`, `llamada_click`, `formulario_envio`, `cotizador_calculo`, `cotizar_click`, `view_item` y `filtro_uso`. Desactive el envío automático de clics salientes y formularios que puedan incluir datos de contacto en URLs. Verifique DebugView, marque las conversiones, vincule Search Console y prepare el tablero. La aplicación carga GTM tras el consentimiento.
- **Admin → Carga en borrador.** Permite registrar rutas, revisar la vista general y cada ruta y probar el mensaje de flete. La publicación y su redirección requieren las rutas, condiciones, flota y autorización confirmadas. Los borradores no aparecen en el sitemap.

Antes del despliegue revise los importes ingresados durante pruebas, los datos de marca y los insumos pendientes del PDF. Los modelos heredados mantienen su URL. Valide la publicación de los que aún no tienen año confirmado, la ficha a 360 px, el envío real de correo, las métricas de rendimiento y el marcado en producción.

Dirección visual propuesta: fotografía real como protagonista, base blanca y negra con naranja en acciones y precios. El cotizador actual ya tiene una transición breve al presentar el resultado. La revisión de movimiento y las animaciones adicionales se dejan para la última entrega.
