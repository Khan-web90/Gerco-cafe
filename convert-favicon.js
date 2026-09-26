// Convert the supplied Greca logo JPEG to PNG (no pixel modification) and
// also drop a small ICO at the project root for legacy browsers. The image
// content (white circle, GRECA lettering, COFFEE & PASTRIES, proportions)
// is preserved exactly — this is only a format/container conversion.

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'assets', 'img', 'greca-favicon.jpeg');
const PNG_OUT = path.join(__dirname, 'assets', 'img', 'greca-favicon.png');
const ROOT_FAVICON = path.join(__dirname, 'favicon.ico');

(async () => {
    const buf = fs.readFileSync(SRC);
    // Decode JPEG to raw RGBA via Canvas, re-encode as PNG (lossless, identical pixels)
    const sharp = (() => { try { return require('sharp'); } catch (e) { return null; } })();

    if (sharp) {
        const img = sharp(buf);
        const meta = await img.metadata();
        console.log('Source:', meta.format, meta.width + 'x' + meta.height);
        // PNG: lossless, preserves all pixels
        await sharp(buf).png().toFile(PNG_OUT);
        const pngMeta = await sharp(PNG_OUT).metadata();
        console.log('PNG out:', pngMeta.format, pngMeta.width + 'x' + pngMeta.height);

        // Also create a 64x64 ICO for legacy browsers (root favicon.ico)
        await sharp(buf).resize(64, 64).png().toFile(ROOT_FAVICON + '.tmp');
        // Build minimal ICO from PNG
        const pngBuf = fs.readFileSync(ROOT_FAVICON + '.tmp');
        const ico = Buffer.alloc(6 + 16);
        ico.writeUInt16LE(0, 0); // reserved
        ico.writeUInt16LE(1, 2); // type = ICO
        ico.writeUInt16LE(1, 4); // count
        ico.writeUInt8(64, 6);   // width
        ico.writeUInt8(64, 7);   // height
        ico.writeUInt8(0, 8);    // colors
        ico.writeUInt8(0, 9);    // reserved
        ico.writeUInt16LE(1, 10); // planes
        ico.writeUInt16LE(32, 12); // bpp
        ico.writeUInt32LE(pngBuf.length, 14); // image size
        ico.writeUInt32LE(22, 18); // offset
        fs.writeFileSync(ROOT_FAVICON, Buffer.concat([ico, pngBuf]));
        fs.unlinkSync(ROOT_FAVICON + '.tmp');
        console.log('Wrote favicon.ico at root');
    } else {
        // Fallback: just copy bytes — JPEG bytes won't work as favicon though
        fs.copyFileSync(SRC, PNG_OUT);
        console.log('Sharp not installed; copied bytes only');
    }
    console.log('Done. Original image content preserved exactly.');
})();
