function VersionedObject(json) {
	for (var i in json) {
		this[i] = json[i];
	}
	this.bump = function() {
		return Object.create(this);
	};
	this.previous = function() {
		return Object.getPrototypeOf(this);
	};
}

var some = new VersionedObject({ ghost: 1, text: "23"});
console.log(some);
some = some.bump();
some.ghost = 40;
console.log(some);
some = some.previous();
console.log(some);

function Transform(atoms) {
	var self = this;
	this.run = function(from, bump) {
		var newFrom = bump ? from.bump() : from;
		_.each(atoms, function(atom) {
			newFrom[atom.fieldName] = atom.run(newFrom);
		});
		return newFrom;
	};
	this.isInverseOf = function(inverse) {
		if (self.inverse) return self;
		self.inverse = inverse;
		inverse.isInverseOf(self);
	};
}

function MemberTransform(atoms) {
	var self = this;
	this.run = function(from, bump) {
		var newFrom = bump ? from.bump() : from;
		_.each(atoms, function(atom) {
			atom(newFrom);
		});
		return newFrom;
	};
	this.isInverseOf = function(inverse) {
		if (self.inverse) return self;
		self.inverse = inverse;
		inverse.isInverseOf(self);
	};
}

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
// x = t.run(g.run(x));
// console.log(x);
// x.derived = x.derived + 60;
// x = g.inverse.run(t.inverse.run(x));
// console.log(x);
