function tooltip() {

    this.tooltips = [];
    this.layout = this.createLayouts(); //returns object array


}


tooltip.prototype.createLayouts = function() {

    var layouts = [];
    layouts['main'] = function(title, summary, cooldown, cooldownImage, lore) {

        var layStart = "<div id='standard-tooltip'>";
        var setTitle = title != "" ? "<div class='cOH'>" + "<p style='text-decoration: underline;text-align: center;font: 17px Georgia'>" + title + "</p>" + "</div>" : "";
        var setSummary =  summary != "" ? "<p style=''>" + summary + "</p>" : "";
        var setCooldown =  cooldown != "" ? "<div style='color: Gold; height: 15px;'>" + "Cooldown: " + cooldown + "<span id='cooldownImageHolder'></span>" + "</div>" : "";
        var loreNote = lore != "" ? "<div style='color: white; font: 10px Arial; padding-top: 20px;'>" + lore + "</div>" : "";
        var layEnd = "</div>";
        var total = layStart + setTitle +  setSummary  + setCooldown  + loreNote + layEnd;
        $('#tooltip').append(total);

        $('#standard-tooltip').css({
            paddingLeft: '20px', paddingRight: '20px', paddingBottom: '7px', position: 'relative'

        });
        $('#cooldownImageHolder').prepend('<img id="cooldownImage"/>');
        var cdimg =  $('#cooldownImage');
        cdimg.attr('src', cooldownImage);
        cdimg.attr('height', '13px');
        cdimg.attr('width', '13px');
    };

    layouts['ability'] = function(unitAbilityTooltip) { // function() { return abilities['fireball'].getStats; }

        var layStart = "<div id='standard-tooltip'>";
        var setTitle = title != "" ? "<div class='cOH'>" + "<p style='text-decoration: underline;text-align: center;font: 17px Georgia'>" + title + "</p>" + "</div>" : "";
        var setSummary =  summary != "" ? "<p style=''>" + summary + "</p>" : "";

        //if a stat is undefined : automatically discard it from the tooltip
        //  by using  var blahblah = ability.stat != undefined ? asdf : "";
        // asdf would be if it exists,  "" is if it doesnt exist.

        //example: var setCastType = 'passive' or 'target'
        //example: var targetType = 'enemy unit' or 'ally hero'


        var setCooldown =  cooldown != "" ? "<div style='color: Gold; height: 15px;'>" + "Cooldown: " + cooldown + "<span id='cooldownImageHolder'></span>" + "</div>" : "";
        var loreNote = lore != "" ? "<div style='color: white; font: 10px Arial; padding-top: 20px;'>" + lore + "</div>" : "";
        var layEnd = "</div>";
        var total = layStart + setTitle +  setSummary  + setCooldown  + loreNote + layEnd;
        $('#tooltip').append(total);

        $('#standard-tooltip').css({
            paddingLeft: '20px', paddingRight: '20px', paddingBottom: '7px', position: 'relative'

        });
        $('#cooldownImageHolder').prepend('<img id="cooldownImage"/>');
        var cdimg =  $('#cooldownImage');
        cdimg.attr('src', cooldownImage);
        cdimg.attr('height', '13px');
        cdimg.attr('width', '13px');
    };



    return layouts;
};
var tp = new tooltip();

function presetlay() {

    var dummyText = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.';
    var dummyLore = 'A pair of tough-skinned boots that change to meet the demand of the wearer.';
    tp.layout.main('Main layout Title(Treads)', dummyText, '50', 'images/character.png', dummyLore);
}

tooltip.prototype.add = function (target, edit, layout) {


    target.unbind('mouseenter mouseleave');
    var object = {


        follow: true,
        top: 'auto',
        bottom: function() { return target.position().top - target.css('marginTop'); },
        right: 'auto',
        left: 'autp', //dynamic : function() { return target.position().left; },

        width: 150,
        height : 'auto',
        padding : '0px',
        //text : '',
        wordwrap : 'normal',
        boundaries: { //what should tooltip try to fit inside
            x: 0, y: 0,
            width: window.innerWidth,
            height: window.innerHeight},
        backgroundcolor: 'rgba(40, 40, 40, 0.95)',
        border: '1px solid rgba(80,80,80,1)'
    };

    if (edit != undefined) {

        deepCopy(edit, object);
    }


    var enter = function(event) {

        var th = $(this);
        var tt = $('#tooltip');
        tt.runMovement = true;

        this.object = object;


        //tt[0].innerHTML = object.text;
        tt.removeAttr('style');
        tt.css({

            width: '100px',
            height: '100px', backgroundColor: 'rgba(20,20,20,0.95)',
            color: 'white', wordBreak: 'break-all', zIndex: '500'
        });

        tt.empty(); //reset the layout to nothing

        layout();

        tt.css({

            display: 'none',
            visibility: 'visible',
            top: object.top,
            bottom: object.bottom,
            right: object.right,
            left: object.left,

            width: object.width,
            height: object.height,

            padding: object.padding,
            wordBreak: object.wordwrap,

            backgroundColor: object.backgroundcolor,
            border: object.border

        });

        if (object.follow == true) {

            th.mousemove(function(event) {


                //bottom right1
                 /* tt.css({top: th.position().top + event.offsetY + 5,
                 left: th.position().left + event.offsetX + 10
                 });*/

                //top right
                /*tt.css({bottom: th.position().top - event.offsetY + 25,
                    left: th.position().left + event.offsetX + 10
                });*/

                //top left
                /* tt.css({bottom: th.position().top - event.offsetY + 25,
                 left: th.position().left - tt.width() + event.offsetX - 50
                 });*/

                //bottom left
               /* tt.css({top: th.position().top + event.offsetY + 5,
                 left: th.position().left - tt.width() + event.offsetX - 50
                 });*/

                if (object.test == undefined) {
                    //top center
                    tt.css({
                        top: th.offset().top - (tt.height() + 25) + event.offsetY,
                        left: th.position().left - tt.width() / 2 + event.offsetX
                    });
                } else {

                    //bottom center
                    tt.css({top: th.offset().top + 10 + event.offsetY,
                        left: th.position().left - tt.width() / 2 + event.offsetX
                    });
                }


            });



        }

        tt.fadeIn(700);

    };

    var addthis = target; // $('#submitName');

    this.tooltips.push(addthis);
    addthis.mouseenter(enter);
  //  addthis.on('mouseover', hover);

    addthis.mouseleave(

        function() {
            var tt = $('#tooltip');
            target.unbind('mousemove');
            tt.fadeOut(0);
            tt.stop( true, true ).fadeIn();
            tt.css({ visibility: 'hidden'});

        }
    );



};

/*HELPER FUNCTION*/
function deepCopy(src, dest) {
    var name,
        value,
        isArray,
        toString = Object.prototype.toString;

    // If no `dest`, create one
    if (!dest) {
        isArray = toString.call(src) === "[object Array]";
        if (isArray) {
            dest = [];
            dest.length = src.length;
        }
        else { // You could have lots of checks here for other types of objects
            dest = {};
        }
    }

    // Loop through the props
    for (name in src) {
        // If you don't want to copy inherited properties, add a `hasOwnProperty` check here
        // In our case, we only do that for arrays, but it depends on your needs
        if (!isArray || src.hasOwnProperty(name)) {
            value = src[name];
            if (typeof value === "object") {
                // Recurse
                value = deepCopy(value);
            }
            dest[name] = value;
        }
    }

    return dest;
}
