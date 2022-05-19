var omicEditable = {
    elCount : 0,
    editText : function(el, type){
        if($(el).data("disabled") == 1){
            return;
        }
        $(el).data("disabled", 1);
        var valu = typeof $(el).data("edit-valu") == "undefined" ? $(el).text() : $(el).data("edit-valu");
        $(el).data("edit-valu", valu);
        $(el).html('<input type="'+type+'" name="val" value="" class="form-control" data-editcount="'+omicEditable.elCount+'" />');
        $(el).parent().addClass("edit-focus");
        $("[data-editcount="+omicEditable.elCount+"]").keyup(function(e){
            if(e.which == 27){
                $(this).val(valu);
                omicEditable.close(this);
            } else if(e.which == 13 && $(this).val()==valu){
                omicEditable.close(this);
            } else if(e.which == 13){
                omicEditable.save(this);
            }
        }).blur(function(){
            if($(this).val()==valu){
                omicEditable.close(this);
            } else {
                omicEditable.save(this);
            }
        }).focus().val(valu);
    },
    editSelect : function(el){
        if($(el).data("disabled") == 1){
            return;
        }
        $(el).data("disabled", 1);
        var options = $(el).data("edit-options");
        if(typeof options != "undefined"){
            this.fillSelectOptions(el, options);
            return null;
        }
        var src = $(el).data("edit-options-src");
        if(typeof src != "undefined"){
            var rf = function(result){
                if(!result.success){
                    console.log(result);
                } else {
                    omicEditable.fillSelectOptions(el, result.data);
                }
            };
            var opt = {
                url : src,
                cb : rf
            };
            omicEditable.ajaxSubmit(opt);
        }
    },
    fillSelectOptions : function(el, options){
        var valu = typeof $(el).data("edit-valu") == "undefined" ? $(el).text() : $(el).data("edit-valu");
        var d = typeof $(el).data("edit-display-field") == "undefined" ? "label" : $(el).data("edit-display-field");
        var c = typeof $(el).data("edit-value-field")   == "undefined" ? "value" : $(el).data("edit-value-field");
        
        var s = "<select class=\"form-control\" name=\"val\" data-editcount=\""+omicEditable.elCount+"\">";
        if($(el).data("edit-clear")){
            s += "<option></option>";
        }
        $.each(options, function(i, item){
            var sel = (item[c] == valu) ? "selected" : "";
            s += "<option value=\""+item[c]+"\" "+sel+">"+item[d]+"</option>";
        });
        s += "</select>";
        
        $(el).html(s);
        $(el).data("edit-valu", valu);
        $(el).parent().addClass("edit-focus");
        $("[data-editcount="+omicEditable.elCount+"]").keyup(function(e){
            if(e.which == 27){
                omicEditable.close(this);
            }
        }).change(function(){
            omicEditable.save(this);
        }).blur(function(){
            omicEditable.close(this);
        }).focus();
    },
    close:function(el){
        $(el).parent().parent().removeClass("edit-focus");
        if($(el).find("option").length > 0){
            return this.closeSelect(el);
        }
        $(el).parent().data("disabled", 0);
        $(el).parent().data("edit-valu", $(el).val());
        $(el).parent().text($(el).val());
    },
    closeSelect : function(el){
        $(el).parent().data("disabled", 0);
        if($(el).parent().data("edit-valu") != "undefined"){
            $(el).parent().data("edit-valu", $(el).val());
        }
        
        if($(el).val() == ""){
            $(el).parent().text("");
        } else {
            $(el).parent().text($(el).find("option[value=\""+$(el).val()+"\"]").text());
        }
    },
    save: function(el, value, vText){
        var data = {
            field : $(el).parent().data("edit-field"),
            value : typeof value != "undefined" ? value : $(el).val()
        };
        var rf = function(result){
            $($(el).parent()).data("disabled", 0);
            if(!result.success){
                console.log(result);
                var v = $(el).parent().data("edit-valu");
                if($("option", $(el)).length > 0){
                    v = $("option[value='"+v+"']", $(el)).text() || "";
                }
                $(el).parent().parent().removeClass("edit-focus");
                $(el).parent().text(v);
            } 
            else {
                var cb = $(el).parent().data("edit-cb");
                if(typeof cb == "function"){
                    cb(data, result);
                }
                omicEditable.close(el);
            }
        };
        var opt = {
            url : $(el).parent().data("edit-url") || $(el).parents(".edit-data").data("edit-url"),
            data : data,
            cb : rf
        };
        if(!opt.url){
            omicEditable.close(el);
        }
        else {
            omicEditable.ajaxSubmit(opt);
        }
    },
    ajaxSubmit : function(options){
        var opt = {
            data : "",
            type : "POST",
            url : "",
            form : null,
            async : true,
            cb : function(){},
            error : function(r){
                console.error(r);
            },
            dataType : "json",
            processData : true,
            contentType : "application/x-www-form-urlencoded; charset=UTF-8"
        };
        for(var i in options){
            opt[i] = options[i];
        }
        return $.ajax({
            url : opt.url,
            type : opt.type,
            data : opt.data,
            success : opt.cb,
            async : opt.async,
            dataType : opt.dataType,
            processData: opt.processData,
            contentType: opt.contentType,
            error : opt.error
        });
    }
};


$(document).on("dblclick", "td.editable", function (e) {
    var el = $(this).find(".edit-data");
    var type = $(el).data("edit-type");
    if(el.length == 0){
        return;
    }
    omicEditable.elCount++;
    switch(type){
        case "text" :
        case "number" : 
        case "email" : 
        case "tel" : 
        case "date" :
            omicEditable.editText(el, type);
            break;
        case "select" :
            omicEditable.editSelect(el);
            break;
        default : 
            omicEditable.editText(el, "text");
            break;
    }
});