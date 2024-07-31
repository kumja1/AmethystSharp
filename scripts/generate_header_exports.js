import fs from 'fs/promises';
import path from 'path';

const config = {
    skipDirectories: ['amethyst-deps', 'gamerefs','threading','utility','headerIncludes','file','string','container'],
    skipFiles: ['Utility.hpp','MinecraftVtables.hpp', 'SharedPtr.hpp', 'Config.hpp','MinecraftPackageInfo.hpp','Memory.hpp','expected.hpp'],
    skipDeclarations: ['function_id','InitializeConsole','HideConsole','DestroyConsole','_Assert']
};

const binding_targets = [];

const patterns = [
    {regex: /\b(class|struct|enum)\s+(class\s+)?(\w+)/g, type: 'class_struct_enum'},
    {
        regex: /namespace\s+(\w+)\s*{((?:[^{}]*|{(?:[^{}]*|{[^{}]*})*})*?)}/g,
        type: 'namespace'
    },
];

async function processFile(filePath) {
    try {
        let content = await fs.readFile(filePath, 'utf8');
        const fileName = path.basename(filePath)
        // Remove using directives
        content = content.replace(/^using\s+.*?;/gm, '');

        patterns.forEach(({regex, type}) => {
            content = content.replace(regex, (match, ...args) => {
                if (match.includes('__declspec(dllexport)') || (args[2] && config.skipDeclarations.includes(args[2]))) {
                    return match;
                }
                if (type === 'class_struct_enum') {
                    const [keyword, enumClass, name] = args;
                    if (enumClass) {
                        return `${keyword} ${enumClass} __declspec(dllexport) ${name}`;
                    }
                    return `${keyword} __declspec(dllexport) ${name}`;
                }
                if (type === 'namespace') {
                    const [namespaceName, namespaceContent] = args;
                    const modifiedContent = namespaceContent.replace(
                      /(?:(__declspec\s*\(\s*dllexport\s*\)\s*)?\s*)?(?:template\s*<[^>]*>\s*)?(?:inline\s+)?(static\s+)?(?:\[\[[^\]]+\]\]\s*)?(?:const\s+)?((?:(?!class|struct|enum)\w+(?:\s*<[^>]*>)?(?:\s*&)?)\s+)(\w+)\s*(\([^)]*\))\s*(?:const)?\s*(?:noexcept)?\s*(?:;|(?={))/g,
                        (match,declspec, staticSpec, returnType, funcName, params) => {
                           // TODO: Create export wrapper for static functions
                            if (staticSpec) return;
                            if (config.skipDeclarations.includes(funcName) || declspec) {
                                return match;
                            }
                            return `__declspec(dllexport) ${returnType.trim()}${funcName}${params}`;
                        }
                    );
                    return `namespace ${namespaceName} {${modifiedContent}}`;
                }
                return match;
            });
        });

        // await fs.writeFile(filePath, content, 'utf8');
        binding_targets.push(fileName);
        console.log(`Processed ${filePath}`);
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
    }
}

export async function processDirectory(directoryPath) {
    try {
        const entries = await fs.readdir(directoryPath, {withFileTypes: true});
        for (const entry of entries) {
            const fullPath = path.join(directoryPath, entry.name);
            if (entry.isDirectory()) {
                if (!config.skipDirectories.includes(entry.name)) {
                    await processDirectory(fullPath);
                }
            } else if (fullPath.endsWith('.hpp') && !config.skipFiles.includes(entry.name)) {
                await processFile(fullPath);
            }
        }
        // console.log(`Processing ${directoryPath} complete`);
    } catch (error) {
        console.error(`Error processing directory ${directoryPath}:`, error);
    }
}

await processDirectory(process.argv[2])
