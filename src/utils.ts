import * as fs from 'fs';
import * as http from 'http';
import * as path from 'path';
import * as os from 'os';

function loadConfig() {
  if (os.platform() !== 'linux') {
    throw new Error(`Cannot load service config. This program only runs on Linux for now. Detected OS: ${os.platform()}.`);
  }
  const storagePath = path.resolve('/var/lib/RCE-be'); // flaky af, I know :(
  if (!fs.existsSync(storagePath)) {
    throw new Error(`[config loading] Failed loading config file. Make sure ${storagePath} exists or try running "rce-be-config" to (re)create it.`);
  }

  const feConfigString = fs.readFileSync(storagePath).toString();
  const feConfig = JSON.parse(feConfigString);
  if (!feConfig.host) {
    throw new Error('[config loading] Error while parsing config. Missing field fe.host. Consider running the config wizard again.');
  }

  if (!feConfig.port) {
    throw new Error('[config loading] Error while parsing config. Missing field fe.port. Consider running the config wizard again.');
  }

  return {
    port: feConfig.port,
    host: feConfig.host
  }
}

http.createServer((req, res) => {
  fs.readFile(__dirname + req.url, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
}).listen();