$(document).ready(function() {
	  var userSkin = window.profileSkin;
    var currentSkin = {};
    var currentIndex = 0;

    var loaded = false;
    $('#setting-skin').on('click', function() {
      if (!$(this).data('open')) {
        $(this).data('open', true);
        $(this).find('i').removeClass('fa-plus').addClass('fa-minus');
        if (loaded) {
          $('#skin-container').css({display:'block'});
        } else {
          $.ajax({
            url: "/api/userProfile/skins",
            type: "get",
            success: function(data) {
              if (data.code == 200) {
                loaded = true;
                data.skins.map(function(item, key) {
                  loadSkinList(item, key);
                });
                $('#skin-container').css({display:'block'});
                $('#skin-container .loading').css({display: 'none'});
              }
            }
          });
        }   
      } else {
        $(this).data('open', false);
        $(this).find('i').removeClass('fa-minus').addClass('fa-plus');
        $('#skin-container').css({display:'none'});
      }
    });
    $('.skin-list').on('click', '.item', function() {
    	$('.skin-list .item').removeClass('active');
    	$(this).addClass('active');
    	var config = $(this).data('skin');
    	currentIndex = $(this).data('index');
    	applyStyle(config);
      showBtn();
    	return false;
    });

    var loadSkinList = function(obj, index) {
      var tpl = '<div class="pull-left item"><a href=""></a></div>';
      var img = new Image();
      var $tpl = $(tpl);
      img.src = obj.header;
      $(img).appendTo($tpl.find('a'));
      $tpl.data('skin', obj).data('index', index);
      $tpl.appendTo('#skin-container .skin-list');
    };
    var applyStyle = function(config) {
    	$('.jumbotron.user-header').css({
    		'background-image': 'url(' + config.header + ')' 
    	});
    };
    var showBtn = function() {
      $('#setting-btn').css({display:'block'});
      $('#skin-container').find('hr').css({display:'block'});
    };
    var hideBtn = function() {
      $('#setting-btn').css({display:'none'});
      $('#skin-container').find('hr').css({display:'none'});
    };
    $('#setting-btn .save').on('click', function() {
    	$.ajax({
        url: "/api/userProfile/setSkin",
        type: "post",
        data: {index:currentIndex},
        success: function(data) {
          if (data.code == 200) {
            // $('#setting-skin').data('open', false);
            // $('#setting-skin').find('i').removeClass('fa-minus').addClass('fa-plus');
            // $('#skin-container').css({display:'none'});
            window.location.reload();
          }
        }
      });
      return false;
    });
    $('#setting-btn .cancel').on('click', function() {
      applyStyle(userSkin);
      $('#setting-skin').data('open', false);
      $('#setting-skin').find('i').removeClass('fa-minus').addClass('fa-plus');
      $('#skin-container').css({display:'none'});
      hideBtn();
      return false;
    });
});