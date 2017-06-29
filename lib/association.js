const each = require('lodash.foreach');
const Output = require('./output');
const d = require('debug')('midi-artnet-node:association');

class Association {
    constructor(config, device) {
        if (Array.isArray(config.dmx)) {
            this.inputs = config.dmx
        }else {
            this.inputs = [config.dmx];
        }
        this.outputs = [];
        if (!Array.isArray(config.midi)) {
            config.midi = [config.midi];
        }
        each(config.midi, midi => {
            this.outputs.push(new Output(midi, device));
        });
    }

    handle(dmx, value) {
        if (this.inputs.includes(dmx)) {
            d(`Setting DMX Port ${dmx} to ${value}`);
            this.write(value);
        }
    }

    write(value) {
        each(this.outputs, output => {
            output.write(value);
        });
    }
}


module.exports = Association;
