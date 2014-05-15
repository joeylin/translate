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
        var username = $('.user_username');
        var createAt = $('.user_creatAt');
        var avatar = $('.user_avatar');
        var follower = $('.user_follower');
        var praise = $('.user_praise');
        var connects = $('.user_connects');

        if (!userObj) {
            username.text('');
            createAt.text('');
            avatar.src = '';
            follower.text('');
            praise.text('');
            connects.text('');
        } else {
            username.text(userObj.username);
            createAt.text(userObj.createAt);
            avatar.src = userObj.avatar;
            follower.text(userObj.followers);
            praise.text(userObj.praise);
            connects.text((userObj.connects && userObj.connects.length) || 0);
        }
    };
    if (!user) {
        $('#menuLogin').show();
        $('#menuUser').hide();
        setUser(user);
    } else {
        $('#menuLogin').hide();
        $('#menuUser').show();
    }
    $('#btnLogin').click(function() {
        $(this).text("...");
        var data = {
            username: $('#username').val(),
            password: $('#password').val()
        };
        $.ajax({
            url: "/api/user/login",
            type: "post",
            data: $('#formLogin').serialize(),
            success: function(data) {
                if (data.code == 200 && data.user) { //logged in
                    setUser(data.user);
                    $('#menuLogin').hide();
                    $('#menuUser').show();
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
        setUser(null);
        $('#menuLogin').show();
        $('#menuUser').hide();
    });
});