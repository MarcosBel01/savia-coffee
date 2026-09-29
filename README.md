# Savia · Cuaderno de café

PWA en español para registrar cafés, extracciones y puntuaciones. React + TypeScript + Tailwind/CSS; salida estática con Vite para GitHub Pages. Backend opcional Supabase (PostgreSQL, Auth y RLS). No requiere un servidor Node en producción.

## App y backend publicados

- App: https://marcosbel01.github.io/savia-coffee/
- Código: https://github.com/MarcosBel01/savia-coffee
- Proyecto Supabase: `savia-coffee`, región París (`eu-west-3`), organización ProyectosPersonales.
- Conexión precargada: en Ajustes basta con crear una cuenta, confirmar el correo e iniciar sesión.
- Plan Free en el momento de la creación. Las copias se guardan y recuperan manualmente.

## Desarrollo local

1. Instala Node.js 22.13 o posterior.
2. Descomprime el proyecto y entra en su directorio.
3. Ejecuta `npm install`.
4. Ejecuta `npm run dev:pages` y abre la dirección indicada.
5. Para la versión de producción: `npm run build:pages` y `npm run preview:pages`.

La PWA necesita HTTPS, salvo localhost. Para probar offline, abre la compilación de producción, espera a que se instale el Service Worker y vuelve a cargarla sin conexión. La primera visita necesita internet. El backend nunca se cachea.

## Funciones

- Inventario: crear, consultar, editar y eliminar cafés. No se permite eliminar un café con recetas asociadas.
- Recetas: café, fecha, método, café seco, agua utilizada, bebida obtenida, tiempo en segundos, temperatura, modelo y ajuste de molino, vertidos y sensaciones.
- Ratio automático: café/agua para filtro, café/bebida para espresso.
- Resultado 1–10, pasos de 0,5; acidez, dulzor, cuerpo y postgusto 1–10.
- Búsqueda y filtros por café y método; mejor receta, perfil y tabla comparativa.
- Exportación CSV de todas las recetas y JSON de inventario y recetas. El CSV protege las celdas de texto frente a fórmulas al abrirlo en una hoja de cálculo.
- Modo oscuro, navegación móvil inferior y modo de ejemplo separado de los datos reales.
- Persistencia local y copia manual en la nube. No es sincronización automática.

## Configurar Supabase

1. Crea un proyecto Supabase (o utiliza uno destinado a esta app).
2. En SQL Editor ejecuta `supabase/setup.sql`. Crea `notebooks`, seguridad por usuario y una función transaccional con control de revisiones.
3. En Authentication habilita Email. Mantén la confirmación de correo si quieres verificar las cuentas.
4. Configura la URL del sitio en Authentication > URL Configuration con la dirección final de Pages, incluida la ruta del repositorio.
5. Copia la Project URL y la clave pública publishable/anon a Ajustes dentro de Savia. **Nunca uses service_role ni secret key en el navegador.**
6. Crea una cuenta, confirma el correo si procede e inicia sesión.
7. Pulsa **Guardar en la nube**. En un segundo dispositivo configura el mismo proyecto, entra con la misma cuenta y pulsa **Recuperar copia**.

La copia remota usa PostgreSQL con un documento JSONB por usuario para minimizar tablas y dependencias. Los cafés y las recetas están relacionados por `beanId` dentro del documento. No se han normalizado en tablas independientes; para consultas SQL avanzadas se puede migrar el adaptador de `lib/cloud.ts` sin cambiar la interfaz.

RLS restringe la lectura y las escrituras al propietario. La app escribe mediante `save_notebook`, que obtiene el usuario del JWT. La función se ejecuta con los permisos del usuario y RLS restringe SELECT, INSERT y UPDATE al propietario. El servidor rechaza una escritura si la revisión remota ha cambiado; exporta tus cambios locales y recupera la copia antes de reintentarlo. Recuperar una copia sustituye los datos locales con confirmación.

