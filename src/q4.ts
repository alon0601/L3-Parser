import {Exp,LetExp,isPrimOp,isVarRef,LitExp,isStrExp,isNumExp,isBoolExp,AppExp,VarDecl,Binding,ProcExp,LetStarExp,isLetStarExp, Program, isProgram, isExp, makeProgram, isCExp, makeDefineExp, isDefineExp, isAtomicExp, isIfExp, isLitExp, CExp, makeIfExp, isAppExp, makeAppExp, makeProcExp, isLetExp, isProcExp, makeLetExp, makeLetStarExp, PrimOp} from "./L31-ast";
import { Result, makeFailure,makeOk } from "../shared/result";
import { map, pipe, zipWith } from "ramda";
import {valueToString,isEmptySExp,isSymbolSExp,isCompoundSExp} from "../imp/L3-value";

/*
Purpose: Transform L3 AST to JavaScript program string
Signature: l30ToJS(l2AST)
Type: [EXP | Program] => Result<string>
*/
const isVeryPrimitiveOp = (x: string): boolean =>
     ["+", "-", "*", "/", ">", "<", "=","string=?"].includes(x);

const istTypeOfOp = (x: string): boolean =>
     ["boolean?", "string?", "number?", "symbol?"].includes(x);

const unparseLitExp = (le: LitExp): string =>
    isEmptySExp(le.val) ? `[]` :
    isSymbolSExp(le.val) ? `Symbol.for(${valueToString(le.val)})` :
    isCompoundSExp(le.val) ? `'${valueToString(le.val)}` :
    `${le.val}`;

    //${unparseL31(exp.rator)} ${unparseLExps(exp.rands)}

export const unparseL31 = (exp: Program | Exp): string =>
    isBoolExp(exp) ? valueToString(exp.val) :
    isNumExp(exp) ? valueToString(exp.val) :
    isStrExp(exp) ? valueToString(exp.val) :
    isLitExp(exp) ? unparseLitExp(exp) :
    isVarRef(exp) ? exp.var :
    isProcExp(exp) ? `(${unparseProcExp(exp)})` :
    isIfExp(exp) ? `(${unparseL31(exp.test)} ? ${unparseL31(exp.then)} : ${unparseL31(exp.alt)})` :
    isAppExp(exp) ? unparAppExp(exp) :
    isPrimOp(exp) ? unparsePrimeOp(exp) :
    isLetStarExp(exp)? exp.tag:
    isLetExp(exp) ? unparseLetExp(exp) :
    isDefineExp(exp) ? `const ${exp.var.var} = ${unparseL31(exp.val)}` :
    isProgram(exp) ? `${unparseLExps(exp.exps)}` :
    exp;

const unparseLExps = (les: Exp[]): string =>
    map(unparseL31, les).join(";\n");

const unparsePrimeOp = (p: PrimOp): string =>
    (p.op === '=') || (p.op === "string=?") || (p.op === "eq?")? "===":
    (istTypeOfOp(p.op)) ? '((x) => (typeof (x) === ' + p.op.slice(0,-1) + '))':
    (p.op === "not")? '!':
    (p.op === "and")? "&&":
    (p.op === "or")? "||":
    p.op

const unparAppExp = (les: AppExp): string =>
    (!isPrimOp(les.rator))?(unparseL31(les.rator) + '('  + map(unparseL31, les.rands).join(',') + ')'):
    (isVeryPrimitiveOp(les.rator.op))? '(' + map(unparseL31, les.rands).join(" " + unparseL31(les.rator) + " ") + ')':
    (istTypeOfOp(les.rator.op))? unparseL31(les.rator) + unparseLExps(les.rands):
    ('(' + unparseL31(les.rator)  + map(unparseL31, les.rands).join(',') + ')')


    


const unparseProcExp = (pe: ProcExp): string => 
    `(${map((p: VarDecl) => p.var, pe.args).join(",")}) => ${unparseLExps(pe.body)}`


const unparseLetExp = (le: LetExp) : string => 
    `((${map((b: Binding) => b.var.var, le.bindings).join(",")}) => ${unparseLExps(le.body)})(${map((b: Binding) => unparseL31(b.val), le.bindings).join(",")})`

export const l30ToJS = (exp: Exp | Program): Result<string>  => 
    makeOk(unparseL31(exp));


