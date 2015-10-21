var langs =
[['Afrikaans',       ['af-ZA']],
 ['Bahasa Indonesia',['id-ID']],
 ['Bahasa Melayu',   ['ms-MY']],
 ['Català',          ['ca-ES']],
 ['Čeština',         ['cs-CZ']],
 ['Deutsch',         ['de-DE']],
 ['English',         ['en-AU', 'Australia'],
                     ['en-CA', 'Canada'],
                     ['en-IN', 'India'],
                     ['en-NZ', 'New Zealand'],
                     ['en-ZA', 'South Africa'],
                     ['en-GB', 'United Kingdom'],
                     ['en-US', 'United States']],
 ['Español',         ['es-AR', 'Argentina'],
                     ['es-BO', 'Bolivia'],
                     ['es-CL', 'Chile'],
                     ['es-CO', 'Colombia'],
                     ['es-CR', 'Costa Rica'],
                     ['es-EC', 'Ecuador'],
                     ['es-SV', 'El Salvador'],
                     ['es-ES', 'España'],
                     ['es-US', 'Estados Unidos'],
                     ['es-GT', 'Guatemala'],
                     ['es-HN', 'Honduras'],
                     ['es-MX', 'México'],
                     ['es-NI', 'Nicaragua'],
                     ['es-PA', 'Panamá'],
                     ['es-PY', 'Paraguay'],
                     ['es-PE', 'Perú'],
                     ['es-PR', 'Puerto Rico'],
                     ['es-DO', 'República Dominicana'],
                     ['es-UY', 'Uruguay'],
                     ['es-VE', 'Venezuela']],
 ['Euskara',         ['eu-ES']],
 ['Français',        ['fr-FR']],
 ['Galego',          ['gl-ES']],
 ['Hrvatski',        ['hr_HR']],
 ['IsiZulu',         ['zu-ZA']],
 ['Íslenska',        ['is-IS']],
 ['Italiano',        ['it-IT', 'Italia'],
                     ['it-CH', 'Svizzera']],
 ['Magyar',          ['hu-HU']],
 ['Nederlands',      ['nl-NL']],
 ['Norsk bokmål',    ['nb-NO']],
 ['Polski',          ['pl-PL']],
 ['Português',       ['pt-BR', 'Brasil'],
                     ['pt-PT', 'Portugal']],
 ['Română',          ['ro-RO']],
 ['Slovenčina',      ['sk-SK']],
 ['Suomi',           ['fi-FI']],
 ['Svenska',         ['sv-SE']],
 ['Türkçe',          ['tr-TR']],
 ['български',       ['bg-BG']],
 ['Pусский',         ['ru-RU']],
 ['Српски',          ['sr-RS']],
 ['한국어',            ['ko-KR']],
 ['中文',             ['cmn-Hans-CN', '普通话 (中国大陆)'],
                     ['cmn-Hans-HK', '普通话 (香港)'],
                     ['cmn-Hant-TW', '中文 (台灣)'],
                     ['yue-Hant-HK', '粵語 (香港)']],
 ['日本語',           ['ja-JP']],
 ['Lingua latīna',   ['la']]];

for (var i = 0; i < langs.length; i++) {
    select_language.options[i] = new Option(langs[i][0], i);
}
select_language.selectedIndex = 6;
updateCountry();
select_dialect.selectedIndex = 6;
showInfo('info_start');

function updateCountry() {
    for (var i = select_dialect.options.length - 1; i >= 0; i--) {
        select_dialect.remove(i);
    }
    var list = langs[select_language.selectedIndex];
    for (var i = 1; i < list.length; i++) {
        select_dialect.options.add(new Option(list[i][1], list[i][0]));
    }
    select_dialect.style.visibility = list[1].length == 1 ? 'hidden' : 'visible';
}

