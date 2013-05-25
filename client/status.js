Viewers = new Meteor.Collection("viewers");

Deps.autorun(function () {
  Meteor.subscribe("viewers");
});

Deps.autorun(function () {
  if(Meteor.user()){
    if(Meteor.user().username == 'admin'){
      var current_leader = currentLeader();
      // this is a crap way and not secure but works for now
      if(!current_leader){
         Meteor.call("getViewer", function(err, viewerId) {
          Session.set("viewerId", viewerId);
        });
       } else if (Meteor.userId() != currentLeader().userId){
        Meteor.call("getViewer", function(err, viewerId) {
          Session.set("viewerId", viewerId);
        });
      }
      var viewer = Viewers.findOne({userId: Meteor.userId()});// 
      if(viewer){
        if(!viewer.leader){
          Viewers.update(
            { _id: viewer._id },
            { $set: { leader: true } }
          );
        }
      }
    }
  }
});

var leader = null;

var currentViewer = function(){
  return Viewers.findOne(Session.get("viewerId")) || {};
};

var currentLeader = function() {
  return Viewers.findOne({ leader: true }, { sort: { slideTime: -1 } });
};

Deps.autorun(function () {
  var leader = currentLeader();
  if(leader && leader.userId != Session.get("viewerId") && leader.currentSlide) {
    window.impress().goto(leader.currentSlide);
  }

});

Template.status.viewersCount = function() {
  return Viewers.find().count();
};

Meteor.startup(function () {
  
  Session.setDefault('get_happy', 'Oh Joy!');

  Meteor.setInterval(function() {
    if (Meteor.status().connected) {
      Meteor.call("keepalive");
    }
  }, 1000*10);

  document.getElementById("impress").addEventListener("impress:stepleave", function(event) {
    var entering = document.querySelector(".active").id;
    Meteor.call("setSlide", entering);
  });

  document.getElementById("impress").addEventListener("impress:stepenter", function(event) {
    Meteor.call("setSlide", event.target.id);
  });

  Meteor.call("getViewer", function(err, viewerId) {
    Session.set("viewerId", viewerId);
  });
});
