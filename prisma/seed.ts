import { seedDatabase } from '../lib/database'

async function main() {
  console.log('Seeding database...')
  await seedDatabase()
  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