var create_email = false;
var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
if (!('webkitSpeechRecognition' in window)) {
    upgrade();
} else {
    start_button.style.display = 'inline-block';
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = function() {
        recognizing = true;
        showInfo('info_speak_now');
        start_img.src = 'mic-animate.gif';
    };

    recognition.onerror = function(event) {
        if (event.error == 'no-speech') {
            start_img.src = 'mic.gif';
            showInfo('info_no_speech');
            ignore_onend = false;
//            recognition.stop();
        }
        if (event.error == 'audio-capture') {
            start_img.src = 'mic.gif';
            showInfo('info_no_microphone');
            ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
            if (event.timeStamp - start_timestamp < 100) {
                showInfo('info_blocked');
            } else {
                showInfo('info_denied');
            }
            ignore_onend = true;
        }
    };

    recognition.onend = function() {
        recognizing = false;
        if (ignore_onend) {
            return;
        }
        start_img.src = 'mic.gif';
        if (!final_transcript) {
            showInfo('info_start');
            return;
        }
        showInfo('');
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
            var range = document.createRange();
            range.selectNode(document.getElementById('final_span'));
            window.getSelection().addRange(range);
        }

        // CSC412 - added agent waiting condition
        console.log("reached here in the onend function");
        if (agent_waiting){
            run_machine(final_transcript);
        }
    };

    recognition.onresult = function(event) {
        var interim_transcript = '';
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        final_span.innerHTML = linebreak(final_transcript);
        interim_span.innerHTML = linebreak(interim_transcript);
        
    };
}

function upgrade() {
    start_button.style.visibility = 'hidden';
    showInfo('info_upgrade');
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
    return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
    return s.replace(first_char, function(m) { return m.toUpperCase(); });
}



function showInfo(s) {
    if (s) {
        for (var child = info.firstChild; child; child = child.nextSibling) {
            if (child.style) {
                child.style.display = child.id == s ? 'inline' : 'none';
            }
        }
        info.style.visibility = 'visible';
    } else {
        info.style.visibility = 'hidden';
    }
}



/* CSC412 - HW4 - Automated agent js */

var msg = new SpeechSynthesisUtterance();
var voices = window.speechSynthesis.getVoices();
msg.voice = voices[10]; // Note: some voices don't support altering params
msg.voiceURI = 'native';
msg.volume = 1; // 0 to 1
msg.rate = 0.7; // 0.1 to 10
msg.pitch = 0.8; //0 to 2
//msg.text = 'Hello World';
msg.lang = 'en-US';

msg.onend = function(e) {
    console.log('Finished in ' + event.elapsedTime + ' seconds.');
};


/*  This represents a state machine which is defined in the report for this homework
    under the "Automated Agent" item.*/

var current_state = 0;
var state; //state placeholder
var agent_waiting = false;

var agent_state_machine = {
    0: {'action':'speak',
        'text':'Welcome to Internet Provider Auto Service',
        'input_map':{'null':1},
        'screen_output':''},
    1: {'action':'speak',
        'text':'Enter a menu by saying one of the listed options',
        'input_map':{'null':2},
        'screen_output':'Main Menu:<br/>1 - Account Information<br/>2 - Techincal Support<br/>3 - Product Information<br/><br/>'},
    2: {'action':'listen',
        'input_map':{'account information':3,'technical support':'end','product_information':'end'},
        'screen_output':''},
    3: {'action':'speak',
        'text':'Account Information Selected. Choose one of the listed options',
        'input_map':{'null':4},
        'screen_output':'Account Information Selected. Choose one of the listed options<br/>1 - Check Balance<br/>2 - Pay Balance<br/><br/>'},
    4: {'action':'listen',
        'text':'',
        'input_map':{'check balance':5,'pay balance':7},
        'screen_output':''},
    5: {'action':'speak',
        'text':'Check balance selected. Your current balance is 20 dollars. Do you want to pay your balance now?',
        'input_map':{'null':6},
        'screen_output':''},
    6: {'action':'listen',
        'text':'',
        'input_map':{'yes':7,'no':1},
        'screen_output':'Your current balance is 20 dollars.<br/>Do you want to pay your balance now?<br/><br/>'},
    7: {'action':'speak',
        'text':'Please provide your credit card number',
        'input_map':{'null':8},
        'screen_output':''},
    8: {'action':'listen',
        'text':'',
        'input_map':{'valid':9,'invalid':8},
        'screen_output':'Please provide your credit card number (12 digits)<br/>1111111111111111<br/><br/>'},
    9: {'action':'speak',
        'text':'Thank you for using Internet Provider auto service',
        'input_map':{'null':'end'},
        'screen_output':'Thank you for using Internet Provider auto service<br/>'},
    'end':{'action':'speak',
        'text':'Good bye',
        'screen_output':'Good bye<br/>'},
}

/***************************************************
    Triggers/stops listening inside the state machine
****************************************************/
function startButton(event) {
    if (recognizing) {
        recognition.stop();
        return;
    }
    final_transcript = '';
    recognition.lang = select_dialect.value;
    recognition.start();
    ignore_onend = false;
    final_span.innerHTML = '';
    interim_span.innerHTML = '';
    start_img.src = 'mic-slash.gif';
    showInfo('info_allow');
    start_timestamp = event.timeStamp;
}

