// lib/auth.ts
// Configuração central do NextAuth.js para o projeto ROTA.
// CORRIGIDO: sem 'any' — usa RowDataPacket do mysql2 para tipagem correta.

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import type { RowDataPacket } from 'mysql2';
import pool from '@/lib/db';
import type { TipoUsuario } from '@/lib/types';

// Tipo que espelha as colunas retornadas pela query de login.
// Estende RowDataPacket (interface base do mysql2 para linhas de resultado).
interface UsuarioRow extends RowDataPacket {
  ID_USUARIO: number;
  NOME:       string;
  EMAIL:      string;
  SENHA_HASH: string;
  TIPO:       TipoUsuario;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email'    },
        senha: { label: 'Senha', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          throw new Error('Email e senha são obrigatórios.');
        }

        // Tipamos o resultado como UsuarioRow[] — sem 'any'
        const [rows] = await pool.execute<UsuarioRow[]>(
          `SELECT ID_USUARIO, NOME, EMAIL, SENHA_HASH, TIPO
           FROM TABELA_USUARIOS
           WHERE EMAIL = ?
           LIMIT 1`,
          [credentials.email.toLowerCase().trim()]
        );

        const usuario = rows[0];

        if (!usuario) {
          throw new Error('E-mail ou senha incorretos.');
        }

        const senhaValida = await bcrypt.compare(
          credentials.senha,
          usuario.SENHA_HASH
        );

        if (!senhaValida) {
          throw new Error('E-mail ou senha incorretos.');
        }

        // Nunca retorne SENHA_HASH ao NextAuth
        return {
          id:    String(usuario.ID_USUARIO),
          name:  usuario.NOME,
          email: usuario.EMAIL,
          tipo:  usuario.TIPO,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.tipo = user.tipo;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id   = token.id;
        session.user.tipo = token.tipo;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/login',
    error:  '/auth/login',
  },

  session: {
    strategy: 'jwt',
    maxAge:   60 * 60 * 24 * 7,
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug:  process.env.NODE_ENV === 'development',
};