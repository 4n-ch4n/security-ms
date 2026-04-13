import { z } from 'zod';
import { UserOrganizationSchema } from './organization.schema';

export const UserResponseSchema = z.object({
  id: z.string().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the user.',
  }),
  name: z.string().nullable().openapi({
    example: 'John',
    description: 'The first name of the user.',
  }),
  lastName: z.string().nullable().openapi({
    example: 'Doe',
    description: 'The last name of the user.',
  }),
  email: z.email().nullable().openapi({
    example: 'john.doe@example.com',
    description: 'The email address of the user.',
  }),
  phone: z.string().nullable().openapi({
    example: '+1-555-123-4567',
    description: 'The phone number of the user.',
  }),
  isActive: z.boolean().nullable().openapi({
    example: true,
    description: 'Indicates whether the user account is active.',
  }),
  lastLogin: z.string().nullable().openapi({
    example: '2026-10-01T12:00:00Z',
    description: "The timestamp of the user's last login.",
  }),
  createdAt: z.string().nullable().openapi({
    example: '2026-09-01T12:00:00Z',
    description: 'The timestamp when the user account was created.',
  }),
  updatedAt: z.string().nullable().openapi({
    example: '2026-10-01T12:00:00Z',
    description: 'The timestamp when the user account was last updated.',
  }),
  permissions: z.array(z.string()).openapi({
    example: ['read:users', 'write:users'],
    description: 'The permissions assigned to the user.',
  }),
  organizations: z.array(UserOrganizationSchema).openapi({
    example: [
      {
        companyId: '123e4567-e89b-12d3-a456-426614174001',
        role: {
          id: '123e4567-e89b-12d3-a456-426614174002',
          name: 'Admin',
          description: 'Administrator role with full permissions.',
        },
      },
    ],
    description:
      'The organizations the user belongs to, along with their roles.',
  }),
});
