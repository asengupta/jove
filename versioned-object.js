define(["lib/lodash", "lib/jsondiffpatch.min", "lib/underscore", function (lo, diffService, _) {
  var es5VersionedObject = function ES5VersionedObject(json, tagName, parent) {
    var self = this;
    Object.defineProperty(this, "version", {value: parent ? parent.version + 1: 1, writable: true});
    Object.defineProperty(this, "tag", {value: tagName? tagName: "", writable: true});
    Object.defineProperty(this, "older", {value: parent, writable: true});
    _.each(json, function (v, k) {
      self[k] = v;
    });

    this.detach = function(tag) {
      this.version = 1;
      this.older = null;
      this.tag = tag ? tag : "";
      return this;
    };

    this.inspect = function() {
      var raw = {};
      _.each(this, function (v, k) {
        if (!_.isFunction(v))
          raw[k] = v;
      });
      return raw;
    };

    this.setTag = function(tagName) {
      this.tag = tagName;
    };

    this.bump = function (tagName) {
      var finalObject = new ES5VersionedObject({}, tagName, this);
      var deepClone = lo.clone(this, true);
      _.each(deepClone, function (value, property) {
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
  };

  var legacyVersionedObject = function LegacyVersionedObject(json, tagName, parent) {
    var self = this;
    this.version = parent ? parent.version + 1: 1;
    this.tag = tagName? tagName: "";
    this.older = parent;
    _.each(json, function (v, k) {
      self[k] = v;
    });

    this.detach = function(tag) {
      this.version = 1;
      this.older = null;
      this.tag = tag ? tag : "";
      return this;
    };

    this.inspect = function() {
      var raw = {};
      _.each(this, function (v, k) {
        if (!_.isFunction(v) && k !== "tag" && k !== "older" && k !== "version")
          raw[k] = v;
      });
      return raw;
    };

    this.setTag = function(tagName) {
      this.tag = tagName;
    };

    this.bump = function (tagName) {
      var finalObject = new LegacyVersionedObject({}, tagName, this);
      var deepClone = lo.clone(this, true);
      _.each(deepClone, function (value, property) {
        if (property !== "tag" && property !== "older" && property !== "version")
          finalObject[property] = value;
      });
      return finalObject;
    };

    this.diff = function(other) {
      var diff = diffService.diff(this, other);
      delete diff.version;
      delete diff.tag;
      delete diff.older;
      return _.keys(diff).length == 0 ? undefined: diff;
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
  };

  if (Object.create) {
    console.log("ES5 capable, using modern version.");
    this.VersionedObject = es5VersionedObject;
  } else {
    console.log("ES5 not supported, using legacy version.");
    this.VersionedObject = legacyVersionedObject;
  }
  this.MemberTransform = function MemberTransform(atoms) {
    var self = this;
    this.run = function (from, bump, tagName) {
      var newFrom = bump ? from.bump(tagName) : from;
      _.each(atoms, function (atom) {
        atom(newFrom);
      });
      return newFrom;
    };
    this.isInverseOf = function (inverse) {
      if (self.inverse) return self;
      self.inverse = inverse;
      inverse.isInverseOf(self);
    };
  };
});
