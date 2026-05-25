const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const bundlePath = path.join(__dirname, 'Надежда Коновалова - фотограф.html');
const indexPath = path.join(__dirname, 'index.html');

console.log('Starting bundle update...');

// 1. Read files
if (!fs.existsSync(bundlePath)) {
  console.error(`Error: Bundle not found at ${bundlePath}`);
  process.exit(1);
}
if (!fs.existsSync(indexPath)) {
  console.error(`Error: index.html not found at ${indexPath}`);
  process.exit(1);
}

const originalBundleHtml = fs.readFileSync(bundlePath, 'utf8');
const currentIndexHtml = fs.readFileSync(indexPath, 'utf8');

// 2. Extract manifest and template from original bundle
const manifestMatch = originalBundleHtml.match(/<script type="__bundler\/manifest">([\s\S]*?)<\/script>/);
if (!manifestMatch) {
  console.error('Error: Manifest tag not found in bundle');
  process.exit(1);
}
const manifest = JSON.parse(manifestMatch[1].trim());

const templateMatch = originalBundleHtml.match(/<script type="__bundler\/template">([\s\S]*?)<\/script>/);
if (!templateMatch) {
  console.error('Error: Template tag not found in bundle');
  process.exit(1);
}
const oldTemplate = JSON.parse(templateMatch[1].trim());

// 3. Extract fonts style block from old template
const fontsStyleMatch = oldTemplate.match(/<style>\/\* cyrillic-ext \*\/[\s\S]*?<\/style>/);
if (!fontsStyleMatch) {
  console.warn('Warning: Fonts style block not found in old template.');
}

// 4. Map files to their UUIDs
const fileMap = {
  'tweaks-panel.jsx': '198eb27d-21d1-4d3c-90fa-c1d02bad09c3',
  'placeholders.jsx': '8404a4d1-10ca-4500-8ef4-af633529886c',
  'sections.jsx': '73eefe2a-71f6-4ab0-8434-9992590ecb7e',
  'app.jsx': '3682dfcf-7c04-4e5a-b7f0-4227f4d1bcfa'
};

// 5. Read, compress, and update the JSX files in the manifest
for (const [filename, uuid] of Object.entries(fileMap)) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: JSX file ${filename} not found`);
    process.exit(1);
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Compress using gzip
  const compressedBuffer = zlib.gzipSync(Buffer.from(content, 'utf8'));
  const base64Data = compressedBuffer.toString('base64');
  
  if (manifest[uuid]) {
    manifest[uuid].data = base64Data;
    manifest[uuid].compressed = true;
    console.log(`Updated manifest entry for ${filename} (${uuid})`);
  } else {
    console.error(`Error: UUID ${uuid} not found in manifest for file ${filename}`);
    process.exit(1);
  }
}

// 6. Generate the new template based on index.html
let newTemplate = currentIndexHtml;

// Replace Google font link tag with the inlined fonts style block to maintain self-contained offline fonts
if (fontsStyleMatch) {
  const fontLinkPattern = /<link\s+rel="stylesheet"\s+href="https:\/\/fonts\.googleapis\.com\/css2\?family=Cormorant\+Garamond[\s\S]*?"\s*\/?>/i;
  const fontLinkMatch = newTemplate.match(fontLinkPattern);
  if (fontLinkMatch) {
    newTemplate = newTemplate.replace(fontLinkMatch[0], fontsStyleMatch[0]);
    console.log('Replaced Google Fonts link tag with local inlined fonts style block in the template');
  } else {
    console.warn('Google Font link tag not matched in index.html, inserting fonts before first style tag.');
    newTemplate = newTemplate.replace('<style>', fontsStyleMatch[0] + '\n<style>');
  }
}

// Replace static CDN scripts and JSX scripts with UUIDs in the template
const replacements = [
  { from: 'src="https://unpkg.com/react@18.3.1/umd/react.development.js"', to: 'src="78250960-ec52-415f-bb93-5f8320bafc70"' },
  { from: 'src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"', to: 'src="03098c08-2655-46ce-a744-ae79a7493847"' },
  { from: 'src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"', to: 'src="0208e6e4-0ed7-4dac-96f2-29bf533411ef"' },
  { from: 'src="tweaks-panel.jsx"', to: 'src="198eb27d-21d1-4d3c-90fa-c1d02bad09c3"' },
  { from: 'src="placeholders.jsx"', to: 'src="8404a4d1-10ca-4500-8ef4-af633529886c"' },
  { from: 'src="sections.jsx"', to: 'src="73eefe2a-71f6-4ab0-8434-9992590ecb7e"' },
  { from: 'src="app.jsx"', to: 'src="3682dfcf-7c04-4e5a-b7f0-4227f4d1bcfa"' }
];

replacements.forEach(({ from, to }) => {
  if (newTemplate.includes(from)) {
    newTemplate = newTemplate.split(from).join(to);
    console.log(`Replaced ${from} with ${to} in template`);
  } else {
    console.warn(`Warning: Template search pattern not found: ${from}`);
  }
});

// 7. Format index.html script tag integrity checks in template (Integrity tags need to match those in index.html)
// Wait! Let's ensure the integrity attributes in template match the bundle's integrity requirements.
// The index.html has integrity and crossorigin on CDN scripts, but the bundler removes integrity/crossorigin dynamically inside file:// anyway.
// So keeping them or removing them is fine. The replacement of src tags is exactly correct.

// 8. Rebuild the final bundle HTML content
const updatedManifestStr = JSON.stringify(manifest, null, 2);
const updatedTemplateStr = JSON.stringify(newTemplate);

let updatedBundleHtml = originalBundleHtml;

// Replace manifest content
updatedBundleHtml = updatedBundleHtml.replace(
  /<script type="__bundler\/manifest">[\s\S]*?<\/script>/,
  `<script type="__bundler/manifest">\n${updatedManifestStr}\n</script>`
);

// Replace template content
updatedBundleHtml = updatedBundleHtml.replace(
  /<script type="__bundler\/template">[\s\S]*?<\/script>/,
  `<script type="__bundler/template">\n${updatedTemplateStr}\n</script>`
);

// 9. Write the final bundle HTML file back to disk
fs.writeFileSync(bundlePath, updatedBundleHtml, 'utf8');

console.log('Bundle updated successfully!');
