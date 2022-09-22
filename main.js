import { clients } from "../../private/clients.js";

export class App {
  client;

  constructor(config) {
    this.config = config;
    this.findClient();
  }

  async changeColor(r, g, b) {
    if (!this.client) await this.findClient();
    await this.client.request("ble", "connect", [this.config.address]);
    await this.client.request("ble", "discover_services", []);
    await this.client.request("ble", "write_to_uuid", [
      0xffd9,
      [
        0x56,
        Number("0x" + r),
        Number("0x" + g),
        Number("0x" + b),
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
