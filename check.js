const ts = require('typescript');
const program = ts.createProgram(['app/courses/[slug]/page.tsx'], { jsx: ts.JsxEmit.ReactJSX, noEmit: true, strict: false });
const diagnostics = ts.getPreEmitDiagnostics(program);
diagnostics.forEach(d => {
    if (d.file && d.file.fileName.includes('[slug]/page.tsx')) {
        const { line, character } = ts.getLineAndCharacterOfPosition(d.file, d.start);
        console.log(`Line ${line + 1}, Col ${character + 1}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`);
    }
});
