import { clients } from "../../private/clients.js";

export class App {
  client;

  constructor(config) {
    this.config = config;
    this.findClient();
  }

  async changeColor(color) {
    if (color[0] == "#") color = color.substring(1);
    if (color.length != 6) return;
    if (!this.client) await this.findClient();
    await this.client.request("ble", "connect", [this.config.address]);
    await this.client.request("ble", "discover_services", []);
    await this.client.request("ble", "write_to_uuid", [
      0xffd9,
      [
        0x56,
        Number("0x" + color.substring(0, 2)),
        Number("0x" + color.substring(2, 4)),
        Number("0x" + color.substring(4, 6)),
        0x00,
        0xf0,
        0xaa,
      ],
    ]);
  }

  async findClient() {
    clientLoop: for (let clientName in clients) {
      let client = clients[clientName];
      await client.request("ble", "start_scan", []);
      await new Promise((r) => setTimeout(r, 20000));
      let peripherals = (await client.request("ble", "peripherals", [])).result;
      for (let peripheral of peripherals) {
        if (peripheral.address == this.config.address) {
          this.client = client;
          break clientLoop;
        }
      }
    }
  }
}
