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
