using CppSharp;
using CppSharp.AST;
using CppSharp.Extensions;
using CppSharp.Passes;

namespace AmethystBindings;

public class HideNativePass : GeneratorOutputPass
{
    public override void VisitConstructor(Block block)
    {
        
        base.VisitConstructor(block);
    }
}
