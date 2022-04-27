import {Exp,LetExp,AppExp,VarDecl,LetStarExp, Program, isProgram, isExp, makeProgram, isCExp, makeDefineExp, isDefineExp, isAtomicExp, isIfExp, isLitExp, CExp, makeIfExp, isAppExp, makeAppExp, makeProcExp, isLetExp, isProcExp} from "./L31-ast";
import { Result, makeFailure } from "../shared/result";
import { map, pipe, zipWith } from "ramda";


/*
Purpose: Transform L31 AST to L3 AST
Signature: l31ToL3(l31AST)
Type: [Exp | Program] => Result<Exp | Program>
*/

/*
Purpose: rewrite a single LetExp as a lambda-application form
Signature: rewriteLet(cexp)
Type: [LetExp => AppExp]
*/
const rewriteLetStar = (e: LetStarExp): AppExp => {
    const lets : LetExp[] = e.bindings;
    const vals : CExp[] = map((b) => b.val, e.bindings);
    return makeAppExp(
            makeProcExp(vars, e.body),
            vals);
}

/*
Purpose: rewrite all occurrences of let in an expression to lambda-applications.
Signature: rewriteAllLet(exp)
Type: [Program | Exp -> Program | Exp]
*/
export const rewriteAllLet = (exp: Program | Exp): Program | Exp =>
    isExp(exp) ? rewriteAllLetExp(exp) :
    isProgram(exp) ? makeProgram(map(rewriteAllLetExp, exp.exps)) :
    exp;

const rewriteAllLetExp = (exp: Exp): Exp =>
    isCExp(exp) ? rewriteAllLetCExp(exp) :
    isDefineExp(exp) ? makeDefineExp(exp.var, rewriteAllLetCExp(exp.val)) :
    exp;

const rewriteAllLetCExp = (exp: CExp): CExp =>
    isAtomicExp(exp) ? exp :
    isLitExp(exp) ? exp :
    isIfExp(exp) ? makeIfExp(rewriteAllLetCExp(exp.test),
                             rewriteAllLetCExp(exp.then),
                             rewriteAllLetCExp(exp.alt)) :
    isAppExp(exp) ? makeAppExp(rewriteAllLetCExp(exp.rator),
                               map(rewriteAllLetCExp, exp.rands)) :
    isProcExp(exp) ? makeProcExp(exp.args, map(rewriteAllLetCExp, exp.body)) :
    isLetExp(exp) ? rewriteAllLetCExp(rewriteLet(exp)) :
    exp;

export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
    makeFailure("TODO");
