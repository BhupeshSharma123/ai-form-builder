const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Create tables using raw SQL
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        avatar TEXT,
        ai_credits INTEGER DEFAULT 50,
        plan TEXT DEFAULT 'FREE',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Users table created');

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS forms (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        sections JSONB DEFAULT '[]',
        settings JSONB DEFAULT '{}',
        status TEXT DEFAULT 'DRAFT',
        is_template BOOLEAN DEFAULT FALSE,
        category TEXT,
        share_url TEXT UNIQUE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Forms table created');

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS responses (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
        data JSONB DEFAULT '{}',
        ip_address TEXT,
        user_agent TEXT,
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Responses table created');

    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_responses_form_id ON responses(form_id);`);
    console.log('✅ Indexes created');

    console.log('\n🎉 Database setup complete!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
