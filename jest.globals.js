// Jest 29 copies these Node 24 globals as read-only values. The CLI replaces them with JSDOM globals.
for (const name of ['navigator', 'crypto']) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
    if (descriptor && descriptor.configurable && descriptor.writable === false) {
        Object.defineProperty(globalThis, name, {...descriptor, writable: true});
    }
}
