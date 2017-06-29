const { Server } = require('artnet-node');
const { stat, readFile, writeFile } = require('fs');
const program = require('commander');
const each = require('lodash.foreach');
const d = require('debug')('midi-artnet-node');
const package = require('../package.json');
const { output: Output } = require('midi');
const Association = require('./association');

let server;
let associations = [];

program
    .version(package.version)
    .option('--config <file>', 'Config path')
    .option('--device <name>', 'The Midi Device to use')
    .option('-p, --port <port>', 'The Port to run the Artned Node on', parseInt)
    .option('--list', 'List all available Midi Devices')
    .parse(process.argv);

if (program.list) {
    list_devices();
}

function list_devices() {
    const output = new Output();
    const ports = output.getPortCount();
    console.log(`${ports} available Devices:`);
    for (let i = 0; i < ports; i++) {
        console.log(` - ${output.getPortName(i)}`);
    }
    process.exit(0);
}

init();

/**
 * Loads a JSON configuration file
 *
 * @param path [string] The path to the file to load
 * @return a Promise which resolves on successful load and parsing
 */
function loadFile(path) {
    d('Loading File', path);
    return new Promise((resolve, reject) => {
        stat(path, (err, stats) => {
            if (err) {
                console.warn(err);
                return reject(err);
            }
            if (stats.isFile()) {
                readFile(path, 'utf8', (err, data) => {
                    try {
                        d('Parsing File Content');
                        let config = JSON.parse(data);
                        d('File loaded');
                        return resolve(config);
                    }catch (ex) {
                        console.error(ex);
                        return reject(ex);
                    }
                });
            }else {
                return reject();
            }
        });
    });
}

function setupDevice({ device }) {
    const output = new Output();
    if (program.device) {
        if (!openDevice(output, program.device)) {
            console.warn("Midi Device not found");
            process.exit(1);
        }
    }else if (device.virtual) {
        output.openVirtualPort(device.name);
    }else if (!openDevice(output, device.name, device.exact)) {
        console.warn("Midi Device not found"); // @TODO: Poll for device availability
        process.exit(1);
    }
    return output;
}

/**
 * Open a Midi Device with the given name
 *
 * @param output [output] the Midi Output to use
 * @param name [string] the name of the device
 * @param exact [boolean] whether the match needs to be exact or just a substring
 * @return true when a Device with the correct name could be opened, false if not
 */
function openDevice(output, name, exact = false) {
    d(`Trying to open Device ${name} with ${exact ? 'exact match' : 'substring match'}`);
    const ports = output.getPortCount();
    for (let i = 0; i < ports; i++) {
        const deviceName = output.getPortName(i);
        if (exact) {
            if (deviceName === name) {
                output.openPort(i);
                return true;
            }
        }else {
            if (deviceName.includes(name)) {
                output.openPort(i);
                return true;
            }
        }
    }
    return false;
}

function setup(config) {
    const device = setupDevice(config);
    if (config.ports) {
        each(config.ports, association => {
            associations.push(new Association(association, device));
        });
    }
    return config;
}

function init() {
    loadFile(program.config || 'config.json')
        .then(setup)
        .then(config => {
            const port = program.port || config.port;
            d('listening on port', port)
            server = Server.listen(port, (data, peer) => {
                d('Incoming Message from peer', peer.address);
                handleMessage(data, config);
            });
        })
        .catch(err => {
            console.error(err);
            process.exit(1)
        });
}

function handleMessage(msg, config) {
    if (msg.universe === config.universe) {
        for (let i = 0; i < msg.data.length; i++) {
            let value = msg.data.readUInt8(i);
            each(associations, association => association.handle(i + 1, value));
        }
    }
}
