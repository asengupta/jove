define(["lib/lodash", "lib/jsondiffpatch.min", function (lo, diffService) {
  this.VersionedObject = function VersionedObject(json, tagName, parent) {
    var self = this;
    Object.defineProperty(this, "version", {value: parent ? parent.version + 1: 1});
    Object.defineProperty(this, "tag", {value: tagName? tagName: ""});
    Object.defineProperty(this, "older", {value: parent});
    lo.forIn(json, function (v, k) {
      self[k] = v;
    });

    this.setTag = function(tagName) {
      this.tag = tagName;
    };

    this.bump = function (tagName) {
      var finalObject = new VersionedObject({}, tagName, this);
      var deepClone = lo.clone(this, true);
      lo.forIn(deepClone, function (value, property) {
        finalObject[property] = value;
      });
      return finalObject;
    };

    this.diff = function(other) {
      return diffService.diff(this, other);
    };

    this.previous = function () {
      return this.older;
    };

    this.root = function () {
      return _root(this);
    };

    this.byVersion = function(versionNumber) {
      return _byVersion(this, versionNumber);
    };

    this.byTag = function(tagName) {
      return _byTag(this, tagName);
    };

    function _byTag(me, tagName) {
      if (me.tag === tagName) return me;
      if (!me.older) return null;
      return _byTag(me.older, tagName);
    }

    function _byVersion(me, versionNumber) {
      if (me.version === versionNumber) return me;
      if (!me.older) return null;
      return _byVersion(me.older, versionNumber);
    }
    function _root(me) {
      if (!me.older) return me;
      return _root(me.older);
    }
  }

  this.MemberTransform = function MemberTransform(atoms) {
    var self = this;
    this.run = function (from, bump, tagName) {
      var newFrom = bump ? from.bump(tagName) : from;
      lo.forIn(atoms, function (atom) {
        atom(newFrom);
      });
      return newFrom;
    };
    this.isInverseOf = function (inverse) {
      if (self.inverse) return self;
      self.inverse = inverse;
      inverse.isInverseOf(self);
    };
  }
});
