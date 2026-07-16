import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: any = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
      authorization: {
        params: {
          scope: 'read:user user:email repo read:project',
          prompt: 'consent',
        },
      },
    }),
    CredentialsProvider({
      name: "Personal Access Token",
      credentials: {
        pat: { label: "PAT", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.pat) return null;
        const res = await fetch("https://api.github.com/user", {
          headers: { Authorization: `token ${credentials.pat}` }
        });
        if (!res.ok) return null;
        const profile = await res.json();
        
        const email = profile.email || `${profile.login}@users.noreply.github.com`;
        
        const user = await prisma.user.upsert({
          where: { email },
          update: { name: profile.name, image: profile.avatar_url },
          create: {
            email,
            name: profile.name || profile.login,
            image: profile.avatar_url
          }
        });
        
        return { ...user, pat: credentials.pat };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (account && account.provider === 'github') {
        token.accessToken = account.access_token;
        // Upsert account access token
        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            }
          },
          create: {
            userId: user?.id || token.sub,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            scope: account.scope,
          },
          update: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            scope: account.scope,
          }
        }).catch(() => {});
      }
      if (user) {
        token.id = user.id;
        if (user.pat) token.pat = user.pat;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user.id = token.id || token.sub;
      session.accessToken = token.pat || token.accessToken;
      return session;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
