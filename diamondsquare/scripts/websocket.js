var socket;

function startSocket() {

	if ('WebSocket' in window ) { socket = new WebSocket('ws://clonazia-clonzeh.rhcloud.com:8000'); }
	else { alert("Your browser doesn't support multi-player!") }
	
	try {
	socket.onerror = function(e) { console.log(e); };

	socket.onmessage = function(message) { messageHandler(message); };


	socket.onopen = function() { clonazia.finishConnecting(); };

	socket.onclose = function(e) {
	/*error message*/
        $('#retry').html('connection failed. Retrying #' + clonazia.retry + '/4');
        $('#retry').css('visibility', 'visible');
        clonazia.connecting = true;
        console.log(e);
        if(clonazia.retry >= 4) {

            $('#retry').html('connection to server failed. Retries made: ' + clonazia.retry + '/4 <br> Try again later. Sorry.');
            $('#retry').css('visibility', 'visible');
            return;
        }
        setTimeout(function() {
            if (clonazia.connecting == false) { return; }
            clonazia.retry++;
            $('#retry').html('connection failed. Retrying #' + clonazia.retry + '/4 <br> Server can take up to 14 seconds to startup.');
            $('#retry').css('visibility', 'visible');
            clonazia.retryConnection();
        }, 4500);
    };

	} catch(e) { console.log(e); }
}

//Incoming messages that change game code
function messageHandler(message) {
	
	
	var a = JSON.parse(message.data);

    if (a.id != undefined && a.id != 'gameList' && a.id != 'positionUpdate'){

        //console.log(a.answers);

    }

	switch(a.id) {

        case 'leaderboards' : leaderBoards(a.data); break;
        case 'testconnect' : clonazia.connected(); break;
        case 'namechange' : clonazia.receiveName('socket', a); break;
        case 'answerResponse' : isCorrect(a.data); break; //data is true or false
        case 'repeat' :


            var data = LZString.decompressFromUTF16(a.data);

            var readableData = JSON.parse(data);

            var gets = function(obj) {

                var size = 0, key;
                for (key in obj) {

                     if (obj.hasOwnProperty(key)) size++;
                }
                     return size;
            };
            var tsize = gets(readableData);
            var arr = [];

            //split up data so no error from max call stack
            for (var i = 0; i < tsize / 2; i++) {

                arr.push(readableData[i]);
            }
            for (var i = tsize / 2; i < tsize; i++) {

                arr.push(readableData[i]);
            }
            /*
            var array = $.map(readableData, function(value, index) { //convert 'object array' to 'array'
                return [value];
            });
            console.log(array);*/

            /*var size = function(obj) {
                var size = 0, key;
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) size++;
                }
                return size;
            };*/


            displayImage(arr, a.answers);

	}
}

function connected() { return socket.readyState == 1; }

function sendPacket(data) {

    /*Value	Description
     CONNECTING	0	The connection is not yet open.
     OPEN	    1	The connection is open and ready to communicate.
     CLOSING	2	The connection is in the process of closing.
     CLOSED	    3	The connection is closed or couldn't be opened.*/

    if (socket.readyState == 1) {


        try {
           // console.log('sending');
            //console.log(data.move);
            socket.send(JSON.stringify(data));
        }
        catch (e) {
            /*alert("cannot Send data - restarting."); clonazia.restart();*/
            console.warn(e);
        }
    } else {
        /*alert('lost connection - restarting');
        clonazia.restart();*/
        console.log('not connected');
    }
}
