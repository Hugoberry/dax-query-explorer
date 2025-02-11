@preprocessor esmodule

@{%
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
%}

@lexer lexer

main -> _ line:+ _ {% function(d) { return d[1]; } %}
line -> indent operator _ %opType _ attributes nl {% function(d,l) { return { indent: d[0].length,line:d[3].line, operator: d[1], type: d[3].value, attributes: d[5] }; } %}

indent -> %ws:* {% function(d) { return d[0] ? d[0].map(w => w.value).join('') : ''; } %}

operator -> (filterOp | complexIdentifier | text | identifier | columnRef ) colon {% function(d) { 
    const op = d[0][0];
    if (op.type === 'filterOp') {
        return op;
    }
    if (op.table && op.column) {
        return { type: 'columnRef', table: op.table, column: op.column };
    }
    if (op.type === 'complexIdentifier') {
        return op;
    }
    return op.value; 
} %}

filterOp -> columnRef _ equals _ value {% function(d) {
    return { 
        type: 'filterOp',
        columnRef: d[0],
        op: d[2].value,
		filter: d[4][0].value,
    };
} %}

complexIdentifier -> identifier %langle typeParam %rangle {% function(d) {
    return { 
        type: 'complexIdentifier',
        name: d[0].value,
        param: d[2]
    };
} %}

typeParam -> identifier %langle typeParam %rangle {% function(d) {
    return {
        type: 'complexIdentifier',
        name: d[0].value,
        param: d[2]
    };
} %}
    | identifier %langle %rangle {% function(d) {
        return {
            type: 'complexIdentifier',
            name: d[0].value,
            param: null
        };
    } %}
    | %langle %rangle {% function(d) { return null; } %}
    | columnRef {% function(d) { return d[0]; } %}
    | identifier {% function(d) { return d[0].value; } %}

attributes -> attribute (_ attribute):* {% function(d) { 
    const attrs = [d[0], ...d[1].map(r => r[1])];
    // Flatten any single-item arrays in the attributes
    return attrs.map(attr => 
        Array.isArray(attr) && attr.length === 1 ? attr[0] : attr
    );
} %}

attribute -> dependOnCols
    | requiredCols
    | lineRange
    | measureRef
    | dominantVal  
    | logOp
    | hashAttr
    | dataType 
    | lookupCols
    | iterCols
    | indexRange
    | columnRef
    | numeric
    | varName
    | refVarName

value -> complexIdentifier 
    | columnRef 
    | identifier 
    | integer
    | float
    | text
    | "BLANK" {% function(d) {
    if (d[0].type === 'complexIdentifier') return d[0];
    if (d[0].table && d[0].column) return d[0];
    if (d[0] === "BLANK") return "BLANK";
    return d[0].value;
} %}

numeric -> (%integer | %float) {% function(d) { 
    return { type: "NumericLiteral", value: parseFloat(d[0][0].value) }; 
} %}

varName -> "VarName" equals identifier

refVarName -> "RefVarName" equals identifier {% function(d) {
    return { type: "RefVarName", value: d[2].value };
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
    return d[0] ? [d[0][0].value, ...d[0][1].map(r => r[3].value)] : []; 
} %}

columnRefs -> (columnRef (_ comma _ columnRef):*):? {% function(d) { 
    return d[0] ? [d[0][0], ...d[0][1].map(r => r[3])] : []; 
} %}

columnRef -> string bracketVal {% function(d) { 
    return { table: d[0].value.slice(1,-1), column: d[1].value.slice(1,-1) }; 
} %}

lineRange -> %lineRange {% function(d) { 
    const [start, end] = d[0].value.split('-');
    return { type: "LineRange", start, end }; 
} %}

measureRef -> "MeasureRef" equals bracketVal {% function(d) { 
    return { type: "MeasureRef", value: d[2].value.slice(1,-1) }; 
} %}

dominantVal -> "DominantValue" equals (identifier | integer | text) {% function(d) { 
    return { type: "DominantValue", value: d[2][0].value || d[2] }; 
} %}

logOp -> "LogOp" equals value {% function(d) { 
    return { type: "LogOp", value: d[2][0].value }; 
} %}

hashAttr -> %hashAttr equals integer {% function(d) { 
    return { type: d[0].value.slice(1), value: parseInt(d[2].value) }; 
} %}

indexRange -> integer hyphen integer {% function(d) { 
    return { type: "IndexRange", start: d[0].value, end: d[2].value }; 
} %}

dataType -> %dataType {% function(d){ 
	return { dataType: d[0].value };
} %}

integer -> %integer {% id %}
float -> %float {% id %}
text -> %text {% id %}
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
