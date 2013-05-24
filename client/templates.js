Template.templates.events({
  'click': function(event, template) {
    event.preventDefault();
    event.stopPropagation();
    template.find('#happyhappyjoyjoy').hidden = !template.find('#happyhappyjoyjoy').hidden;
  }
});