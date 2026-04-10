import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
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

async function findOrCreateGoogleCustomer(
  email: string,
  name: string
): Promise<CustomerRow> {
  const [rows] = await orderDb.execute<CustomerRow[]>(
    'SELECT customer_id, company_name, contact_name, phone FROM customers WHERE email = ? LIMIT 1',
    [email]
  );
  if (rows[0]) return rows[0];

  const [countRows] = await orderDb.execute<RowDataPacket[]>(
    'SELECT COUNT(*) AS cnt FROM customers'
  );
  const customerId = String(Number(countRows[0].cnt) + 1).padStart(8, '0');

  await orderDb.execute(
    'INSERT INTO customers (customer_id, company_name, contact_name, email) VALUES (?, ?, ?, ?)',
    [customerId, name, name, email]
  );

  return { customer_id: customerId, company_name: name, contact_name: name, phone: null } as CustomerRow;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:       { label: 'Email',        type: 'email' },
        password:    { label: 'Password',     type: 'password' },
        googleToken: { label: 'Google Token', type: 'text' },
      },
      async authorize(credentials) {
        // ── Google Sign-In With Google (GSI) ─────────────────────────
        if (credentials?.googleToken) {
          const res = await fetch(
            `https://oauth2.googleapis.com/tokeninfo?id_token=${credentials.googleToken}`
          );
          if (!res.ok) return null;

          const payload = await res.json();
          if (payload.aud !== process.env.GOOGLE_CLIENT_ID) return null;

          const email: string = payload.email;
          const name: string  = payload.name ?? payload.email;

          const customer = await findOrCreateGoogleCustomer(email, name);

          return {
            id:          customer.customer_id,
            email,
            name:        customer.contact_name,
            customerId:  customer.customer_id,
            companyName: customer.company_name,
            contactName: customer.contact_name,
            phone:       customer.phone ?? undefined,
          };
        }

        // ── Email / password ──────────────────────────────────────────
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
    async jwt({ token, user }) {
      if (user) {
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
