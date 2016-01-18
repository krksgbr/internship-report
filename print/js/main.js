// black list: searches about alcohol, shopping, employment,


var data;
var weekCount = 1;
var pageCount = 0;
var totalWeeks = 16;

var $currentPage;

document.addEventListener('dataLoaded', function (e) {
    data = e.detail;


    var dateIndex = 0;
    $currentPage = newPage(data.dates[dateIndex]);

    var loading = setLoadingIndicator('Building book ');
    var interval = setInterval(function () {

        layoutLogs(data.dates[dateIndex]);
        dateIndex++;

        if (dateIndex % 5 == 0) {
            weekCount++;
            $currentPage = newPage(data.dates[dateIndex]);
        }

        if (dateIndex == data.dates.length) {
            clearInterval(interval);
            clearInterval(loading);
            $('#loading-indicator').text('');
            console.log("done");
        }

    }, 100);
});

function getFormattedDate(date){
    return moment(date).format('MMMM Do, dddd');
}

function newPage(date) {
    pageCount++;
    var $page = H2P.appendPage('#master-page-daily'),
        $container = $('<div></div>').addClass('log-container').attr('data-date', date);
    $page.find('.content-body').append($container);
    $page.find('.nav-date').text(getFormattedDate(date));
    $page.find('.nav-week').text("week: " + weekCount + "/" + totalWeeks);
    return $page;
}


function layoutLogs(date) {
    console.log('');
    console.log('');

    var maxLineLength = 100;


    function addDayTitle($page, date, option) {


        var text = date.indexOf('Monday') > -1 ?
                    date + ', Week ' + weekCount + '/' + totalWeeks
                    : date;

        var $titleheader = $('<div></div>').addClass('day-header');
        $titleheader.append($('<div></div>').text(text));

        if (!option || option == 'before') {
            $titleheader.insertBefore($page.find('.log-container'));
        } else {
            $titleheader.insertAfter($page.find('.log-container').last()).addClass('inbetween');
        }
    }


    function findSpareSpace($page) {
        var $container = $page.find('.log-container').last();
        return $page.find('.content-body').height() - ( $container.position().top + $container.height() );
    }

    var formattedDate = getFormattedDate(date);
    console.log('laying out log entries for', formattedDate);

    var $listContainer = $currentPage.find('.log-container');


    if($listContainer.children().length == 0){
        addDayTitle($currentPage, formattedDate);
    } else {
        var spareSpace =  findSpareSpace($currentPage);
        var threshold = $currentPage.find('.content-body').height() * 0.25;
        if (spareSpace < threshold ) {
            $currentPage = newPage(date).addClass('day-title-page');
            addDayTitle($currentPage, formattedDate);
            $listContainer = $currentPage.find('.log-container');
        } else {
            addDayTitle($currentPage, formattedDate, 'after');
            $listContainer = $('<div></div>').addClass('log-container').attr('data-date', date)
                .appendTo($currentPage.find('.content-body'));
        }
    }



    data.logs[date].forEach(function (entry) {
        var mnt = moment(entry['date'], moment.ISO_8601);
        if (mnt.hour() > 7 && mnt.hour() < 19) {

            if (entry['document'].length > maxLineLength) {
                entry['document'] = entry['document'].substring(0, maxLineLength) + " [...]"
            }

            var color = getColorForEntryPrdScore(entry['productivity']).alpha(0.8).css();
            var $line = createDOMEntry(entry).css('background-color', color);
            $listContainer.append($line);

            if (findSpareSpace($currentPage) <= 0) {
                $currentPage = newPage(date);
                $listContainer = $currentPage.find('.log-container');
            }

        }
    });
}

