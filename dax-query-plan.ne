@{%
const moo = require('moo');

// Consolidated token patterns
const patterns = {
    // Whitespace and basic tokens
    ws: /[ \t]+/,
    newline: { match: /\n/, lineBreaks: true },
    colon: ':',
    equals: '=',
    lparen: '(',
    rparen: ')',
    comma: ',',
    hash: '#',

    // Special patterns
    angle_expr: {
        match: /<(?:[^<>]+|<[^<>]*>)*>/,
        value: x => x.slice(1, -1)
    },
    empty_parens: {
        match: /\(\)/,
        value: () => '()'
    },
    number_range: {
        match: /\d+-\d+/,
        value: x => x
    },
    number: {
        match: /\d+(?:\.\d+)?/,
        value: Number
    },

    // Column references
    empty_column_ref: {
        match: /''\[[^\]]*\]/,
        value: x => ({type: 'column_ref', table: '', column: x.slice(3, -1)})
    },
    column_ref: {
        match: /'[^']*'\[[^\]]*\]/,
        value: x => {
            const parts = x.split('[');
            return {
                type: 'column_ref',
                table: parts[0].slice(1, -1),
                column: parts[1].slice(0, -1)
            };
        }
    },
    measure_ref: {
        match: /\[[^\]]*\]/,
        value: x => x.slice(1, -1)
    },

    // Keywords and identifiers
    operator_type: {
        match: ['RelLogOp', 'ScaLogOp', 'LookupPhyOp', 'IterPhyOp', 'SpoolPhyOp'],
        type: 'operator_type'
    },
    keyword: {
        match: ['Boolean', 'Integer', 'String', 'Currency', 'Double', 'NONE', 'BLANK'],
        type: 'keyword'
    },
    identifier: {
        match: /[a-zA-Z_][a-zA-Z0-9_.]*/,
        type: 'identifier'
    }
};

const lexer = moo.compile(patterns);

%}

@lexer lexer

# Root rules
main -> lines {% 
    ([lines]) => buildTree(lines)
%}

lines -> line (%newline line):* {%
    ([first, rest]) => [first, ...(rest?.map(([, line]) => line) || [])]
%}

# Basic line structure
line -> _ statement {%
    ([indent, stmt]) => ({
        indent: indent?.length || 0,
        ...stmt
    })
%}

statement -> operator angle_params:? %colon rest_of_line {% 
    ([op, params,, props]) => ({
        operator: op,
        parameters: params,
        properties: props || {}
    })
%}

# Operator handling
operator -> 
      %identifier {% ([id]) => id.value %}
    | %column_ref {% ([col]) => col.value %}
    | %empty_column_ref {% ([col]) => col.value %}

angle_params -> %angle_expr {% ([expr]) => expr.value %}

# Property handling
rest_of_line -> (_ token):* {%
    ([tokens]) => parseProperties(tokens.map(([, t]) => t))
%}

token -> 
      %operator_type
    | %identifier
    | %equals
    | %lparen
    | %rparen
    | %angle_expr
    | %number
    | %hash
    | %comma
    | %column_ref
    | %empty_column_ref
    | %empty_parens
    | %number_range
    | %keyword
    | %measure_ref

_ -> %ws:* {% ([ws]) => ws.map(w => w.value).join('') %}

@{%
// Helper function to parse properties from token stream
function parseProperties(tokens) {
    const properties = {};
    let current = null;
    let inParens = false;
    let parenContent = [];
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        // Handle operator types
        if (token.type === 'operator_type') {
            properties.type = token.value;
            continue;
        }

        // Handle keywords
        if (token.type === 'keyword') {
            if (current) parenContent.push(token.value);
            else properties.value = token.value;
            continue;
        }

        // Handle identifiers
        if (token.type === 'identifier') {
            // Property assignments
            if (tokens[i + 1]?.type === 'equals') {
                properties[token.value] = tokens[i + 2].value;
                i += 2;
                continue;
            }
            
            // Empty parentheses
            if (tokens[i + 1]?.type === 'empty_parens') {
                const hasDoubleParens = tokens[i + 2]?.type === 'empty_parens';
                properties[token.value] = hasDoubleParens ? '()()' : '()';
                i += hasDoubleParens ? 2 : 1;
                continue;
            }
            
            // Start of parentheses group
            if (tokens[i + 1]?.type === 'lparen') {
                current = token.value;
                inParens = true;
                parenContent = [];
                i++;
                continue;
            }
        }

        // Handle hash properties
        if (token.type === 'hash' && 
            tokens[i + 1]?.type === 'identifier' && 
            tokens[i + 2]?.type === 'equals') {
            properties[tokens[i + 1].value] = tokens[i + 3].value;
            i += 3;
            continue;
        }

        // Handle content inside parentheses
        if (inParens) {
            if (token.type === 'rparen') {
                properties[current] = parenContent;
                current = null;
                inParens = false;
            } else if (token.type !== 'comma') {
                parenContent.push(token.value);
            }
        }
    }
    
    return properties;
}

// Helper function to build the tree structure
function buildTree(lines) {
    if (lines.length === 0) return [];
    
    const root = {
        operator: "ROOT",
        children: []
    };
    
    let stack = [root];
    let indentLevels = [-1];  // Track indent level for each item in stack
    
    for (const line of lines) {
        const node = {
            operator: line.operator,
            parameters: line.parameters,
            properties: line.properties,
            children: []
        };
        
        // Pop stack until we find the appropriate parent
        while (stack.length > 1 && line.indent <= indentLevels[indentLevels.length - 1]) {
            stack.pop();
            indentLevels.pop();
        }
        
        // Add node to its parent
        stack[stack.length - 1].children.push(node);
        
        // If this node could have children (more indented lines could follow),
        // add it to the stack
        stack.push(node);
        indentLevels.push(line.indent);
    }
    
    return root.children;
}
%}