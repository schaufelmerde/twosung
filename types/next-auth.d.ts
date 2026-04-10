import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    customerId: string;
    companyName: string;
    contactName: string;
    phone?: string;
  }

  interface Session {
    user: {
      customerId: string;
      companyName: string;
      contactName: string;
      phone?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    customerId?: string;
    companyName?: string;
    contactName?: string;
    phone?: string;
  }
}
