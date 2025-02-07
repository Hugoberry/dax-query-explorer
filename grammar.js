// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
function id(x) { return x[0]; }

import moo from 'moo';
const lexer = moo.compile({
    ws:         /[ \t]+/,
    opType:     /RelLogOp|ScaLogOp|IterPhyOp|LookupPhyOp|SpoolPhyOp/,
    colon:      /:/,
    lineRange:  /\d+-\d+/,
    float:      /\d*\.\d+/,
    integer:    /\d+/,
    hashAttr:   /#(?:Records|KeyCols|ValueCols|FieldCols)/,
    dataType:   /Boolean|Currency|Integer|Double|String|DateTime/,
    string:     /'(?:\\['\\]|[^\n'\\])*'/,
    bracketVal: /\[[^\]]*\]/,
    identifier: /[a-zA-Z_][a-zA-Z0-9_-]*/,
    comma:      /,/,
    lparen:     /\(/,
    rparen:     /\)/,
    equals:     /=/,
    hyphen:     /-/,
    langle:     /</,
    rangle:     />/,
    lbracket:   /\[/,
    rbracket:   /\]/,
    text:       /[^\s\(\)=\[\],<>]+/,
    nl:         { match: /\n/, lineBreaks: true },
});
let Lexer = lexer;
let ParserRules = [
    {"name": "main$ebnf$1", "symbols": ["line"]},
    {"name": "main$ebnf$1", "symbols": ["main$ebnf$1", "line"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "main", "symbols": ["_", "main$ebnf$1", "_"], "postprocess": function(d) { return d[1]; }},
    {"name": "line", "symbols": ["indent", "operator", "_", (lexer.has("opType") ? {type: "opType"} : opType), "_", "attributes", "nl"], "postprocess": function(d) { return { indent: d[0].length, operator: d[1], type: d[3], attributes: d[5] }; }},
    {"name": "indent$ebnf$1", "symbols": []},
    {"name": "indent$ebnf$1", "symbols": ["indent$ebnf$1", (lexer.has("ws") ? {type: "ws"} : ws)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "indent", "symbols": ["indent$ebnf$1"], "postprocess": function(d) { return d[0] ? d[0].map(w => w.value).join('') : ''; }},
    {"name": "operator$subexpression$1", "symbols": ["complexIdentifier"]},
    {"name": "operator$subexpression$1", "symbols": ["text"]},
    {"name": "operator$subexpression$1", "symbols": ["identifier"]},
    {"name": "operator$subexpression$1", "symbols": ["columnRef"]},
    {"name": "operator", "symbols": ["operator$subexpression$1", "colon"], "postprocess":  function(d) { 
            const op = d[0][0];
            if (op.table && op.column) {
                return { type: 'columnRef', table: op.table, column: op.column };
            }
            if (op.type === 'complexIdentifier') {
                return op;
            }
            return op.value; 
        } },
    {"name": "complexIdentifier", "symbols": ["identifier", (lexer.has("langle") ? {type: "langle"} : langle), "typeParam", (lexer.has("rangle") ? {type: "rangle"} : rangle)], "postprocess":  function(d) {
            return { 
                type: 'complexIdentifier',
                name: d[0].value,
                param: d[2]
            };
        } },
    {"name": "typeParam", "symbols": ["identifier", (lexer.has("langle") ? {type: "langle"} : langle), "typeParam", (lexer.has("rangle") ? {type: "rangle"} : rangle)], "postprocess":  function(d) {
            return {
                type: 'complexIdentifier',
                name: d[0].value,
                param: d[2]
            };
        } },
    {"name": "typeParam", "symbols": ["identifier", (lexer.has("langle") ? {type: "langle"} : langle), (lexer.has("rangle") ? {type: "rangle"} : rangle)], "postprocess":  function(d) {
            return {
                type: 'complexIdentifier',
                name: d[0].value,
                param: null
            };
        } },
    {"name": "typeParam", "symbols": [(lexer.has("langle") ? {type: "langle"} : langle), (lexer.has("rangle") ? {type: "rangle"} : rangle)], "postprocess": function(d) { return null; }},
    {"name": "typeParam", "symbols": ["columnRef"], "postprocess": function(d) { return d[0]; }},
    {"name": "typeParam", "symbols": ["identifier"], "postprocess": function(d) { return d[0].value; }},
    {"name": "attributes$ebnf$1", "symbols": []},
    {"name": "attributes$ebnf$1$subexpression$1", "symbols": ["_", "attribute"]},
    {"name": "attributes$ebnf$1", "symbols": ["attributes$ebnf$1", "attributes$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "attributes", "symbols": ["attribute", "attributes$ebnf$1"], "postprocess": function(d) { return [d[0], ...d[1].map(r => r[1])]; }},
    {"name": "attribute", "symbols": ["dependOnCols"]},
    {"name": "attribute", "symbols": ["requiredCols"]},
    {"name": "attribute", "symbols": ["lineRange"]},
    {"name": "attribute", "symbols": ["measureRef"]},
    {"name": "attribute", "symbols": ["dominantVal"]},
    {"name": "attribute", "symbols": ["logOp"]},
    {"name": "attribute", "symbols": ["hashAttr"]},
    {"name": "attribute", "symbols": ["dataType"]},
    {"name": "attribute", "symbols": ["lookupCols"]},
    {"name": "attribute", "symbols": ["iterCols"]},
    {"name": "attribute", "symbols": ["indexRange"]},
    {"name": "attribute", "symbols": ["columnRef"]},
    {"name": "attribute", "symbols": ["numeric"]},
    {"name": "attribute", "symbols": ["varName"]},
    {"name": "attribute", "symbols": ["refVarName"]},
    {"name": "value", "symbols": ["complexIdentifier"]},
    {"name": "value", "symbols": ["columnRef"]},
    {"name": "value", "symbols": ["identifier"]},
    {"name": "value", "symbols": ["integer"]},
    {"name": "value", "symbols": ["float"]},
    {"name": "value", "symbols": ["text"]},
    {"name": "value", "symbols": [{"literal":"BLANK"}], "postprocess":  function(d) {
            if (d[0].type === 'complexIdentifier') return d[0];
            if (d[0].table && d[0].column) return d[0];
            if (d[0] === "BLANK") return "BLANK";
            return d[0].value;
        } },
    {"name": "numeric$subexpression$1", "symbols": [(lexer.has("integer") ? {type: "integer"} : integer)]},
    {"name": "numeric$subexpression$1", "symbols": [(lexer.has("float") ? {type: "float"} : float)]},
    {"name": "numeric", "symbols": ["numeric$subexpression$1"], "postprocess":  function(d) { 
            return { type: "NumericLiteral", value: parseFloat(d[0][0].value) }; 
        } },
    {"name": "varName", "symbols": [{"literal":"VarName"}, "equals", "identifier"]},
    {"name": "refVarName", "symbols": [{"literal":"RefVarName"}, "equals", "identifier"], "postprocess":  function(d) {
            return { type: "RefVarName", value: d[2].value };
        } },
    {"name": "dependOnCols", "symbols": [{"literal":"DependOnCols"}, "lparen", "indices", "rparen", "lparen", "columnRefs", "rparen"], "postprocess":  function(d) { 
            return { type: "DependOnCols", indices: d[2], refs: d[5] }; 
        } },
    {"name": "requiredCols", "symbols": [{"literal":"RequiredCols"}, "lparen", "indices", "rparen", "lparen", "columnRefs", "rparen"], "postprocess":  function(d) { 
            return { type: "RequiredCols", indices: d[2], refs: d[5] }; 
        } },
    {"name": "lookupCols", "symbols": [{"literal":"LookupCols"}, "lparen", "indices", "rparen", "lparen", "columnRefs", "rparen"], "postprocess":  function(d) { 
            return { type: "LookupCols", indices: d[2], refs: d[5] }; 
        } },
    {"name": "iterCols", "symbols": [{"literal":"IterCols"}, "lparen", "indices", "rparen", "lparen", "columnRefs", "rparen"], "postprocess":  function(d) { 
            return { type: "IterCols", indices: d[2], refs: d[5] }; 
        } },
    {"name": "indices$ebnf$1$subexpression$1$ebnf$1", "symbols": []},
    {"name": "indices$ebnf$1$subexpression$1$ebnf$1$subexpression$1", "symbols": ["_", "comma", "_", "integer"]},
    {"name": "indices$ebnf$1$subexpression$1$ebnf$1", "symbols": ["indices$ebnf$1$subexpression$1$ebnf$1", "indices$ebnf$1$subexpression$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "indices$ebnf$1$subexpression$1", "symbols": ["integer", "indices$ebnf$1$subexpression$1$ebnf$1"]},
    {"name": "indices$ebnf$1", "symbols": ["indices$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "indices$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "indices", "symbols": ["indices$ebnf$1"], "postprocess":  function(d) { 
            return d[0] ? [d[0][0], ...d[0][1].map(r => r[3])] : []; 
        } },
    {"name": "columnRefs$ebnf$1$subexpression$1$ebnf$1", "symbols": []},
    {"name": "columnRefs$ebnf$1$subexpression$1$ebnf$1$subexpression$1", "symbols": ["_", "comma", "_", "columnRef"]},
    {"name": "columnRefs$ebnf$1$subexpression$1$ebnf$1", "symbols": ["columnRefs$ebnf$1$subexpression$1$ebnf$1", "columnRefs$ebnf$1$subexpression$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "columnRefs$ebnf$1$subexpression$1", "symbols": ["columnRef", "columnRefs$ebnf$1$subexpression$1$ebnf$1"]},
    {"name": "columnRefs$ebnf$1", "symbols": ["columnRefs$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "columnRefs$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "columnRefs", "symbols": ["columnRefs$ebnf$1"], "postprocess":  function(d) { 
            return d[0] ? [d[0][0], ...d[0][1].map(r => r[3])] : []; 
        } },
    {"name": "columnRef", "symbols": ["string", "bracketVal"], "postprocess":  function(d) { 
            return { table: d[0].value.slice(1,-1), column: d[1].value.slice(1,-1) }; 
        } },
    {"name": "lineRange", "symbols": [(lexer.has("lineRange") ? {type: "lineRange"} : lineRange)], "postprocess":  function(d) { 
            const [start, end] = d[0].value.split('-');
            return { type: "LineRange", start, end }; 
        } },
    {"name": "measureRef", "symbols": [{"literal":"MeasureRef"}, "equals", "bracketVal"], "postprocess":  function(d) { 
            return { type: "MeasureRef", value: d[2].value.slice(1,-1) }; 
        } },
    {"name": "dominantVal$subexpression$1", "symbols": ["identifier"]},
    {"name": "dominantVal$subexpression$1", "symbols": ["integer"]},
    {"name": "dominantVal$subexpression$1", "symbols": ["text"]},
    {"name": "dominantVal", "symbols": [{"literal":"DominantValue"}, "equals", "dominantVal$subexpression$1"], "postprocess":  function(d) { 
            return { type: "DominantValue", value: d[2].value || d[2] }; 
        } },
    {"name": "logOp", "symbols": [{"literal":"LogOp"}, "equals", "value"], "postprocess":  function(d) { 
            return { type: "LogOp", value: d[2] }; 
        } },
    {"name": "hashAttr", "symbols": [(lexer.has("hashAttr") ? {type: "hashAttr"} : hashAttr), "equals", "integer"], "postprocess":  function(d) { 
            return { type: d[0].value.slice(1), value: parseInt(d[2].value) }; 
        } },
    {"name": "indexRange", "symbols": ["integer", "hyphen", "integer"], "postprocess":  function(d) { 
            return { type: "IndexRange", start: d[0].value, end: d[2].value }; 
        } },
    {"name": "integer", "symbols": [(lexer.has("integer") ? {type: "integer"} : integer)], "postprocess": id},
    {"name": "float", "symbols": [(lexer.has("float") ? {type: "float"} : float)], "postprocess": id},
    {"name": "text", "symbols": [(lexer.has("text") ? {type: "text"} : text)], "postprocess": id},
    {"name": "dataType", "symbols": [(lexer.has("dataType") ? {type: "dataType"} : dataType)], "postprocess": id},
    {"name": "string", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": id},
    {"name": "bracketVal", "symbols": [(lexer.has("bracketVal") ? {type: "bracketVal"} : bracketVal)], "postprocess": id},
    {"name": "identifier", "symbols": [(lexer.has("identifier") ? {type: "identifier"} : identifier)], "postprocess": id},
    {"name": "nl", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)], "postprocess": id},
    {"name": "colon", "symbols": [(lexer.has("colon") ? {type: "colon"} : colon)], "postprocess": id},
    {"name": "lparen", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen)], "postprocess": id},
    {"name": "rparen", "symbols": [(lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": id},
    {"name": "equals", "symbols": [(lexer.has("equals") ? {type: "equals"} : equals)], "postprocess": id},
    {"name": "comma", "symbols": [(lexer.has("comma") ? {type: "comma"} : comma)], "postprocess": id},
    {"name": "hyphen", "symbols": [(lexer.has("hyphen") ? {type: "hyphen"} : hyphen)], "postprocess": id},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1$subexpression$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "_$ebnf$1$subexpression$1", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)]},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "_$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function() { return null; }}
];
let ParserStart = "main";
export default { Lexer, ParserRules, ParserStart };
