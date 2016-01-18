

(function(){


    var categoryMap = {
        "Science & Technology":"Technology",
        "General Software Development":"Software Development",
        "Systems Operations":"Software Development",
        "Engineering & Technology": "Technology",
        "Editing & IDEs":"Software Development",
        "General Entertainment":"Entertainment",
        "General Utilities": "Utilities",
        "Internet Utilities": "Utilities",
        "General Reference & Learning":"Reference & Learning",
        "General News & Opinion": "News & Opinion",
        "General Communication & Scheduling":"Organization",
        "General Social Networking":"Social Networking",
        "Uncategorized":"Other",
        "General Business": "Business",
        "Quality Assurance":"Other",
        "Sports":"Other",
        "Operations":"Other",
        "Electronics": "Other",
        "Travel & Outdoors": "Other",
        "File Sharing": "Business",
        "Presentation": "Business",
        "Health & Medicine": "Other",
        "Maps & Regional": "Other",
        "Communication & Scheduling": "Organization"

    };




    var logs = {};
    var dates = [];
    var prdScores;


    function fetchPrScores(){
        $.getJSON(
            'shared/data/prdScores.json',
            function(data){
                prdScores = data;
                document.dispatchEvent(

                    new CustomEvent('dataLoaded',
                        {   'detail': {
                                'dates': dates,
                                'prdScores': prdScores,
                                'logs': logs
                            }
                        })

                );
            }
        );
    }

    function fetchLogs(callback){

        var a = moment('2015-07-27');
        //var b = moment('2015-08-08');
        var b = moment('2015-11-14');
        var last = b.clone().subtract(1, 'days').format('YYYY-MM-DD');


        console.log(last, b.format('YYYY-MM-DD'));


        function fixCategory(entry){
            var oldcat = entry['category'];
            if(oldcat in categoryMap){
                entry['category'] = categoryMap[oldcat];
            }
        }


        function addToLogs(d){
            for( k in d) {
                logs[k] = d[k];
                logs[k].forEach(function(entry){
                    fixCategory(entry);
                });
            }
        }

        function isWeekend(d){
            return (d == 6) || (d == 0);
        }

        console.log('collecting data');
        console.log(window.location.href);
        for (var m = a; m.isBefore(b); m.add(1, 'days')) {
            if(!isWeekend( m.day() )){
                var date = m.format('YYYY-MM-DD');
                dates.push(date);
                $.getJSON(
                    'shared/data/'+date+'.json',
                    !(date == last) ? function(d){  addToLogs(d);  } : function(d){ addToLogs(d); callback(); }
                );
            }
        }
    }

    fetchLogs(  fetchPrScores );


})();



function createDOMEntry(logEntry){
    var $entry = $('<div></div>').addClass('entry');
    $('<div></div>').addClass('timestamp').text(logEntry['time']).appendTo( $entry );
    $('<div></div>').addClass('category').text(logEntry['category']).appendTo( $entry );
    $('<div></div>').addClass('documentTitle').text(logEntry['document']).appendTo($entry);
    return $entry;
}

var productive = 'FF002B';
var lazy = '008ae5';
function getColorForDailyPrdScore ( score ){
    var normScore = ( score - data.prdScores['min']) / (data.prdScores['max']-data.prdScores['min'] );
    return chroma.interpolate(lazy, productive, normScore);
}

function getColorForEntryPrdScore ( score ){
    var normScore = ( score - (-2)) / (2-(-2));
    return chroma.interpolate(lazy, productive, normScore);
}

function setLoadingIndicator(text){
    text = text || "Loading entries ";
    var dots = ['', '.', '..', '...'];
    var dotIndex = 0;
    return setInterval(function () {

        $('#loading-indicator').text(text + dots[dotIndex]);
        dotIndex = (dotIndex + 1) % dots.length;

    }, 200);
}








