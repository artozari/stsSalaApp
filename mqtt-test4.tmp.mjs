import mqtt from 'mqtt';

function run(label, opts) {
  const client = mqtt.connect('ws://sts-santafe.sielcon.net:9104', opts);
  const t0 = Date.now();
  client.on('connect', () => {
    console.log(`[${label}] CONECTADO OK`);
    client.subscribe('sts/dashboard/local/CA_SLCN/#', { qos: 0 }, (err) => {
      console.log(`[${label}] subscribe:`, err ? 'ERR ' + err.message : 'OK');
    });
  });
  let count = 0;
  client.on('message', (topic, payload) => {
    count++;
    console.log(`[${label}] MSG #${count} topic=${topic} len=${payload.length}`);
    if (count === 1) { console.log(`[${label}] sample:`, payload.toString().slice(0, 160)); client.end(true); process.exit(0); }
  });
  client.on('error', (e) => console.log(`[${label}] ERROR:`, e.message));
  client.on('close', () => console.log(`[${label}] close`));
  setTimeout(() => { console.log(`[${label}] TIMEOUT (${Date.now()-t0}ms), msgs=${count}`); client.end(true); }, 12000);
}

run('SIN credenciales', {});
