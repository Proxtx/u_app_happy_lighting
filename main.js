import { clients, refreshClients } from "../../private/clients.js";

export class App {
  client;
  on = false;

  constructor(config) {
    this.config = config;
    this.findClient();
  }

  async party(count) {
    for (let c = 0; c < count; c++) {
      await this.changeColor(getRandomColor());
      await new Promise((r) => setTimeout(r, 100));
    }
  }

  async changeColor(color) {
    if (color[0] == "#") color = color.substring(1);
    if (color.length != 6) return false;
    if (!this.client) await this.findClient();
    if (!this.client) return "Can't find client in reach of device.";
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

  async turnOn() {
    if (!this.client) await this.findClient();
    if (!this.client) return "Can't find client in reach of device.";
    await this.client.request("ble", "connect", [this.config.address]);
    await this.client.request("ble", "discover_services", []);
    await this.client.request("ble", "write_to_uuid", [
      0xffd9,
      [0xcc, 0x23, 0x33],
    ]);

    on = true;
  }

  async turnOff() {
    if (!this.client) await this.findClient();
    if (!this.client) return "Can't find client in reach of device.";
    await this.client.request("ble", "connect", [this.config.address]);
    await this.client.request("ble", "discover_services", []);
    await this.client.request("ble", "write_to_uuid", [
      0xffd9,
      [0xcc, 0x24, 0x33],
    ]);

    on = false;
  }

  async findClient() {
    await refreshClients();
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

  isOn() {
    return this.on();
  }
}

const getRandomColor = () => {
  return "#000000".replace(/0/g, function () {
    return (~~(Math.random() * 16)).toString(16);
  });
};