La sesión se conserva en memoria mientras la página permanezca abierta. Tras recargar o caducar el token hay que iniciar sesión otra vez. No se guardan contraseñas ni tokens de sesión en localStorage. La URL y clave pública sí se guardan localmente. Las copias offline no se envían solas: pulsa Guardar en la nube cuando vuelvas a tener conexión.

## GitHub Pages

El repositorio y GitHub Pages ya están configurados. Cada push a `main` vuelve a publicar la app. Para desplegar una copia en otra cuenta:

1. Crea un repositorio `savia-coffee` en tu cuenta y sube los archivos del proyecto, sin `node_modules`, `pages-dist` ni datos privados.
2. En Settings > Pages, selecciona **GitHub Actions** como origen.
3. Sube los cambios a la rama `main`. `.github/workflows/pages.yml` construye y publica automáticamente `pages-dist`.
4. Consulta Actions para comprobar que el trabajo Deploy termina correctamente. La URL estará en Settings > Pages y en el entorno `github-pages`.

El build utiliza rutas relativas, por lo que funciona en la subruta de un repositorio. El workflow no necesita claves Supabase: cada usuario configura su proyecto desde Ajustes. Revisa la visibilidad del repositorio al crearlo; no publiques credenciales privadas.

## Estructura

- `app/page.tsx`: vistas y acciones de la aplicación.
- `app/globals.css`: tema, componentes y adaptación móvil.
- `components/coffee-form.tsx`: diálogo de edición accesible mediante `dialog` nativo.
- `components/cloud-settings.tsx`: configuración, autenticación y copias remotas.
- `lib/coffee.ts`: modelo de datos, repositorio local, cálculos y exportación.
- `lib/cloud.ts`: adaptador REST para Supabase.
- `supabase/setup.sql`: esquema, políticas y función de escritura.
- `public/manifest.webmanifest`, `public/sw.js`: instalación y caché offline.
- `scripts/precache-pages.mjs`: incorpora los assets de cada build a la caché de la PWA.
- `vite.pages.config.ts`, `pages-main.tsx`: entrada estática para GitHub Pages.

La aplicación servida en Pages es React estático y conecta directamente a Supabase. Se ha elegido Vite en lugar de Next.js porque no necesita renderizado de servidor ni un proceso Node en producción.

## Verificación y límites

Se han comprobado la compilación estática y los tipos TypeScript. Las pruebas de contrato comprueban ratios, separación de ejemplos, persistencia y exportaciones. Se ha verificado GitHub Actions y la carga de la app publicada. En Supabase se han comprobado guardado, incremento de revisión, rechazo de conflictos y aislamiento por usuario en una transacción revertida; el asesor de seguridad no devuelve incidencias. Quedan pendientes la instalación real en un móvil y el flujo de registro de una cuenta personal con su correo.

El almacenamiento local pertenece a un dispositivo y navegador. Exporta copias de seguridad antes de borrar sus datos. Los cafés de ejemplo son ficticios y no representan fichas verificadas de los tostadores.

## Experimentar con tus recetas

- Abre una receta y pulsa **Repetir receta**: crea una copia al guardar, con fecha local de hoy y puntuaciones reiniciadas a 5/10. Revisa las notas copiadas y vuelve a puntuar; cancelar no crea registros.
- En **Ajustes → Mis molinos**, añade nombre/modelo, unidad y notas. Selecciona el perfil desde el formulario de receta. Las recetas guardan una instantánea del nombre y unidad; editar o eliminar un perfil no modifica el historial.
- En **Análisis → Comparar dos tazas**, selecciona A y B. Se muestran diferencias B menos A, notas y accesos para repetir. Los filtros afectan las opciones. Molinos o unidades diferentes no generan diferencias numéricas de ajuste.
- Los perfiles viajan en el JSON y en la copia manual de Supabase. El formato sigue siendo compatible con cuadernos existentes: los campos nuevos son opcionales, sin migración de base de datos.
