var some = new VersionedObject({ ghost: 1, text: "23", birdie: [1,2,3, {phone: "232323"}]});
var original = some;
console.log(some);
some = some.bump();
some.ghost = 40;
some.birdie[3].mobile = "3432434";
some.birdie.push(4);
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
