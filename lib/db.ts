// lib/db.ts
// Conexão com o banco MySQL hospedado no Aiven.
// Usa pool de conexões (reutiliza conexões — essencial para Serverless/Vercel).
// SSL obrigatório no Aiven: carrega o CA Certificate do arquivo ca.pem.

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

// ─── Lê o certificado CA do Aiven ────────────────────────────
// O arquivo ca.pem fica na raiz do projeto e está no .gitignore.
// Na Vercel, o conteúdo do certificado será fornecido via variável
// de ambiente DB_SSL_CA (veremos isso no deploy).
function getSSLConfig() {
  // Produção (Vercel): usa a variável de ambiente com o conteúdo do cert
  if (process.env.DB_SSL_CA) {
    return { ca: process.env.DB_SSL_CA };
  }

  // Desenvolvimento local: lê o arquivo ca.pem da raiz do projeto
  const caPath = path.join(process.cwd(), 'ca.pem');
  if (fs.existsSync(caPath)) {
    return { ca: fs.readFileSync(caPath) };
  }

  // Fallback: aceita qualquer certificado (não recomendado em produção)
  console.warn('[DB] ca.pem não encontrado — usando rejectUnauthorized: false');
  return { rejectUnauthorized: false };
}

// ─── Pool de conexões ─────────────────────────────────────────
// connectionLimit: 10 conexões simultâneas — bom para desenvolvimento.
// Na Vercel (Serverless), cada função cria seu próprio pool efêmero.
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT),
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:      getSSLConfig(),
  waitForConnections: true,
  connectionLimit:    10,
  timezone:           '+00:00', // UTC — consistente com o Aiven
});

export default pool;