import { PrismaClient } from '@prisma/client'
import { watches } from '../src/data/products'
import { testimonials as testimonialsData } from '../src/data/testimonials'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // 1. Create Admin User
  console.log('Creating admin user...')
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@luxonera.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@luxonera.com',
      password: hashedPassword,
      name: 'Admin Luxonera',
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // 2. Extract unique brands and collections from static data
  const uniqueBrands = [...new Set(watches.map(w => w.brand))]
  const uniqueCollections = [...new Set(watches.map(w => w.collection))]

  console.log(`Found ${uniqueBrands.length} brands and ${uniqueCollections.length} collections`)

  // 3. Create Brands
  const brandMap = new Map<string, string>() // name -> id
  for (const brandName of uniqueBrands) {
    const brand = await prisma.brand.upsert({
      where: { name: brandName },
      update: {},
      create: {
        name: brandName,
        slug: brandName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      },
    })
    brandMap.set(brandName, brand.id)
  }
  console.log(`✅ Created ${uniqueBrands.length} brands`)

  // 4. Create Collections
  const collectionMap = new Map<string, string>() // name -> id
  for (const [index, collectionName] of uniqueCollections.entries()) {
    const collection = await prisma.collection.upsert({
      where: { name: collectionName },
      update: {},
      create: {
        name: collectionName,
        slug: collectionName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        featured: index < 4, // First 4 collections are featured
        order: index,
      },
    })
    collectionMap.set(collectionName, collection.id)
  }
  console.log(`✅ Created ${uniqueCollections.length} collections`)

  // 5. Migrate Products
  console.log('Migrating products...')
  let productCount = 0
  for (const watch of watches) {
    const brandId = brandMap.get(watch.brand)
    const collectionId = collectionMap.get(watch.collection)

    if (!brandId || !collectionId) {
      console.warn(`⚠️ Skipping product ${watch.name}: missing brand or collection`)
      continue
    }

    await prisma.product.upsert({
      where: { slug: watch.id },
      update: {},
      create: {
        slug: watch.id,
        name: watch.name,
        description: watch.description,
        price: watch.price,
        currency: watch.currency,
        color: watch.color,
        brandId,
        collectionId,
        mainImage: watch.images.main,
        galleryImages: watch.images.gallery || [],
        lifestyleImages: watch.images.lifestyle || [],
        specifications: watch.specifications || {},
        stockQuantity: watch.inStock ? 10 : 0, // Default stock: 10 if in stock
        trackInventory: true,
        featured: watch.featured,
        published: true,
        model3d: watch.model3d,
      },
    })
    productCount++
  }
  console.log(`✅ Migrated ${productCount} products`)

  // 6. Migrate Testimonials
  console.log('Migrating testimonials...')
  let testimonialCount = 0
  for (const testimonial of testimonialsData) {
    await prisma.testimonial.upsert({
      where: { id: testimonial.id },
      update: {},
      create: {
        id: testimonial.id,
        type: testimonial.type.toUpperCase() as any,
        customerName: testimonial.customerName,
        date: new Date(testimonial.date),
        rating: testimonial.rating,
        text: testimonial.text,
        collection: testimonial.collection,
        imageUrl: testimonial.imageUrl,
        videoUrl: testimonial.videoUrl,
        thumbnailUrl: testimonial.thumbnailUrl,
        conversationImageUrl: testimonial.conversationImageUrl,
        platform: testimonial.platform?.toUpperCase() as any,
        verified: testimonial.verified || false,
        featured: testimonial.featured || false,
        published: true,
      },
    })
    testimonialCount++
  }
  console.log(`✅ Migrated ${testimonialCount} testimonials`)

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
