const osu = require('node-os-utils');

console.log('CPU Count:', osu.cpu.count());
osu.cpu.usage().then((e) => {
  console.log('CPU Usage:', e);
});
osu.mem.used().then((e) => {
  console.log('MEM:', e.usedMemMb / 1024);
});
