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

        // Check if a business with the same name exists within ~11m (dedup)
        const existing = await prisma.$queryRaw<{ id: number }[]>(
            Prisma.sql`SELECT id FROM "Business"
                WHERE name = ${item.tags.name}
                AND ST_DWithin(location::geography, ST_MakePoint(${item.lon}, ${item.lat})::geography, 11)
                LIMIT 1`
        );

        if (existing.length > 0) {
            // Update existing business, keep its slug
            await prisma.$queryRaw(
                Prisma.sql`UPDATE "Business" SET
                    location = ST_MakePoint(${item.lon}, ${item.lat})::geometry,
                    amenity = COALESCE(${item.tags.amenity ?? null}, amenity),
                    cuisine = COALESCE(${item.tags.cuisine ?? null}, cuisine),
                    website = COALESCE(${item.tags.website ?? null}, website),
                    "streetNumber" = COALESCE(${item.tags["addr:housenumber"] ?? null}, "streetNumber"),
                    street = COALESCE(${item.tags["addr:street"] ?? null}, street),
                    city = COALESCE(${item.tags["addr:city"] ?? null}, city),
                    state = COALESCE(${item.tags["addr:state"] ?? null}, state),
                    postcode = COALESCE(${item.tags["addr:postcode"] ?? null}, postcode),
                    hours = COALESCE(${item.tags["opening_hours"] ?? null}, hours),
                    "updatedAt" = now()
                WHERE id = ${existing[0].id}`
            );
        } else {
            // Generate a clean slug and insert new business
            const baseSlug = slug([item.tags.name, item.tags["addr:city"]].filter(Boolean).join(" "));

            // Find existing slugs with this prefix to determine the next suffix
            const existingSlugs = await prisma.$queryRaw<{ slug: string }[]>(
                Prisma.sql`SELECT slug FROM "Business"
                    WHERE slug = ${baseSlug} OR slug LIKE ${baseSlug + '-%'}`
            );

            let businessSlug = baseSlug;
            if (existingSlugs.length > 0) {
                let maxSuffix = 1; // base slug counts as 1
                for (const row of existingSlugs) {
                    if (row.slug === baseSlug) continue;
                    const match = row.slug.match(new RegExp(`^${baseSlug}-(\\d+)$`));
                    if (match) {
                        maxSuffix = Math.max(maxSuffix, parseInt(match[1]));
                    }
                }
                businessSlug = `${baseSlug}-${maxSuffix + 1}`;
            }

            await prisma.$queryRaw(
                Prisma.sql`INSERT INTO "Business" (
                    name, slug, location, amenity, cuisine, website,
                    "streetNumber", street, city, state, postcode, country, hours, "updatedAt"
                ) VALUES (
                    ${item.tags.name},
                    ${businessSlug},
                    ST_MakePoint(${item.lon}, ${item.lat})::geometry,
                    ${item.tags.amenity ?? null},
                    ${item.tags.cuisine ?? null},
                    ${item.tags.website ?? null},
                    ${item.tags["addr:housenumber"] ?? null},
                    ${item.tags["addr:street"] ?? null},
                    ${item.tags["addr:city"] ?? null},
                    ${item.tags["addr:state"] ?? null},
                    ${item.tags["addr:postcode"] ?? null},
                    'US',
                    ${item.tags["opening_hours"] ?? null},
                    now()
                )`
            );
        }

        imported++;

        if ((imported + skipped) % 100 === 0) {
            console.log(`Imported ${imported} so far (${skipped} skipped)...`);
        }
    }

    console.log(`Import complete: ${imported} imported, ${skipped} skipped`);
    return { imported, skipped };
}

export async function migrateSlugs(): Promise<{ updated: number }> {
    let updated = 0;

    // Fetch all businesses ordered by name, then id for stable ordering
    const businesses = await prisma.$queryRaw<{ id: number; name: string; city: string | null; currentSlug: string }[]>(
        Prisma.sql`SELECT id, name, city, slug as "currentSlug" FROM "Business" ORDER BY name, id`
    );

    // Group by base slug (name + city)
    const groups = new Map<string, typeof businesses>();
    for (const biz of businesses) {
        const baseSlug = slug([biz.name, biz.city].filter(Boolean).join(' '));
        if (!groups.has(baseSlug)) {
            groups.set(baseSlug, []);
        }
        groups.get(baseSlug)!.push(biz);
    }

    // Assign clean slugs: first gets base, rest get -2, -3, etc.
    for (const [baseSlug, members] of groups) {
        for (let i = 0; i < members.length; i++) {
            const newSlug = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`;
            if (members[i].currentSlug !== newSlug) {
                await prisma.$queryRaw(
                    Prisma.sql`UPDATE "Business" SET slug = ${newSlug}, "updatedAt" = now() WHERE id = ${members[i].id}`
                );
                console.log(`${members[i].name}: ${members[i].currentSlug} → ${newSlug}`);
                updated++;
            }
        }
    }

    console.log(`Migration complete: ${updated} slugs updated`);
    return { updated };
}
