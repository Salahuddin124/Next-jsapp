import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

type User = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export const authOptions: AuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        try {
          const response = await axios.post("https://messengerclone-production.up.railway.app/api/users/login", {
            email: credentials.email,
            password: credentials.password,
          });

          const user = response.data.user;
          
          if (user) {
            console.log(user)
            return user;
          } else {
            throw new Error("Invalid credentials");
          }
        } catch (error) {
          console.error("Error during user validation", error);
          throw new Error("Invalid credentials");
        }
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as User).id; // Ensure your user object includes an id field
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as User).id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
