// Try to fetch the Instagram profile picture using built-in fetch (Node 18+).
// Falls back to copying the user's uploaded image (which IS the same IG logo,
// confirmed by og:image meta tag) if Instagram CDN blocks.

const fs = require('fs');
const https = require('https');
const path = require('path');
const { URL } = require('url');

const URLs = [
    'https://scontent.cdninstagram.com/v/t51.82787-19/702277914_18024417182657628_7979776406200664444_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=105&ccb=7-5&_nc_sid=bf7eb4&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=h9RG6gxsVjEQ7kNvwHRE6Xj&_nc_oc=Adr6AHGRtMhyY-66gwvXvTiaFXsJKbe-ytShexduji-r5nCZPzzDXSFD9HYmwZrJPH4&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_ss=7ba8c&oh=00_AQJXNC_rAcv22uN79wsnnhmxZXdVmrtc60qFIpDr8R9NwA&oe=6ABEA538'
];

(async () => {
    let downloaded = false;
    for (const u of URLs) {
        try {
            console.log('Trying', u.slice(0, 80) + '...');
            const r = await fetch(u, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept': 'image/avif,image/webp,image/*,*/*;q=0.8',
                    'Referer': 'https://www.instagram.com/',
                    'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", ";Not A Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                },
                redirect: 'follow',
            });
            if (!r.ok) {
                console.log('  HTTP', r.status);
                continue;
            }
            const ab = await r.arrayBuffer();
            const buf = Buffer.from(ab);
            const dst = path.join(__dirname, 'assets', 'img', 'greca-instagram-profile.jpg');
            fs.writeFileSync(dst, buf);
            console.log('  Downloaded', buf.length, 'bytes →', dst);
            downloaded = true;
            break;
        } catch (e) {
            console.log('  Error:', e.message);
        }
    }

    if (!downloaded) {
        console.log('\nDirect download blocked. Falling back to user-uploaded image (which IS the IG profile picture, verified by og:image meta tag).');
        const src = path.join(__dirname, 'assets', 'img', 'greca-favicon.jpeg');
        const dst = path.join(__dirname, 'assets', 'img', 'greca-instagram-profile.jpg');
        fs.copyFileSync(src, dst);
        console.log('Copied', src, '→', dst);
    }

    const finalPath = path.join(__dirname, 'assets', 'img', 'greca-instagram-profile.jpg');
    const stat = fs.statSync(finalPath);
    console.log('\nFinal:', finalPath, '-', stat.size, 'bytes');
})();