/****************************************************
    Main function called when Call Support is clicked
    its the state machine running
*****************************************************/
function start_session(){
    run_machine();
}

function run_machine(user_input){
    if (current_state != 'end'){

        // get current's state info
        assert(typeof(agent_state_machine[current_state]) != "undefined" , "Tried to reach an invalid state: "+current_state);
        state = agent_state_machine[current_state];

        // perform the action on the state
        if (state.action == 'speak'){

            console.log('Entered speak action in state: ' + current_state);

            //Speak current's state text
            msg.text = state.text;
            //speechSynthesis.speak(msg);
            console.log(JSON.stringify(speechSynthesis.speaking));
            while (speechSynthesis.speaking){
                sleep(500);
                console.log(JSON.stringify(speechSynthesis.speaking));
            }

            // update Agents Text box 
            if (state.screen_output != '')
                document.getElementById("agents_final_span").innerHTML += state.screen_output;

            //update the next state
            current_state = state.input_map['null'];

            // if new state is reached, run machine again
            run_machine();

        }else{
            // if it is not a speak action, it has to be listen, otherwise it is an error
            assert(state.action == 'listen',"invalid action type: " + state.action);

            console.log('Entered listen action in state: ' + current_state);

            if (typeof(user_input) == 'undefined'){
                // update Agents Text box 
                if (state.screen_output != '')
                    document.getElementById("agents_final_span").innerHTML += state.screen_output;
                document.getElementById("agents_final_span").innerHTML += "<br/>Waiting for users input<br/>";

                // call speech API
                startButton(event);

                // activate agent waiting flag
                agent_waiting = true;

            }else{
                if (user_input in state.input_map){
                    agent_waiting = false;
                    //if the answer is recognized, use it 
                    current_state = state.input_map[user_input];

                    document.getElementById("agents_final_span").innerHTML += "<i>User:</i> " + user_input +"<br/><br/>";
                    // go to the next state
                    run_machine();
                }else{
                    console.log('almost reached the right place: ' + user_input);
                    //if something was recognized but is not mapped, restart recognition
                    document.getElementById("agents_final_span").innerHTML += "<br/>Invalid answer. Try again<br/>";
                    startButton(event);
                }
            }


            /*
            switch('final transcript'){
                case 2:
                    current_state = state.input_map['account information'];
                    break;
                case 4:
                    current_state = state.input_map['pay balance'];
                    break;
                case 6:
                    current_state = state.input_map['yes'];
                    break;
                default:
                    current_state = state.input_map['valid'];
                    break;

            }*/
        }

        //console.log('Current state'+ JSON.stringify(state));
        //console.log('Next current state: '+ current_state);
    }else{
        state = agent_state_machine[current_state];
        document.getElementById("agents_final_span").innerHTML += state.screen_output;
    }
//    speechSynthesis.speak(msg);
}





/********************************
    Util functions
********************************/

function assert(cond,error_msg){
    if (!cond){
        console.log("Assertion error");
        alert("Assertion error: " + error_msg);
    }
}


// sleep function -- http://stackoverflow.com/questions/16873323/javascript-sleep-wait-before-continuing 
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

/* CSC 412 - Suggested helper function */

// Takes a string as input, and returns the number of 
// words as output.
// Ex: "The quick brown fox jumps over the lazy dog" would return 9.
function get_word_count(str) {
  if (str.length == 0) {
    return 0;
  } else {
    return str.match(/\S+/g).length;
  }
}

// Takes an array as input, and returns the sum 
// of the array as output.
// Ex: The array sum of [0, 1, 2, 3] is 6.
// array_sum([0, 1, 2, 3]) = 6
function array_sum(arr) {
  return arr.reduce(function(a, b) {
    return a + b;
  });
}
/* CSC 412 - Developed functions */
var wordCount_pieces = setInterval(speaking_rate_pieces, 2000); // 5 sec
var wordCount_array = [];

function speaking_rate_pieces(){
    var delta;
    if (recognizing && final_transcript != ''){
        // push number of words to the array and gets the length of the new array
        var array_length = wordCount_array.push(get_word_count(final_transcript));

        if (array_length >= 2){
            delta = wordCount_array[array_length-1] - wordCount_array[array_length-2];
            // if it has passed 6 seconds and nothing happend, we assume user has finished speaking
            if (delta == 0) recognition.stop();
            wordCount_array = [];
        }
        //debugging line
        console.log(wordCount_array);
    }
    else{ //(!recognizing)
        wordCount_array = [];
    }
}
