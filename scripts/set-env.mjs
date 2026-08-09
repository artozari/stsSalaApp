import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const ENV_FILE = '.env';
const OUT_DIR = 'src/environments';
const OUT_FILE = `${OUT_DIR}/environment.ts`;

function parseEnvFile(path) {
  const vars = {};
  if (!existsSync(path)) {
    return vars;
  }
  for (const rawLine of readFileSync(path, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const idx = line.indexOf('=');
    if (idx === -1) {
      continue;
    }
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

const env = parseEnvFile(ENV_FILE);

const content = `/* AUTO-GENERATED from .env — do not edit manually. */
export const environment = {
  mqttUrl: ${JSON.stringify(env.MQTT_URL ?? '')},
  mqttUsername: ${JSON.stringify(env.MQTT_USERNAME ?? '')},
  mqttPassword: ${JSON.stringify(env.MQTT_PASSWORD ?? '')},
  topicStatus: ${JSON.stringify(env.MQTT_TOPIC_STATUS ?? '')},
  topicGames: ${JSON.stringify(env.MQTT_TOPIC_GAMES ?? '')},
  topicStsMesas: ${JSON.stringify(env.MQTT_TOPIC_STS_MESAS ?? '')},
  supabaseUrl: ${JSON.stringify(env.SUPABASE_URL ?? '')},
  supabaseKey: ${JSON.stringify(env.SUPABASE_KEY ?? '')},
};
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, content);
console.log(`✔ ${OUT_FILE} generado desde ${ENV_FILE}`);
