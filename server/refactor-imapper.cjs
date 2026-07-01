const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const mappersDir = path.join(srcDir, 'infra', 'mappers');
const appInterfacesDir = path.join(srcDir, 'application', 'interfaces');

if (!fs.existsSync(appInterfacesDir)) {
    fs.mkdirSync(appInterfacesDir, { recursive: true });
}

const oldMapperPath = path.join(mappersDir, 'IMapper.ts');
const newMapperPath = path.join(appInterfacesDir, 'IMapper.ts');

if (fs.existsSync(oldMapperPath)) {
    fs.renameSync(oldMapperPath, newMapperPath);
    console.log('Moved IMapper.ts to application/interfaces/IMapper.ts');
}

// Update all mappers in infra/mappers/
const files = fs.readdirSync(mappersDir).filter(f => f.endsWith('.ts') && f !== 'IMapper.ts');

for (const file of files) {
    const filePath = path.join(mappersDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import { IMapper } from "./IMapper";
    // with import { IMapper } from "../../application/interfaces/IMapper";
    content = content.replace(
        /import\s+{\s*IMapper\s*}\s+from\s+['"]\.\/IMapper['"];?/g,
        'import { IMapper } from "../../application/interfaces/IMapper";'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated imports in ${file}`);
}
