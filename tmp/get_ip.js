const { networkInterfaces } = require('os');

const nets = networkInterfaces();
const results = Object.create(null);

for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
            if (!results[name]) {
                results[name] = [];
            }
            results[name].push(net.address);
        }
    }
}
console.log(Object.values(results).flat().find(ip => ip.startsWith('192.168.') || ip.startsWith('10.')) || '10.0.2.2');
