import { createOSMStream } from "osm-pbf-parser-node";
import prisma from './prisma';
import slug from "slug";
import { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
for await (let item of createOSMStream('restaurants.pbf')) {
    console.log(item);

    // Skip over first object of pbf file, is file description object.
    if (item.type == null) {
        continue;
    }

    // Skip over object without a name.
    if (item.tags.name == null) {
        continue;
    }

    let businessSlug = slug([item.tags.name, item.tags["addr:city"]].filter(Boolean).join(" "));

    let duplicateCount = 1;
    while (await prisma.business.exists({slug: businessSlug})) {
      duplicateCount++;
      businessSlug = slug([item.tags.name, item.tags["addr:city"], duplicateCount].filter(Boolean).join(" "));
    }

    const business = await prisma.$queryRaw(
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
        )`
    );
}