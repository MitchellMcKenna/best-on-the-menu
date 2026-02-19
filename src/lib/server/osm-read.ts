import { createOSMStream } from "osm-pbf-parser-node";
import prisma from './prisma';
import slug from "slug";
import { Prisma } from "@prisma/client";

interface OsmItem {
    type: string | null;
    lat: number;
    lon: number;
    tags: Record<string, string | undefined>;
}

export async function importRestaurants(filePath: string): Promise<{ imported: number; skipped: number }> {
    let imported = 0;
    let skipped = 0;

    console.log(`Starting import from ${filePath}...`);

    for await (const item of createOSMStream(filePath) as AsyncIterable<OsmItem>) {
        // Skip over first object of pbf file, is file description object.
        if (item.type == null) {
            continue;
        }

        // Skip over object without a name.
        if (item.tags.name == null) {
            skipped++;
            continue;
        }

        const businessSlug = slug([item.tags.name, item.tags["addr:city"]].filter(Boolean).join(" "));

        const result = await prisma.$queryRaw<{ id: string }[]>(
            Prisma.sql`INSERT INTO "public"."Business" (
                name,
                slug,
                location,
                amenity,
                cuisine,
                website,
                "streetNumber",
                street,
                city,
                state,
                postcode,
                country,
                hours,
                "updatedAt"
            )
            VALUES
            (
                ${item.tags.name},
                ${businessSlug},
                ST_MakePoint(${item.lon}, ${item.lat})::geometry,
                ${item.tags.amenity},
                ${item.tags.cuisine ?? null},
                ${item.tags.website ?? null}, /* TODO:: phone */
                ${item.tags["addr:housenumber"] ?? null},
                ${item.tags["addr:street"] ?? null}, /* TODO:: suite and unit */
                ${item.tags["addr:city"] ?? null},
                ${item.tags["addr:state"] ?? null},
                ${item.tags["addr:postcode"] ?? null},
                'US',
                ${item.tags["opening_hours"] ?? null}, /* TODO:: outdoor_seating */
                now()
            )
            ON CONFLICT (slug) DO NOTHING
            RETURNING id`
        );

        if (result.length > 0) {
            imported++;
        } else {
            skipped++;
        }

        if ((imported + skipped) % 100 === 0) {
            console.log(`Imported ${imported} so far (${skipped} skipped)...`);
        }
    }

    console.log(`Import complete: ${imported} imported, ${skipped} skipped`);
    return { imported, skipped };
}
