var $ = require('jquery');

module.exports = function(){
  $('body').append('aaa');

  $.ajax('/api/groups/1/users/1').success(function(res){
    var testEl = $('#testId');
    testEl.text([
      'id: ', res.id,
      ', groupid: ', res.groupid,
      ', userid: ', res.userid
    ].join(''));
  });
};
