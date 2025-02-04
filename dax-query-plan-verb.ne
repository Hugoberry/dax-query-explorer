@{%
const moo = require("moo");
const lexer = moo.compile({
    ws:         /[ \t]+/,
	none:       'NONE',
    blank:      'BLANK',
	dominant:   'DominantValue',
    opType:     /RelLogOp|ScaLogOp|IterPhyOp|LookupPhyOp|SpoolPhyOp/,
    colon:      /:/,
    lineRange:  /\d+-\d+/,
    number:     /\d*\.\d+|\d+/,
    hashAttr:   /#(?:Records|KeyCols|ValueCols|FieldCols)/,
    dataType:   /Boolean|Currency|Integer|Double|String/,
    string:     /'(?:\\['\\]|[^\n'\\])*'/,
    bracketVal: /\[[^\]]*\]/,
    identifier: /[a-zA-Z_][a-zA-Z0-9_]*/,
    comma:      /,/,
    lparen:     /\(/,
    rparen:     /\)/,
    equals:     /=/,
    hyphen:     /-/,
    langle:     /</,
    rangle:     />/,
    text:       /[^\s\(\)=\[\]<>,]+/,
    nl:         { match: /\n/, lineBreaks: true },
});
%}

@lexer lexer

main -> _ line:+ _ {% function(d) { return d[1]; } %}

line -> indent operator _ %opType _ attributes nl {% function(d) { 
    return { 
        indent: d[0].length, 
        operator: d[1], 
        type: d[3].value, 
        attributes: d[5] 
    }; 
} %}

indent -> %ws:* {% function(d) { return d[0] ? d[0].map(w => w.value).join('') : ''; } %}

operator -> operatorExpr colon {% function(d) { return d[0]; } %}

operatorExpr -> simpleOperator {% id %}
    | identifier %langle nestedExpr %rangle {% function(d) {
        return {
            type: 'angleExpr',
            base: d[0].value,
            inner: d[2]
        };
    } %}

simpleOperator -> identifier {% id %}
    | columnRefExpr {% id %}

nestedExpr -> identifier {% id %}
    | identifier %langle nestedExpr %rangle {% function(d) {
        return {
            type: 'angleExpr',
            base: d[0].value,
            inner: d[2]
        };
    } %}
    | columnRefExpr {% id %}

attributes -> attribute (_ attribute):* {% function(d) { 
    return [d[0], ...d[1].map(r => r[1])]; 
} %}

attribute -> dependOnCols
    | requiredCols
    | lineRange
    | measureRef
    | dominantVal
    | constantValue
    | logOp
    | hashAttr
    | dataType
    | lookupCols
    | iterCols
    | indexRange
    | fieldCols
    | columnRefExpr

constantValue -> "LogOp" equals "Constant" _ %dataType _ %number {% function(d) {
    const value = d[6].value;
    return {
        type: "Constant",
        logOp: "Constant",
        dataType: d[4].value,
        value: value.includes('.') ? parseFloat(value) : parseInt(value)
    };
} %}

dependOnCols -> "DependOnCols" lparen indices rparen lparen columnRefs rparen {% function(d) { 
    return { type: "DependOnCols", indices: d[2], refs: d[5] }; 
} %}

requiredCols -> "RequiredCols" lparen indices rparen lparen columnRefs rparen {% function(d) { 
    return { type: "RequiredCols", indices: d[2], refs: d[5] }; 
} %}

lookupCols -> "LookupCols" lparen indices rparen lparen columnRefs rparen {% function(d) { 
    return { type: "LookupCols", indices: d[2], refs: d[5] }; 
} %}

iterCols -> "IterCols" lparen indices rparen lparen columnRefs rparen {% function(d) { 
    return { type: "IterCols", indices: d[2], refs: d[5] }; 
} %}

indices -> (integer (_ comma _ integer):*):? {% function(d) { 
    if (!d[0]) return [];
    const [first, rest] = d[0];
    return [first.value, ...rest.map(r => r[3].value)].map(Number);
} %}

columnRefs -> (columnRefExpr (_ comma _ columnRefExpr):*):? {% function(d) { 
    return d[0] ? [d[0][0], ...d[0][1].map(r => r[3])] : []; 
} %}

columnRefExpr -> string bracketVal {% function(d) {
    return { 
        table: d[0].value.slice(1,-1), 
        column: d[1].value.slice(1,-1) 
    };
} %}

lineRange -> %lineRange {% function(d) { 
    const [start, end] = d[0].value.split('-').map(Number);
    return { type: "LineRange", start, end }; 
} %}

measureRef -> "MeasureRef" equals bracketVal {% function(d) { 
    return { type: "MeasureRef", value: d[2].value.slice(1,-1) }; 
} %}

dominantVal -> %dominant equals dominantValue {% function(d) { 
    return { type: "DominantValue", value: d[2] }; 
} %}

dominantValue -> %none {% function() { return "NONE"; } %}
              | %blank {% function() { return "BLANK"; } %}
              | %identifier {% function(d) { return d[0].value; } %}
              | %number {% function(d) {
                    const value = d[0].value;
                    return value.includes('.') ? parseFloat(value) : parseInt(value);
                } %}




logOp -> "LogOp" equals logOpValue {% function(d) { 
    return { type: "LogOp", value: d[2] }; 
} %}

logOpValue -> simpleLogOpValue {% id %}
    | identifier %langle nestedLogOpValue %rangle columnRefExpr {% function(d) {
        return {
            type: 'angleExpr',
            base: d[0].value,
            inner: d[2],
            ref: d[3]
        };
    } %}

simpleLogOpValue -> identifier {% id %}
    | text {% id %}

nestedLogOpValue -> columnRefExpr {% id %}
    | identifier {% id %}

hashAttr -> %hashAttr equals %number {% function(d) { 
    return { type: d[0].value.slice(1), value: parseInt(d[2].value) }; 
} %}

indexRange -> %number hyphen %number {% function(d) { 
    return { type: "IndexRange", start: parseInt(d[0].value), end: parseInt(d[2].value) }; 
} %}

fieldCols -> "#FieldCols" equals %number {% function(d) { 
    return { type: "FieldCols", value: parseInt(d[2].value) }; 
} %}

integer -> %number {% id %}
text -> %text {% id %}
dataType -> %dataType {% id %}
string -> %string {% id %}
bracketVal -> %bracketVal {% id %}
identifier -> %identifier {% id %}
nl -> %nl {% id %}
colon -> %colon {% id %}
lparen -> %lparen {% id %}
rparen -> %rparen {% id %}
equals -> %equals {% id %}
comma -> %comma {% id %}
hyphen -> %hyphen {% id %}

_ -> (%ws | %nl):* {% function() { return null; } %}
