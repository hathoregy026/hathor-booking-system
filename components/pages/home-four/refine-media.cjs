const fs=require('node:fs');const file='app/(public)/home-4/page.tsx';let s=fs.readFileSync(file,'utf8');
s=s.replace('media("home-voyage-nile-majesty","Hathor Dahabiya available for private charter"','media("/media/hathor/r2/cruises-hero.webp","The open deck of Hathor at sunset"');
s=s.replace('media("home-call-to-action","Hathor Dahabiya on the Nile at the end of the day"','media("/media/hathor/r2/about-hero.webp","Lounge chairs on Hathor’s deck beside the Nile"');
s=s.replace('media("scraped-cabin-1","A cabin aboard Hathor Dahabiya"','media("/media/hathor/scraped/cabin-1.webp","A cabin aboard Hathor Dahabiya"');
fs.writeFileSync(file,s);
