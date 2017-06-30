const convict = require('convict');

module.exports = convict({
    port: {
        doc: "The port to bind the Artnet Server to",
        format: "port",
        default: 6454,
        env: "ARTNET_PORT",
        arg: "port"
    },
    universe: {
        doc: "The Artnet Universe to listen on",
        format: Number,
        default: 0,
        env: "ARTNET_UNIVERSE",
        arg: "universe"
    },
    device: {
        name: {
            doc: "The Name of the Midi Device to use",
            format: String,
            default: "",
            env: "MIDI_DEVICE_NAME",
            arg: "device"
        },
        exact: {
            doc: "Whether the Midi Device Name should match exact",
            format: Boolean,
            default: false,
            env: "MIDI_DEVICE_EXACT_NAME",
            arg: "exact"
        },
        virtual: {
            doc: "Create a virtual Midi Port",
            format: Boolean,
            default: false,
            env: "MIDI_DEVICE_VIRTUAL",
            arg: "virtual"
        }
    },
    ports: {
        doc: "The Midi to Artnet Associations",
        format: Array,
        default: []
    }
});
