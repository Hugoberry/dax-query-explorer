declare module '@/lib/grammar' {
  import moo from 'moo';
  
  interface Grammar {
    Lexer: moo.Lexer;
    ParserRules: any[];
    ParserStart: string;
  }
  
  const grammar: Grammar;
  export default grammar;
}