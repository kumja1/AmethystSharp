import { join } from "path";
import fs from "fs/promises";
import {processDirectory} from "./generate_header_exports";

(async ()=> {
    const amethystPath = join(process.cwd(),'vendors/Amethyst/AmethystAPI');
    const cmakePath = join(amethystPath, 'CMakeLists.txt');
    let cmakeFile = await fs.readFile(cmakePath,'utf8');
    cmakeFile = "project(AmethystAPI C CXX ASM_NASM)\n" + cmakeFile.substring(1);
    cmakeFile.replace(/add_library\s*\(\s*AmethystAPI\s+(\w+)\s*\s*([^)]+)\)/gm,(match,libraryType,parameterEnd)=>{
    if (libraryType === "STATIC") return `add_library(AmethystAPI SHARED ${parameterEnd})`
        return match;
    })
    await fs.writeFile(cmakePath, cmakeFile);
    await processDirectory(join(amethystPath,'src'));
})()