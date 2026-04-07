import type { SQLDialect } from "@codemirror/lang-sql";
import { MariaSQL, MSSQL, MySQL, PLSQL, PostgreSQL, SQLite, StandardSQL } from "@codemirror/lang-sql";
import type { SqlLanguage } from "sql-formatter";

export type SqlToolDialectId =
  | "standard"
  | "postgresql"
  | "mysql"
  | "mariadb"
  | "sqlite"
  | "mssql"
  | "plsql";

export const sqlToolDialectOrder: SqlToolDialectId[] = [
  "standard",
  "postgresql",
  "mysql",
  "mariadb",
  "sqlite",
  "mssql",
  "plsql",
];

const dialectMap: Record<SqlToolDialectId, { cm: SQLDialect; format: SqlLanguage }> = {
  standard: { cm: StandardSQL, format: "sql" },
  postgresql: { cm: PostgreSQL, format: "postgresql" },
  mysql: { cm: MySQL, format: "mysql" },
  mariadb: { cm: MariaSQL, format: "mariadb" },
  sqlite: { cm: SQLite, format: "sqlite" },
  mssql: { cm: MSSQL, format: "transactsql" },
  plsql: { cm: PLSQL, format: "plsql" },
};

export function getSqlDialectCm(id: SqlToolDialectId): SQLDialect {
  return dialectMap[id].cm;
}

export function getSqlFormatLanguage(id: SqlToolDialectId): SqlLanguage {
  return dialectMap[id].format;
}
