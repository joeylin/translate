jQuery.fn.shake = function(intShakes, intDistance, intDuration, foreColor) {
    this.each(function() {
        if (foreColor && foreColor != "null") {
            $(this).css("color", foreColor);
        }
        $(this).css("position", "relative");
        for (var x = 1; x <= intShakes; x++) {
            $(this).animate({
                left: (intDistance * -1)
            }, (((intDuration / intShakes) / 4)))
                .animate({
                    left: intDistance
                }, ((intDuration / intShakes) / 2))
                .animate({
                    left: 0
                }, (((intDuration / intShakes) / 4)));
            $(this).css("color", "");
        }
    });
    return this;
};

$(document).ready(function() {
    var setUser = function(userObj) {
        var username = $('.user_name');
        var createAt = $('.user_creatAt');
        var avatar = $('.user_avatar');
        var follower = $('.user_follower');
        var praise = $('.user_praise');
        var connects = $('.user_connects');
        var lblUsername = $('#lblUsername');

        if (!userObj) {
            username.text('');
            createAt.text('');
            avatar.src = '';
            follower.text('');
            praise.text('');
            connects.text('');
            lblUsername.text('');
            window.user = null;
        } else {
            lblUsername.text(userObj.name);
            username.text(userObj.name);
            createAt.text(userObj.createAt);
            avatar.src = userObj.avatar;
            follower.text(userObj.followers);
            praise.text(userObj.praise);
            connects.text((userObj.connects && userObj.connects.length) || 0);
        }
    };
    if (!window.user) {
        $('#menuLogin').show();
        $('#menuUser').hide();
    } else {
        $('#menuLogin').hide();
        $('#menuUser').show();
        setUser(user);
    }
    var redirectTo = window.location.search.replace('?', '').split('=')[1];
    $('#btnLogin').click(function() {
        $(this).text("...");
        var data = {
            name: $('#username').val(),
            password: $('#password').val()
        };
        $.ajax({
            url: "/api/user/login",
            type: "post",
            data: data,
            success: function(data) {
                if (data.code == 200 && data.user) { //logged in
                    setUser(data.user);
                    $('#btnLogin').text("Login");
                    $('#menuLogin').hide();
                    $('#menuUser').show();
                    $('#menuNotify').show();
                    if (!redirectTo) {
                        redirectTo = '/home';
                    }
                    window.location.href = redirectTo;
                } else {
                    $('#btnLogin').text("Login");
                    $('#btnLogin').shake(4, 6, 700, '#CC2222');
                    $('#username').focus();
                }
            },
            error: function(e) {
                $('#btnLogin').text("Login");
                console.log('error:' + JSON.stringify(e));
            }
        });
    });
    $('#btnLogout').click(function() {
        $.ajax({
            url: "/api/user/logout",
            type: "post",
            success: function(data) {
                if (data.code === 200) {
                    setUser(null);
                    $('#menuLogin').show();
                    $('#menuUser').hide();
                    $('#menuNotify').hide();
                    window.location.href = '/login';
                }
            }
        });
    });
    $('#password').on('keydown', function(e) {
        var key = e.keyCode || e.which;
        if (key === 13) {
            $('#btnLogin').click();
        }
    });
});