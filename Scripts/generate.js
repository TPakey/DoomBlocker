require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const { OpenAI } = require('openai');

if (!process.env.OPENAI_API_KEY) {
  console.error('🔑 Please set OPENAI_API_KEY in your .env');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const filesToGenerate = [
  {
    filepath: 'Sources/DoomBlocker/Managers/PermissionManager.swift',
    prompt: `
Write a Swift file named PermissionManager.swift for an iOS 15+ SwiftUI app called DoomBlocker.
It should:
- Import DeviceActivity and ManagedSettings.
- Expose functions: requestAuthorization(), authorizationStatus() -> DeviceActivityAuthorizationStatus, and a Combine publisher for status changes.
- Use Apple's DeviceActivity framework to request and monitor Screen Time (Device Activity) permission.
- Be well commented for integration into MVVM (i.e. used by a PermissionsViewModel).
`
  }
  // Future entries go here for ActivityMonitor.swift, etc.
];

async function generateFiles() {
  for (const file of filesToGenerate) {
    const outPath = path.resolve(file.filepath);
    await fs.ensureDir(path.dirname(outPath));

    console.log(`⏳ Generating ${file.filepath}…`);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that writes Swift code.' },
        { role: 'user', content: file.prompt.trim() }
      ],
      max_tokens: 1200,
      temperature: 0.2,
    });

    // The new client returns content here:
    const code = response.choices[0].message.content;
    await fs.writeFile(outPath, code.trim(), 'utf8');
    console.log(`✅ Wrote ${file.filepath}`);
  }
}

generateFiles().catch(err => {
  console.error('❌ Error generating files:', err);
});
