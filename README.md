# Best on the Menu

Find the must-try menu items for the restaurant you're at!

## Built With

* [![Svelte][Svelte-img]][Svelte-url]
* [![NodeJS][Nodejs-img]][Nodejs-url]
* [![TypeScript][Typescript-img]][Typescript-url]
* [![Supabase][Supabase-img]][Supabase-url]
* [![Postgres][Postgres-img]][Postgres-url]
* [![Prisma][Prisma-img]][Prisma-url]
* [![Tailwind][Tailwind-img]][Tailwind-url]
* [![Vite][Vite-img]][Vite-url]
* [![DaisyUI][DaisyUI-img]][DaisyUI-url]

## Prerequisites
- [node >=14](https://nodejs.org/en/download)
- [pnpm](https://pnpm.io/installation)

## Install

```bash
pnpm install
```

Setup environment variables (and update with your Supabase settings):
```
cp .env.example .env
```

Migrate the database:
```
npx prisma migrate dev
```

## Develop

Start a development server:

```bash
npm run dev
```

## Test

```bash
npm run test
```

## Build

To create a production version:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[Svelte-url]: https://kit.svelte.dev/
[Svelte-img]: https://img.shields.io/badge/Svelte-4A4A55?style=for-the-badge&logo=svelte&logoColor=FF3E00
[Supabase-url]: https://supabase.com/ 
[Supabase-img]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[Nodejs-url]: https://nodejs.org/en
[Nodejs-img]: https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white
[Typescript-url]: https://www.typescriptlang.org/
[Typescript-img]: https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white
[Postgres-url]: https://www.postgresql.org/
[Postgres-img]: https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white
[Prisma-url]: https://www.prisma.io/
[Prisma-img]: https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Tailwind-img]: https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white
[Vite-url]: https://vitejs.dev/
[Vite-img]: https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white
[DaisyUI-url]: https://daisyui.com/
[DaisyUI-img]: https://img.shields.io/badge/daisyui-5A0EF8?style=for-the-badge&logo=daisyui&logoColor=white
