(window.webpackJsonp=window.webpackJsonp||[]).push([[57],{INem:function(e,t,n){!function(e){"use strict";e.defineMode("haskell-literate",(function(t,n){var a=e.getMode(t,n&&n.base||"haskell");return{startState:function(){return{inCode:!1,baseState:e.startState(a)}},token:function(e,t){return e.sol()&&(t.inCode=e.eat(">"))?"meta":t.inCode?a.token(e,t.baseState):(e.skipToEnd(),"comment")},innerMode:function(e){return e.inCode?{state:e.baseState,mode:a}:null}}}),"haskell"),e.defineMIME("text/x-literate-haskell","haskell-literate")}(n("VrN/"),n("0+DK"))}}]);
//# sourceMappingURL=57.4224f961045cd221a236.js.map