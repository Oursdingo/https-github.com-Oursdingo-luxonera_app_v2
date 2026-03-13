import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const testimonials = [
  {
    type: 'CONVERSATION' as const,
    customerName: 'Marc Laurent',
    date: new Date('2024-12-05'),
    conversationImageUrl: '/testimonials/conversations/conversation-1.jpeg',
    platform: 'WHATSAPP' as const,
    featured: false,
    published: true,
  },
  {
    type: 'CONVERSATION' as const,
    customerName: 'Laura Moreau',
    date: new Date('2024-11-20'),
    conversationImageUrl: '/testimonials/conversations/conversation-2.jpeg',
    platform: 'WHATSAPP' as const,
    featured: false,
    published: true,
  },
  {
    type: 'CONVERSATION' as const,
    customerName: 'Pierre Garnier',
    date: new Date('2024-11-10'),
    conversationImageUrl: '/testimonials/conversations/conversation-3.jpeg',
    platform: 'WHATSAPP' as const,
    featured: false,
    published: true,
  },
  {
    type: 'CONVERSATION' as const,
    customerName: 'Sarah Konaté',
    date: new Date('2024-12-20'),
    conversationImageUrl: '/testimonials/conversations/conversation-4.jpeg',
    platform: 'WHATSAPP' as const,
    featured: false,
    published: true,
  },
  {
    type: 'CONVERSATION' as const,
    customerName: 'Ibrahim Traoré',
    date: new Date('2024-12-18'),
    conversationImageUrl: '/testimonials/conversations/conversation-5.jpeg',
    platform: 'WHATSAPP' as const,
    featured: false,
    published: true,
  },
  {
    type: 'CONVERSATION' as const,
    customerName: 'Aminata Ouédraogo',
    date: new Date('2024-12-15'),
    conversationImageUrl: '/testimonials/conversations/conversation-6.jpeg',
    platform: 'WHATSAPP' as const,
    featured: false,
    published: true,
  },
  {
    type: 'CONVERSATION' as const,
    customerName: 'Boubacar Sawadogo',
    date: new Date('2024-12-12'),
    conversationImageUrl: '/testimonials/conversations/conversation-7.jpeg',
    platform: 'WHATSAPP' as const,
    featured: false,
    published: true,
  },
]

async function main() {
  console.log('Seeding testimonials...')

  // Check if testimonials already exist
  const existingCount = await prisma.testimonial.count()
  if (existingCount > 0) {
    console.log(`Found ${existingCount} existing testimonials, skipping seed.`)
    return
  }

  for (const testimonial of testimonials) {
    await prisma.testimonial.create({
      data: testimonial,
    })
    console.log(`Created testimonial for ${testimonial.customerName}`)
  }

  console.log(`Seeded ${testimonials.length} testimonials`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
