const ts=require('typescript'),fs=require('fs'),Module=require('module');
exports.load=(name)=>{const path=require('path').resolve('src/features/ai-visualizer/'+name+'.ts');const m=new Module(path,module);m._compile(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,path);return m.exports;};
