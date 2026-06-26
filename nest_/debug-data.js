const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    console.log('--- CATEGORY DEBUG ---');
    const categories = await prisma.category.findMany({
        where: { name: { contains: 'Watches', mode: 'insensitive' } },
        include: {
            specGroups: {
                include: {
                    specGroup: {
                        include: {
                            specifications: {
                                include: {
                                    specification: true
                                }
                            }
                        }
                    }
                }
            },
            attributes: {
                include: {
                    attribute: {
                        include: {
                            values: true
                        }
                    }
                }
            }
        }
    });

    console.log(`Found ${categories.length} matches for "Watches"`);
    categories.forEach(cat => {
        console.log(`ID: ${cat.id}, Slug: ${cat.slug}, Name: ${cat.name}`);
        console.log(`SpecGroups Count: ${cat.specGroups?.length}`);
        console.log(`Attributes Count: ${cat.attributes?.length}`);
        if (cat.specGroups?.length > 0) {
            console.log('SpecGroups Details:', JSON.stringify(cat.specGroups, (k,v)=>typeof v==='bigint'?v.toString():v, 2));
        }
        console.log('---');
    });
}

run().catch(console.error).finally(() => prisma.$disconnect());
