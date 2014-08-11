$(document).ready(function() {
	if (!window.author) {
		return false;
	}
	var $notify = $('#notify');
	var $tag = $notify.find('.notify-tag').css({display:'none'});
	var $loading = $notify.find('#dropdown-loading');
	var $content = $notify.find('#dropdown-notice');
	var tpl = $content.html();
	var parse = function(obj) {
		var template = tpl;
		var content = '<li><a href="/request/notice">__content__</a></li>';
		var none = '<li><a href="">暂时没有通知</a></li>';

		var parsed = template.replace('__info__', obj.info)
			.replace('__request__', obj.connect + obj.group)
			.replace('__connect__', obj.connect ? obj.connect + '个' : '')
			.replace('__group__', obj.group ? obj.group + '个' : '');

		var str = '';
		if (!obj.content.length) {
			str = none;
		} else {
			obj.content.map(function(item, key) {
				var string = content;
				str += string.replace('__content__', item.content);
			});
		}
		$content.html(parsed);
		$content.find('#dropdown-notice').html(str);
	};
	$notify.on('show.bs.dropdown', function() {
		$loading.css({display: 'block'});
		$.ajax({
            url: "/api/notify/shortNotice",
            type: "get",
            success: function(data) {
                if (data.code === 200) {
                	$loading.css({display: 'none'});
                	$content.css({display: 'block'});
                	data.comment = notify.comment;
                	data.at = notify.at;
                	data.group = notify.group;
                	data.connect = notify.connect;
                	data.info = notify.info;
                    parse(data);
                }
            }
        });
	});
	$notify.on('hide.bs.dropdown', function() {

	});

	// msg
    var $msg = $('#notifyMsg');
    var $comment = $msg.find('.dropdown-comment a');
    var $at = $msg.find('.dropdown-at a');
    var $count = $msg.find('.notify-tag').css({display: 'none'});

    // init
	var notify = {};
	setTimeout(function() {
		$.ajax({
	        url: "/api/notify",
	        type: "get",
	        success: function(data) {
	            if (data.code === 200) {
	            	notify.comment = data.comment || 0;
	            	notify.at = data.at || 0;
	            	notify.info = data.info || 0;
	            	notify.connect = data.connect || 0;
	            	notify.group = data.group || 0;

	            	if (notify.group + notify.connect + notify.info > 0) {
	            		$tag.css({display: 'block'});
	            	}
	            	if (notify.comment + notify.at > 0) {
	            		$count.css({display: 'block'});
	            		$count.text(notify.comment + notify.at);
	            	}
	            	if (notify.comment > 0) {
	            		$comment.text(notify.comment + ' 个新回复');
	            	} else {
	            		$comment.text('查看评论');
	            	}
	            	if (notify.at) {
	            		$at.text(notify.at + ' 个@到你');
	            	} else {
	            		$at.text('查看@我');
	            	}
	            }
	        }
	    });
	}, 100);
});