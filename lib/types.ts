// lib/types.ts
// Tipos TypeScript centrais do projeto ROTA.
// Espelham exatamente as tabelas do banco MySQL.

// ─── Enums de domínio ─────────────────────────────────────────

export type TipoUsuario = 'TURISTA' | 'EMPRESA' | 'ADMIN';

export type StatusReserva = 'PENDENTE' | 'CONFIRMADA' | 'CANCELADA' | 'CONCLUIDA';

// ─── Entidades do banco ───────────────────────────────────────

export interface Usuario {
  ID_USUARIO:                     number;
  NOME:                           string;
  EMAIL:                          string;
  SENHA_HASH:                     string; // nunca expor ao cliente
  TELEFONE:                       string | null;
  TIPO:                           TipoUsuario;
  CONTATO_EMERGENCIA_NOME:        string | null;
  CONTATO_EMERGENCIA_TELEFONE:    string | null;
  CONTATO_EMERGENCIA_PARENTESCO:  string | null;
  DATA_CADASTRO:                  Date;
}

// Versão segura para retornar ao cliente (sem hash)
export type UsuarioPublico = Omit<Usuario, 'SENHA_HASH'>;

export interface EmpresaTurismo {
  ID_EMPRESA:   number;
  ID_USUARIO:   number;
  CNPJ:         string;
  RAZAO_SOCIAL: string;
}

export interface Regiao {
  ID_REGIAO: number;
  CIDADE:    string;
  ESTADO:    string;
  PAIS:      string;
}

export interface Rota {
  ID_ROTA:         number;
  ID_EMPRESA:      number;
  ID_REGIAO:       number;
  NOME:            string;
  DESCRICAO:       string | null;
  DURACAO:         string | null;
  QUILOMETRAGEM:   number | null;
  MELHOR_PERIODO:  string | null;
  CATEGORIA:       string | null;
  URL_IMAGEM_CAPA: string | null;
  DATA_CADASTRO:   Date;
}

export interface Acomodacao {
  ID_ACOMODACAO:      number;
  ID_REGIAO:          number;
  NOME:               string;
  TIPO:               string;
  DESCRICAO:          string | null;
  CLASSIFICACAO:      number | null;
  PRECO_MEDIO_DIARIA: number | null;
  URL_IMAGEM_CAPA:    string | null;
}

export interface Restaurante {
  ID_RESTAURANTE:  number;
  ID_REGIAO:       number;
  NOME:            string;
  TIPO:            string | null;
  CARACTERISTICAS: string | null;
  PRECO_MEDIO:     number | null;
  URL_IMAGEM_CAPA: string | null;
}

// ─── Tipos de formulários (inputs do usuário) ─────────────────

export interface FormCadastro {
  nome:     string;
  email:    string;
  senha:    string;
  telefone?: string;
  tipo:     TipoUsuario;
  // Campos opcionais para turistas
  contatoEmergenciaNome?:         string;
  contatoEmergenciaTelefone?:     string;
  contatoEmergenciaParentesco?:   string;
  // Campos obrigatórios para empresas
  cnpj?:         string;
  razaoSocial?:  string;
}

export interface FormLogin {
  email: string;
  senha: string;
}

// ─── Extensão do NextAuth (adiciona TIPO e ID à sessão) ────────
// Isso é necessário para que session.user.tipo e session.user.id
// sejam reconhecidos pelo TypeScript.

import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id:    string;
      name:  string;
      email: string;
      tipo:  TipoUsuario;
    };
  }
  interface User {
    id:    string;
    name:  string;
    email: string;
    tipo:  TipoUsuario;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:   string;
    tipo: TipoUsuario;
  }
}