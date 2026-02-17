import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient().$extends({
  model: {
    $allModels: {
      async exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> {
        const context = Prisma.getExtensionContext(this)
        const result = await (context as any).findFirst({ where })
        return result !== null
      },
    },
  },
});

/*
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})
 */

/*
prisma.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Params: ' + e.params)
  console.log('Duration: ' + e.duration + 'ms')
})
*/
export default prisma