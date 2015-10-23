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
            recognition.stop();
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
/*        if (ignore_onend) {
            return;
        }*/
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
        if (agent_waiting){
            console.log("reached here in the onend function. final_transcript: "+final_transcript);
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
msg.voice = voices[0]; // Note: some voices don't support altering params
msg.voiceURI = 'native';
msg.volume = 1; // 0 to 1
msg.rate = 0.7; // 0.1 to 10
msg.pitch = 0.8; //0 to 2
msg.lang = 'en-US';

msg.onend = function(e) {
    // when finished speaking, call run_machine
    run_machine();
};


/*  This represents a state machine which is defined in the report for this homework
    under the "Automated Agent" item.*/

var current_state = 0;
var state; //state placeholder
var agent_waiting = false;
var invalid_answer_count = 0;

var agent_state_machine = {
    0: {'action':'speak',
        'text':'Welcome to Internet Provider Auto Service',
        'input_map':{'null':1},
        'screen_output':'Welcome to Internet Provider Auto Service<br/><br/>'},
    1: {'action':'speak',
        'text':'Enter a menu by saying one of the listed options',
        'input_map':{'null':2},
        'screen_output':'Main Menu:<br/>1 - Account Information<br/>2 - Technical Support<br/>3 - Product Information<br/><br/>'},
    2: {'action':'listen',
        'input_map':{'account information':3,'technical support':12,'product information':20},
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
        'input_map':{'yes':7,'No':1},
        'screen_output':'Your current balance is 20 dollars.<br/>Do you want to pay your balance now?<br/><br/>'},
    7: {'action':'speak',
        'text':'Please provide your credit card number',
        'input_map':{'null':8},
        'screen_output':''},
    8: {'action':'listen',
        'text':'',
        'input_map':{'valid':9,'invalid':8},
        'screen_output':'Please provide your credit card number (12 digits)<br/><br/>'},
    9: {'action':'speak',
        'text':'Please provide your credit card security code',
        'input_map':{'null':10},
        'screen_output':''},
    10:{'action':'listen',
        'text':'',
        'input_map':{'valid':11,'invalid':10},
        'screen_output':'Please provide your credit card security number (3 digits)<br/><br/>'},
    11:{'action':'speak',
        'text':'Thank you for pruchasing using Internet Provider auto service',
        'input_map':{'null':'end'},
        'screen_output':'Thank you for purchasing using Internet Provider auto service<br/>'},
    12:{'action':'speak',
        'text':'Techinical Support Selected. Please, describe your problem.',
        'input_map':{'null':13},
        'screen_output':'Technical Support Selected:<br/>Please, describe your problem<br/><br/>'},
    13:{'action':'listen',
        'input_map':{'null':14},
        'screen_output':''},
    14:{'action':'speak',
        'text':'Did you try turninig it off and on?',
        'input_map':{'null':15},
        'screen_output':'Ok. got it.<br/>Have you tried restarting it? (yes / no)<br/><br/>'},
    15:{'action':'listen',
        'input_map':{'yes':19,'No':16},
        'screen_output':''},
    16:{'action':'speak',
        'text':'OK. Try turning it off and on, then. Did it work?',
        'input_map':{'null':17},
        'screen_output':'Try turning of and on. Did it work? (yes / no)<br/><br/>'},
    17:{'action':'listen',
        'input_map':{'yes':18,'No':19},
        'screen_output':''},
    18:{'action':'speak',
        'text':'I am glad I was able to help you out.',
        'input_map':{'null':'end'},
        'screen_output':'I am glad I was able to help you out.<br/><br/>'},
    19:{'action':'speak',
        'text':'I will transfer you to an assistant. Wait a minute, please...',
        'input_map':{'null':'end'},
        'screen_output':'I will transfer you to an assistant. Wait a minute, please...<br/><br/>'},
    20:{'action':'speak',
        'text':'These are the available products... Do you like to buy one of them?',
        'input_map':{'null':21},
        'screen_output':'Products:<br/>1 - Router 3000<br/>2 - Wifi Extender<br/>3 - Switch<br/>4 - Broadband Modem<br/><br/>Do you like to buy one of them?'},
    21:{'action':'listen',
        'input_map':{'yes':22,'no':'end'},
        'screen_output':''},
    22:{'action':'speak',
        'text':'Which product are you intereseted in?',
        'input_map':{'null':23},
        'screen_output':'Which product do you want to buy?<br/><br/>'},
    23:{'action':'listen',
        'input_map':{'router 3000':7,'wifi extender':7,'switch':7,'broadband modem':7},
        'screen_output':''},
    24:{'action':'speak',
        'text':'Product does not exist. Please, select one of the products listed above.',
        'input_map':{'null':23},
        'screen_output':'Product does not exist. Please, select one of the products listed above.<br/><br/>'},
 'end':{'action':'speak',
        'text':'Good bye',
        'screen_output':'Good bye<br/>'},
}

/************************************************************
    Triggers/stops listening inside the state machine
*************************************************************/
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


/************************************************************
    Validation functions
*************************************************************/

function product_validation(str){
    // verify if the states are the ones waiting for products names 
    if (current_state != 23)
        return false;
    
    //if product is one of the listed, it is valid
    if(['router 3000','wifi extender','switch','broadband modem'].indexOf(str) >= 0)
        return true;
    else
        return false;
}


function cc_validation(str){
    // verify if the states are the ones waiting for the credit card or csv number
    if (!([8,10].indexOf(current_state)>=0))
        return false;

    // convert text to number, if needed
    str.replace('one', '1');
    str.replace('two', '2');
    str.replace('three', '3');
    str.replace('four', '4');
    str.replace('five', '5');
    str.replace('six', '6');
    str.replace('seven', '7');
    str.replace('eight', '8');
    str.replace('nine', '9');
    str.replace('zero', '0');

    //test for credit cards
    if (current_state == 10){
        // test if it has 16 digits
        var result = /(\d\s*){16}/.test(str);
        if (result) return true;
    }


    //test for security code
    if (current_state == 8 ){
        // test if it has 3 digits
        var result = /(\d\s*){3}/.test(str);
        if (result) return true;
    }

    console.log('raw credit card number ' +str);

    // if none of the above happend, it is not a valid cc / csv
    return false;
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
            speechSynthesis.cancel();
            speechSynthesis.speak(msg);

            // update Agents Text box 
            if (state.screen_output != '')
                document.getElementById("agents_final_span").innerHTML += state.screen_output;

            //update the next state
            current_state = state.input_map['null'];

            // the next state is ran in the onend function of the speech object 
            // call the next state
            //run_machine();
        }else{
            // if it is not a speak action, it has to be listen, otherwise it is an error
            assert(state.action == 'listen',"invalid action type: " + state.action);

            console.log('Entered listen action in state: ' + current_state);

            if (typeof(user_input) == 'undefined'){
                // update Agents Text box 
                if (state.screen_output != '')
                    document.getElementById("agents_final_span").innerHTML += state.screen_output;
                document.getElementById("agents_final_span").innerHTML += "<br/><i>click on the microphone to answer the question</i><br/>";

                // call speech API
                //startButton(event);

                // activate agent waiting flag
                agent_waiting = true;

            }else{
                console.log("before trying to recognize:\nagent status: "+agent_waiting+" user input: "+user_input);
                if (user_input in state.input_map || cc_validation(user_input) || product_validation(user_input) || current_state == 13){
                    agent_waiting = false;
                    invalid_answer_count = 0

                    //special case on state 13, since I don't care about user's input
                    if (current_state == 13){
                        current_state = state.input_map['null'];
                    }else{
                        //if the answer was recognized, use it 
                        current_state = state.input_map[user_input];
                    }

                    document.getElementById("agents_final_span").innerHTML += "<i>User:</i> " + user_input +"<br/><br/>";
                    // go to the next state
                    run_machine();
                }else{
                    //if something was recognized but is not mapped, restart recognition
                    invalid_answer_count +=1
                    if (invalid_answer_count >=3){
                        document.getElementById("agents_final_span").innerHTML += "<br/>Sorry, I could not understand you. I'm transfering you to an available attendant<br/>";
                        current_state = 'end';
                        run_machine();
                    }else{
                        document.getElementById("agents_final_span").innerHTML += "<br/>Invalid answer. Try again<br/>";
                        startButton(event);
                    }
                }
            }

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
var wordCount_pieces = setInterval(finished_speaking, 3000); // 5 sec
var wordCount_array = [];

function finished_speaking(){
    if (recognizing && final_transcript != ''){
        recognition.stop();
        //debugging line
    }
}
