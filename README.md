# RentingCar AyM

Web de alquiler de vehículos con Next.js, React y TypeScript. Diseño adaptable, animaciones CSS, filtro por categoría, ficha modal accesible y cálculo de cotización por días. Exportación estática para Cloudflare Pages.

## Desarrollo

Requiere Node.js 22+ y pnpm 11.19.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Abrir http://localhost:3000.

```sh
pnpm typecheck
pnpm build
pnpm preview
```

La compilación produce `out/`. El comando preview sirve esa carpeta en el puerto 3000, para revisión local; no es un servidor de producción.

## Contenido y contacto

- `src/lib/fleet.ts`: catálogo, fotografías y tarifas referenciales.
- `src/lib/business.ts`: WhatsApp, central, correos, dirección, mapa y enlace a Grupo AyM.
- `src/app/page.tsx`: portada, secciones y flujo de cotización.
- `src/app/globals.css`: identidad visual, puntos de adaptación y movimiento reducido.
- Copiar `.env.example` a `.env.local` y definir `NEXT_PUBLIC_WHATSAPP_NUMBER` con el número del negocio en formato internacional, sin signos ni espacios. Recompilar después de cambiarlo.

El WhatsApp público predeterminado es +51 993 334 984; la variable de entorno permite reemplazarlo. La web no envía formularios a un servidor, procesa pagos ni confirma reservas. Los contactos y la sede de Surco fueron proporcionados por la empresa. Las categorías, tarifas y fotografías del catálogo son ejemplos; reemplazarlos y definir condiciones comerciales antes de usarla como catálogo real. Las fotografías de Unsplash son referenciales y se cargan remotamente; las tipografías se cargan de Google Fonts con fuentes de sistema de respaldo.

## GitHub y Cloudflare Pages

El workflow `.github/workflows/ci.yml` comprueba tipos y compilación al subir cambios y abrir pull requests. No necesita credenciales de Cloudflare.

1. Subir este proyecto a tu repositorio de GitHub, incluyendo `pnpm-lock.yaml`.
2. En Cloudflare, crear un proyecto **Pages** e importar el repositorio.
3. Usar el preset **Next.js (Static HTML Export)**.
4. Comando de compilación: `pnpm build`. Carpeta de salida: `out`.
5. Configurar Node.js 22 y pnpm 11.19.0 en el entorno de compilación (`NODE_VERSION` y `PNPM_VERSION`).
6. Agregar `NEXT_PUBLIC_WHATSAPP_NUMBER` al entorno de producción y de previews si se desea activar el enlace.
7. Elegir tu rama de producción; la integración de Pages reconstruye el sitio con cada push y puede generar previews para pull requests.

CI y despliegue de Pages se ejecutan por separado; configurar protección de rama si se necesita que la validación sea obligatoria antes de integrar cambios.

Documentación: https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/

Esta versión no requiere Workers, base de datos ni servidor Next.js. Las reservas reales, inventario en tiempo real y panel de administración requieren una integración posterior.
