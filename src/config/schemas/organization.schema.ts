import { z } from 'zod';

export const UserOrganizationSchema = z.object({
  id: z.string().openapi({
    example: '123e4567-e89b-12d3-a456-426614174003',
    description: 'The unique identifier of the user organization relationship.',
  }),
  userId: z.string().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the user.',
  }),
  companyId: z.string().openapi({
    example: '123e4567-e89b-12d3-a456-426614174001',
    description: 'The unique identifier of the company.',
  }),
  role: z
    .object({
      id: z.string().openapi({
        example: '123e4567-e89b-12d3-a456-426614174002',
        description: 'The unique identifier of the role.',
      }),
      name: z.string().openapi({
        example: 'Admin',
        description: 'The name of the role.',
      }),
      description: z.string().nullable().openapi({
        example: 'Administrator role with full permissions.',
        description: 'A description of the role.',
      }),
    })
    .openapi({
      description: 'The role of the user within the company.',
    }),
  joinedAt: z.string().nullable().openapi({
    example: '2026-10-01T12:00:00Z',
    description: 'The timestamp when the user joined the company.',
  }),
});
