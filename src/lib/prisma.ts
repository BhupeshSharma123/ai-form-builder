// Prisma client - using Supabase client directly for database operations
// This file is kept for compatibility but Prisma is not actively used

// Export a dummy prisma client that won't crash
export const prisma = {
  user: { findUnique: () => null, update: () => null },
  form: { findUnique: () => null, findMany: () => [], create: () => null, update: () => null },
  response: { create: () => null },
};

export default prisma;