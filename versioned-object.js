function VersionedObject(json) {
	var self = this;
	_.forIn(json, function(v, k) {
		self[k] = v;
	});

	this.bump = function() {
		var finalObject = Object.create(this);
		var deepClone = _.clone(this, true);
		_.forIn(deepClone, function(value, property) {
			finalObject[property] = value;
		});
		return finalObject;
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
