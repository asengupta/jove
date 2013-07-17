var some = new VersionedObject({ ghost: 1, text: "23"});
console.log(some);
some = some.bump();
some.ghost = 40;
console.log(some);
some = some.previous();
console.log(some);

var t = new Transform([{fieldName: "derived", run: function(o) { return o.ghost * 30; }}]);
var tDash = new Transform([{fieldName: "ghost", run: function(o) { return o.derived / 30; }}]);
var g = new MemberTransform([function(o) { o.derived = new Object(); }]);
var gDash = new MemberTransform([function(o) { delete o.derived; }]);

t.isInverseOf(tDash);
g.isInverseOf(gDash);

console.log("==================================================================================");

var x = new VersionedObject({ ghost: 3 });
console.log(x);
console.log(g.inverse.run(t.inverse.run(t.run(g.run(x)))));
