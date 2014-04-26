jQuery.fn.shake = function(intShakes, intDistance, intDuration, foreColor) {
    this.each(function() {
        if (foreColor && foreColor!="null") {
            $(this).css("color",foreColor); 
        }
        $(this).css("position","relative"); 
        for (var x=1; x<=intShakes; x++) {
        $(this).animate({left:(intDistance*-1)}, (((intDuration/intShakes)/4)))
        .animate({left:intDistance}, ((intDuration/intShakes)/2))
        .animate({left:0}, (((intDuration/intShakes)/4)));
        $(this).css("color",""); 
    }
  });
return this;
};

$(document).ready(function() {
        
    $('.tw-btn').fadeIn(3000);
    $('.alert').delay(3000).fadeOut(1500);
    
    $('#btnLogin').click(function(){
        $(this).text("...");
        $.ajax({
            url: "/loginajax",
            type: "post",
            data: $('#formLogin').serialize(),
            success: function (data) {
                //console.log('data:'+data);
                if (data.status==1&&data.user) { //logged in
                    $('#menuLogin').hide();
                    $('#lblUsername').text(data.user.username);
                    $('#menuUser').show();
                }
                else {
                    $('#btnLogin').text("Login");
                    prependAlert("#spacer",data.error);
                    $('#btnLogin').shake(4,6,700,'#CC2222');
                    $('#username').focus();
                }
            },
            error: function (e) {
                $('#btnLogin').text("Login");
                console.log('error:'+JSON.stringify(e));
            }
        });
    });
    $('#btnRegister').click(function(){
        $(this).text("Wait..");
        $.ajax({
            url: "/signup?format=json",
            type: "post",
            data: $('#formRegister').serialize(),
            success: function (data) {
                console.log('data:'+JSON.stringify(data));
                if (data.status==1) {
                    $('#btnRegister').attr("disabled","disabled");
                    $('#formRegister').text('Thanks. You can now login using the Login form.');
                }
                else {
                    prependAlert("#spacer",data.error);
                    $('#btnRegister').shake(4,6,700,'#CC2222');
                    $('#btnRegister').text("Sign Up");
                    $('#inputEmail').focus();
                }
            },
            error: function (e) {
                $('#btnRegister').text("Sign Up");
                console.log('error:'+e);
            }
        });
    });
    
    $('.loginFirst').click(function(){
        $('#navLogin').trigger('click');
        return false;
    });
    
    $('#btnForgotPassword').on('click',function(){
        $.ajax({
            url: "/resetPassword",
            type: "post",
            data: $('#formForgotPassword').serializeObject(),
            success: function (data) {
                if (data.status==1){
                    prependAlert("#spacer",data.msg);
                    return true;
                }
                else {
                    prependAlert("#spacer","Your password could not be reset.");
                    return false;
                }
            },
            error: function (e) {
                console.log('error:'+e);
            }
        });
    });
    
    $('#btnContact').click(function(){
        
        $.ajax({
            url: "/contact",
            type: "post",
            data: $('#formContact').serializeObject(),
            success: function (data) {
                if (data.status==1){
                    prependAlert("#spacer","Thanks. We got your message.");
                     $('#contactModal').modal('hide');
                    return true;
                }
                else {
                    prependAlert("#spacer",data.error);
                    return false;
                }
            },
            error: function (e) {
                console.log('error:'+e);
            }
        });
        return false;
    });
    
    /*
    $('.nav .dropdown-menu input').on('click touchstart',function(e) {
        e.stopPropagation();
    });
    */  
});
$.fn.serializeObject = function(){
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
var prependAlert = function(appendSelector,msg){
    $(appendSelector).after('<div class="alert alert-info alert-block affix" id="msgBox" style="z-index:1300;margin:14px!important;">'+msg+'</div>');
    $('.alert').delay(3500).fadeOut(1000);
}



