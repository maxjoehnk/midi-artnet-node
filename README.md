# midi-artnet-node
Bind one or multiple Midi Devices to an Artnet Node

# Example Configuration
````javascript
{
    "port": 6453, // Default: 6454
    "universe": 0, // Default: 0
    "device": {
        "name": "<Midi Device>", // The Midi Device to connect to
        "exact": false, // Match the name exactly (Default: false)
        "virtual": false // Create a new Virtual Midi Device with the given name (Default: false)
    },
    "ports": []
}
````
