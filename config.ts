// This file centralizes configuration to resolve import errors.
export const CONFIG = {
  APP: {
    NAME: "SENTINEL",
    SUBTITLE: "CYBER INTELLIGENCE",
    VERSION: "2.5.0",
    THREAT_LEVEL: "ELEVATED (DEFCON 3)",
  },
  USER: {
    NAME: "Adm. S. Connor",
    INITIALS: "SC",
    CLEARANCE: "TS/SCI",
  },
  DATABASE: {
    POSTGRES: {
      HOST: 'localhost',
      USER: 'admin',
      DB_NAME: 'sentinel_core',
      PORT: 5432
    }
  }
};