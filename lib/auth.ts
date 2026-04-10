import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { orderDb } from './db';
import type { RowDataPacket } from 'mysql2';

interface AuthRow extends RowDataPacket {
  auth_id: number;
  customer_id: string;
  email: string;
  password_hash: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
}

interface CustomerRow extends RowDataPacket {
  customer_id: string;
  company_name: string;
  contact_name: string;
  phone: string | null;
}

async function findOrCreateGoogleCustomer(email: string, name: string | null): Promise<CustomerRow> {
  const [rows] = await orderDb.execute<CustomerRow[]>(
    'SELECT customer_id, company_name, contact_name, phone FROM customers WHERE email = ? LIMIT 1',
    [email]
  );
  if (rows[0]) return rows[0];

  const [countRows] = await orderDb.execute<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM customers');
  const next = Number(countRows[0].cnt) + 1;
  const customerId = `CUST-${String(next).padStart(4, '0')}`;
  const displayName = name ?? email;

  await orderDb.execute(
    'INSERT INTO customers (customer_id, company_name, contact_name, email) VALUES (?, ?, ?, ?)',
    [customerId, displayName, displayName, email]
  );

  return { customer_id: customerId, company_name: displayName, contact_name: displayName, phone: null } as CustomerRow;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [rows] = await orderDb.execute<AuthRow[]>(
          `SELECT ua.auth_id, ua.customer_id, ua.email, ua.password_hash,
                  c.company_name, c.contact_name, c.phone
           FROM user_auth ua
           JOIN customers c ON ua.customer_id = c.customer_id
           WHERE ua.email = ?
           LIMIT 1`,
          [credentials.email]
        );

        const row = rows[0];
        if (!row) return null;

        const valid = await bcrypt.compare(credentials.password, row.password_hash);
        if (!valid) return null;

        // Record last login (fire-and-forget)
        orderDb.execute(
          'UPDATE user_auth SET last_login = NOW() WHERE auth_id = ?',
          [row.auth_id]
        ).catch(() => {});

        return {
          id:          row.customer_id,
          email:       row.email,
          name:        row.contact_name,
          customerId:  row.customer_id,
          companyName: row.company_name,
          contactName: row.contact_name,
          phone:       row.phone ?? undefined,
        };
      },
    }),
  ],

  session: { strategy: 'jwt' },

  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider === 'google' && user.email) {
        await findOrCreateGoogleCustomer(user.email, user.name ?? null);
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (account?.provider === 'google' && token.email) {
        const customer = await findOrCreateGoogleCustomer(token.email, token.name ?? null);
        token.customerId  = customer.customer_id;
        token.companyName = customer.company_name;
        token.contactName = customer.contact_name;
        token.phone       = customer.phone ?? undefined;
      } else if (user) {
        const u = user as typeof user & {
          customerId: string;
          companyName: string;
          contactName: string;
          phone?: string;
        };
        token.customerId  = u.customerId;
        token.companyName = u.companyName;
        token.contactName = u.contactName;
        token.phone       = u.phone;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.customerId  = token.customerId  as string;
      session.user.companyName = token.companyName as string;
      session.user.contactName = token.contactName as string;
      session.user.phone       = token.phone       as string | undefined;
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};
