    // drizzle.ts
    import { drizzle } from "drizzle-orm/neon-http";
    import { neon } from "@neondatabase/serverless";
    import { config } from "dotenv";
    import * as schema from "@/database/schema"; // make sure path is correct

    config({ path: ".env.local" }); // or .env.local if you're using Next.js

    const sql = neon(process.env.DATABASE_URL!);

    // ✅ Include the schema when initializing drizzle
    export const db = drizzle(sql, { schema });
