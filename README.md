# No More Bets

Una ruleta compartida para grupos de amigos que quieren dejar de perder tiempo decidiendo qué hacer. Creá un grupo, invitá a la banda, cargá opciones y dejá que la suerte resuelva.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS y componentes UI locales con el patrón de shadcn/ui
- React Router
- Supabase Auth, PostgreSQL y Row Level Security
- SVG y CSS para la ruleta animada (sin librerías de animación pesadas)

## Funcionalidades

- Registro por email, contraseña, username y display name; el perfil se crea mediante trigger.
- Login persistente, logout y rutas privadas con retorno al destino original.
- Perfil editable y roles globales `USER` / `ADMIN`.
- Grupos con código corto de invitación, roles `OWNER` / `ADMIN` / `MEMBER` y administración de miembros.
- Creación, edición y eliminación de ruletas; opciones con baja lógica para preservar el historial.
- Selección uniforme independiente de la animación y rueda SVG que termina en el resultado preseleccionado.
- Historial de los últimos diez giros.
- Panel global para cambiar roles y activar/desactivar cuentas.
- Diseño mobile-first, estados de carga/error/vacío y toasts.
- RLS en todas las tablas y operaciones sensibles protegidas en PostgreSQL.

## Instalación

Requiere Node.js 20.19 o superior.

```bash
npm install
copy .env.example .env
npm run dev
```

En macOS o Linux, usá `cp .env.example .env` en lugar de `copy`.

## Configuración de Supabase

1. Creá un proyecto en [Supabase](https://supabase.com/).
2. Abrí **SQL Editor** y ejecutá [`supabase/migrations/20260919000000_initial_schema.sql`](supabase/migrations/20260919000000_initial_schema.sql) completo. Si usás la CLI de Supabase, también podés ejecutar `supabase db push` desde este repositorio enlazado.
3. En **Authentication → Providers → Email**, habilitá Email. Para producción se recomienda mantener la confirmación de email habilitada y configurar las URLs de redirección del dominio final.
4. Copiá la URL del proyecto y la clave pública `anon`/`publishable` desde **Project Settings → API** a `.env`:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA
```

5. Registrá el primer usuario desde la app. Para convertirlo en administrador inicial, ejecutá una única vez desde el SQL Editor:

```sql
update public.profiles set role = 'ADMIN' where username = 'tu_username';
```

No uses ni expongas `SUPABASE_SERVICE_ROLE_KEY` en este proyecto. La clave pública es segura en el navegador porque el acceso efectivo está limitado por RLS.

### Modelo y seguridad

La migración crea `profiles`, `groups`, `group_members`, `wheels`, `wheel_options` y `spins`, índices, constraints, trigger de perfil y políticas RLS. Las funciones RPC `create_group`, `join_group`, `get_group_invite_preview` y `admin_update_user` permiten operaciones atómicas sin abrir acceso directo a datos ajenos.

Los emails no se muestran en `/admin`: pertenecen a `auth.users`, que no debe exponerse al cliente. Si más adelante se requiere esa columna, implementala con una Supabase Edge Function que valide el JWT y el rol global, usando la Service Role Key únicamente del lado servidor.

## Scripts

```bash
npm run dev       # servidor de desarrollo
npm run build     # TypeScript + bundle de producción
npm run lint      # análisis estático
npm run preview   # previsualizar dist localmente
```

## Deploy en Cloudflare Pages

1. Subí el repositorio a GitHub.
2. En Cloudflare Pages elegí **Create a project → Connect to Git**.
3. Usá estos valores:

   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Node version: `20` o superior

4. Agregá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en **Settings → Environment variables** para Production y Preview.
5. Agregá el dominio de Pages a las URLs permitidas en Supabase Auth.

El archivo `public/_redirects` se copia a `dist/_redirects` durante el build y aplica `/* /index.html 200`, por lo que las rutas de React Router funcionan al recargar o abrirse directamente.

## Estructura principal

```text
src/
├── components/       # layout, auth, rueda y primitivas UI
├── context/          # sesión y perfil
├── pages/            # pantallas enrutadas
├── services/         # acceso a Supabase por dominio
├── types/            # tipos del modelo
└── utils/random.ts   # selección uniforme y ángulo final
supabase/migrations/  # esquema, funciones y RLS
public/_redirects     # fallback SPA para Cloudflare Pages
```

## Límites conocidos del MVP

- No hay recuperación de contraseña ni carga de avatares.
- El panel administrativo omite emails deliberadamente por seguridad.
- Los cambios entre usuarios se reflejan al recargar; Realtime queda preparado como evolución futura.
- Las opciones se desactivan en lugar de borrarse físicamente para conservar la integridad del historial.
