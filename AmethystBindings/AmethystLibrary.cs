using CppSharp;
using CppSharp.Generators;
using CppSharp.AST;
using System;
using System.Collections.Generic;
using System.IO;
using CppSharp.Parser;
using CppSharp.Passes;

namespace AmethystBindings
{
    class AmethystLibrary : ILibrary
    {
        // Define the base directory paths
        private static readonly string BaseIncludeDir = @"C:\Users\Jesse\fleet\AmethystSharp\AmethystAPI\include";
        private static readonly string BaseSrcDir = @"C:\Users\Jesse\fleet\AmethystSharp\AmethystAPI\src";

        public void Preprocess(Driver driver, ASTContext ctx)
        {
            // Implementation for preprocessing
        }

        public void Postprocess(Driver driver, ASTContext ctx)
        {
            // Implementation for postprocessing
        }

        public void Setup(Driver driver)
{
    var options = driver.Options;
    options.GeneratorKind = GeneratorKind.CSharp;
    options.OutputDir = "Generated";
          
    var parserOptions = driver.ParserOptions;
    parserOptions.AddSystemIncludeDirs(@"C:\Users\Jesse\.nuget\packages\cppsharp\1.1.5.3168\contentFiles\any\any\lib\clang\18\include");
    parserOptions.AddArguments("-fexceptions");
    parserOptions.LanguageVersion = LanguageVersion.CPP23;
    parserOptions.Verbose = true;

    var module = options.AddModule("AmethystAPI");
    module.OutputNamespace = "Amethyst";
    module.IncludeDirs.Add(BaseIncludeDir);
    module.IncludeDirs.Add(Path.Combine(BaseSrcDir, "amethyst-deps"));
    AddSubdirectories(module.IncludeDirs, Path.Combine(BaseSrcDir, "amethyst"));
    AddSubdirectories(module.IncludeDirs, Path.Combine(BaseSrcDir, "minecraft"));

    module.Headers.Add("Actor.hpp");
    module.Headers.Add("Mob.hpp");
    module.Headers.Add("Player.hpp");
    module.Headers.Add("Inventory.hpp");
    module.Headers.Add("EntityContext.hpp");
    module.Headers.Add("EntityId.hpp");
    module.Headers.Add("Item.hpp");
    module.Headers.Add("InputHandler.hpp");
    module.Headers.Add("Camera.hpp");
}

        

        private void AddSubdirectories(IList<string> includeDirs, string rootDir)
        {
            if (Directory.Exists(rootDir))
            {
                foreach (var dir in Directory.EnumerateDirectories(rootDir, "*", SearchOption.AllDirectories))
                {
                    if (dir.Contains("headerIncludes")) return;
                    includeDirs.Add(dir);
                }
                if (Directory.GetFiles(rootDir).Length > 0) includeDirs.Add(rootDir);
            }
        }

        public void SetupPasses(Driver driver)
        {

        }
    }
}
