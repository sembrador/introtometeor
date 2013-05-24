Viewers = new Meteor.Collection("viewers");

Meteor.publish("viewers", function () {
  return Viewers.find();
});

var currentTime = function() { return (new Date()).getTime(); };

Meteor.methods({
  getViewer: function() {
    if(!this.userId) {
      var newViewerId = Random.id();
      Viewers.insert({ userId: newViewerId, last_keepalive: currentTime() });
      this.setUserId(newViewerId);
    } else {
      if( !Viewers.findOne({ userId: this.userId}) ){
        Viewers.insert({ userId: this.userId, last_keepalive: currentTime() });
      }
    }
    return this.userId;
  },
  keepalive: function() {
    if(this.userId) {
      Viewers.update(
        { userId: this.userId },
        { $set: { last_keepalive: currentTime() } }
      );
    }
  },
  setSlide: function(slide) {
    if(this.userId) {
      Viewers.update({ userId: this.userId }, { $set: { currentSlide: slide, slideTime: currentTime() } });
    }
  }
});

Meteor.setInterval(function () {
  var threshold = currentTime() - 30*1000; // 30 sec

  Viewers.remove({
    $or: [
      { last_keepalive: {$lt: threshold } },
      { last_keepalive: null }
    ]
  });
}, 15*1000);
