Authentication platform for McInnes Design applications. Includes bespoke OAuth flow for testing environments, while using Better Auth for live environments.

## Commands

| Command                   | Action                                             |
| :------------------------ | :------------------------------------------------- |
| `pnpm install`            | Installs dependencies                              |
| `pnpm dev`                | Starts local dev server at `localhost:3000`        |
| `pnpm preview`            | Preview production build                           |
| `pnpm build`              | Create a production build                          |
| `vercel`                  | Run CLI commands for Vercel, e.g `vercel env pull` |

### Configure Database

To generate the ORM schema for Better Auth, run the following:

```bash
pnpm dlx auth@latest generate
```

Create a `schema` folder at the root of the project and add the generated `auth-schema.ts` file into it. Then run:

```bash
pnpm dlx drizzle-kit generate
```

You should now have a `drizzle` folder with a database migration file. Run the following to apply the migration and load in the tables:

```bash
pnpm dlx drizzle-kit migrate
```

## Learn More about the tech in this project

- [Next.js](https://nextjs.org/docs) Framework
- [Vercel](https://vercel.com/home) Hosting
- [Tailwind](https://tailwindcss.com/) CSS
- [Better Auth](https://better-auth.com/) Authentication
- [Drizzle](https://orm.drizzle.team/) ORM
- [Neon](https://neon.com/) Database
