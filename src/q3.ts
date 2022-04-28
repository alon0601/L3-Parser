import {Exp,LetExp,AppExp,VarDecl,LetStarExp,isLetStarExp, Program, isProgram, isExp, makeProgram, isCExp, makeDefineExp, isDefineExp, isAtomicExp, isIfExp, isLitExp, CExp, makeIfExp, isAppExp, makeAppExp, makeProcExp, isLetExp, isProcExp, makeLetExp, makeLetStarExp} from "./L31-ast";
import { Result, makeFailure,makeOk } from "../shared/result";
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
const rewriteLetStar = (e: LetStarExp): LetExp =>
    (e.bindings.length === 1) ? makeLetExp(e.bindings, e.body):
        makeLetExp(e.bindings.slice(0,1),[makeLetStarExp(e.bindings.slice(1),e.body)])
        

/*
Purpose: rewrite all occurrences of let in an expression to lambda-applications.
Signature: rewriteAllLet(exp)
Type: [Program | Exp -> Program | Exp]
*/
export const rewriteAllLetStar = (exp: Program | Exp): Program | Exp =>
    isExp(exp) ? rewriteAllLetStarExp(exp) :
    isProgram(exp) ? makeProgram(map(rewriteAllLetStarExp, exp.exps)) :
    exp;

const rewriteAllLetStarExp = (exp: Exp): Exp =>
    isCExp(exp) ? rewriteAllLetStarCExp(exp) :
    isDefineExp(exp) ? makeDefineExp(exp.var, rewriteAllLetStarCExp(exp.val)) :
    exp;

const rewriteAllLetStarCExp = (exp: CExp): CExp =>
    isAtomicExp(exp) ? exp :
    isLitExp(exp) ? exp :
    isIfExp(exp) ? makeIfExp(rewriteAllLetStarCExp(exp.test),
                            rewriteAllLetStarCExp(exp.then),
                            rewriteAllLetStarCExp(exp.alt)) :
    isAppExp(exp) ? makeAppExp(rewriteAllLetStarCExp(exp.rator),
                               map(rewriteAllLetStarCExp, exp.rands)) :
    isProcExp(exp) ? makeProcExp(exp.args, map(rewriteAllLetStarCExp, exp.body)) :
    isLetStarExp(exp) ? rewriteAllLetStarCExp(rewriteLetStar(exp)) :
    isLetExp(exp) ? makeLetExp(exp.bindings,map(rewriteAllLetStarCExp,exp.body)):
    exp;

export const L31ToL3 = (exp: Exp | Program): Result<Exp | Program> =>
    makeOk(rewriteAllLetStar(exp))
