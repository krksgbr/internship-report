/**
 * Created by GaborK on 10/12/15.
 */

var data;
var loading = true;

document.addEventListener('dataLoaded', function(e){
    data = e.detail;
    console.log(data);
    createCalendar();
    createLayout();
    attachEventHandlers();
});



function createCalendar(){
    var weeks = 16;
    var days = ['mon', 'tue', 'wed', 'thu', 'fri'];

    var $table = $('#cal');
    var $weeksrow = $('<tr></tr>').appendTo($table).attr('id', 'weeksrow');

    (function(){
        $weeksrow.append($('<th></th>'));
        for(var i = 0; i<weeks; i++){
            $weeksrow.append($('<th></th>').text(pad(i+1, 2)));
        }
    })();

    for( var d = 0; d<days.length; d++){
        $('<tr></tr>').addClass(days[d])
                    .append( $('<td></td>').text(days[d]).addClass('dayname') )
                    .appendTo($table);
    }


    var dayCounter = 0;
    var $week = $('<tr></tr>').addClass('calendar-week');
    data.dates.forEach(function(date){

        var lum = getColorForDailyPrdScore( data.prdScores[date]['score'] ).luminance();
        var color = chroma(lum, lum, lum, 'gl').hex();
        var $day = $('<td></td>') .addClass('calendar-day')
            .attr('data-date', date)
            .css('background-color', color);

        $("."+days[dayCounter%5]).append($day);
        dayCounter++;

    });


    $('<div></div>').text('less productive').appendTo($('#cal-legend'));
    [-2, -1, 0, 1, 2].forEach(function(num){
        $('<div></div>')
            .addClass('legend-block')
            .css('background-color', getColorForEntryPrdScore(num).hex() )
            .appendTo($('#cal-legend'));
    });

    $('<div></div>').text('more productive').appendTo($('#cal-legend'));
}


function createLayout(){
    var maxLineLength = 100;
    var dateIndex = 0;
    var weekCount = 1;
    var entryIndex = 0;
    var currentDate = data.dates[dateIndex];
    var $dayContainer = newDay(currentDate);


    var entriesLoaded = 0;
    var totalEntries = (function(){
        var count = 0;
        data.dates.forEach(function(date){
            data.logs[date].forEach(function(entry){
                if(isInWorkHour(entry)){
                    count++;
                }
            });

        });
        return count;
    }());


    var loading = setLoadingIndicator();


    var interval = setInterval(function(){

        if(entryIndex < data.logs[currentDate].length){

            var entry = data.logs[currentDate][entryIndex];
            if(isInWorkHour(entry)) {
                if (entry['document'].length > maxLineLength) {
                    entry['document'] = entry['document'].substring(0, maxLineLength) + " [...]"
                }
                var $entry = createDOMEntry(entry);
                var hexColor = getColorForEntryPrdScore(entry['productivity']).hex();
                $entry.css('background-color', hexColor)
                    .attr('data-color', hexColor)
                    .attr('data-week', weekCount)
                    .appendTo($dayContainer)
                ;

                $('#current-entry-loaded').text(entriesLoaded + ' / ' + totalEntries);
                entriesLoaded++;
            }

            entryIndex++;
        } else {
            dateIndex++;


            $('.calendar-day')
                .filter( function(){  return $(this).data('date') == currentDate;  })
                .css('background-color', getColorForDailyPrdScore( data.prdScores[currentDate]['score'] ).hex());

            if(dateIndex == data.dates.length){
                clearInterval(interval);
                clearInterval(loading);
                $('#status').children().each(function(){
                    $(this).text('');
                });
                return;
            }




            currentDate = data.dates[dateIndex];
            $dayContainer = newDay(currentDate);
            entryIndex = 0;
        }




    }, 0);


    console.log("done");
}

function isInWorkHour(entry){
    var mnt =  moment(entry['date'], moment.ISO_8601);
    if(mnt.hour() > 7 && mnt.hour() < 20) {
        return true;
    }
    return false;
}




function newDay(date){
    //console.log('date', date);
    var $day = $('<section></section>').addClass('day').attr('id', date);
    var $dayHeader = $('<div></div>')
                    .addClass('day-header')
                    .text( moment(date).format('MMMM Do, dddd' ))
                    .css('z-index', $('.day-header').length);

    $day.append( $dayHeader ).appendTo( $('.log-container') );
    $dayHeader.attr('data-orig-offset', $dayHeader.offset().top);

    return $day;
}

function attachEventHandlers(){
    $('body').on('mouseenter', '.entry', function(){
        $(this).css({'background-color': 'black'});
    });

    $('body').on('mouseleave', '.entry', function(){
        var color = $(this).data('color');
        $(this).css({'background-color': color});
    });

    $('#cal').on('click', '.calendar-day', function(){
        var $day = $('#'+ $(this).data('date'));
        //console.log('scrollTop:', $('#wrapper').scrollTop(), 'element-top:', $day.offset().top);
        var target = $day.offset().top - $('header').outerHeight()+1 + $('#wrapper').scrollTop();
        $('#wrapper').scrollTop(target);
    });

    //s.top: 2570
    //pos:   2712
    $('#wrapper').on('scroll', function(){
        //console.log($(this).scrollTop());
        $('.day-header').each(function(index, elem){

            var top = $(this).offset().top;
            if(top <=  $('header').outerHeight()){
                $(this).addClass('invisible');
                $('#current-time-header').text( $(this).text() );
                selectCalendarDay( $(this).parent().attr('id') );
            } else {
                $(this).removeClass('invisible');
            }

        });
    });
}


function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function selectCalendarDay(date){

    var $day =  $('.calendar-day').filter(function() {
        return $(this).data('date') == date;
    });

    if(!$day.hasClass('selected')){
        $('.calendar-day.selected').removeClass('selected');
        $day.addClass('selected');
    }
}
