let debug = false;
for (const arg of process.argv) {
    if (arg === '--debug') debug = true;
}

export const args = {
    debug
};
