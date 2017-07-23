const d = require('debug')('midi-artnet-node:output');

class Output {
    constructor(config, device) {
        this.config = config;
        this.device = device;
    }

    write(value) {
        if (value === this.lastValue) {
            return;
        }
        this.lastValue = value;
        const status = parseInt(`9${this.config.channel}`, 16); // Only allow notes right now
        const msg = [ status, this.config.note, value ];
        this.device.sendMessage(msg);
    }
}

module.exports = Output;
