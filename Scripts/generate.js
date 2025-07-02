require('dotenv').config();
const fs = require('fs-extra');
const path = require('path');
const { Configuration, OpenAIApi } = require('openai');

if (!process.env.OPENAI_API_KEY) {
  console.error('🔑 Please set OPENAI_API_KEY in your .env');
  process.exit(1);
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
    const response = await openai.createCompletion({
      model: 'code-davinci-002',
      prompt: file.prompt.trim(),
      max_tokens: 1024,
      temperature: 0.2,
      stop: ['```']
    });

    const code = response.data.choices[0].text;
    await fs.writeFile(outPath, code.trim(), 'utf8');
    console.log(`✅ Wrote ${file.filepath}`);
  }
}

generateFiles().catch(err => {
  console.error('❌ Error generating files:', err);
});
