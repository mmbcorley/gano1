const jsPsych = initJsPsych();

// UTILITY FUNCTIONS AND SETUP
// ===========================

// function to save data (works in conjunction with write_data.php)
function saveData(name, data){
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'write_data.php'); // 'write_data.php' is the
					// path to the php file
					// described above.
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({filename: name, filedata: data}));
}

// set up random ppt ID (15 char)
const subject_id = jsPsych.randomization.randomID(15);
const short_id = subject_id.substring(0,4); // for data protection

// add the ID variables to the dataset
jsPsych.data.addProperties({subject: subject_id,
			    shortID: short_id});

// EXPERIMENTAL DESIGN
// ===================

const factors = {
    phrase: ["DC1","DC2","DC3","DC4","FC1","FC2","FC3","FC4"],
    target: ["GK1","GK2","GK3","GK4","GK5","GK6","GK7","GK8",
	     "KG1","KG2","KG3","KG4","KG5","KG6","KG7","KG8"]
}

const fullDesign = jsPsych.randomization.factorial(factors,1);

const full_screen =  {
    type: jsPsychFullscreen,
    message: `<p>"Q" pressed: Thank you.</p>
              <p>We will now switch to fullscreen mode, after which
              you will be able to read detailed instructions for the experiment.
</p>`,
    fullscreen_mode: true
};

const off_screen = {
    type: jsPsychFullscreen,
    fullscreen_mode: false
};


const welcome = {
    type: jsPsychInstructions,
    pages: [
	    `<h1>Welcome</h1>
               <div align='center'><img src='img/listen.svg' alt="icons representing headphones, earbuds, and a loudspeaker"/></div>
               <p>In this experiment you will be asked to make judgements about the words that you hear.
                  Because the experiment relies on your ability to hear acoustic detail, <strong>it works best if you
                  are in a quiet place, and wear headphones.</strong>
                  If you don't have headphones, earbuds or decent computer speakers would be helpful.</p>
               <p>Please decide on what you are going to use, and check that your sound is working properly,
                  before continuing to the next page.</p>`,
	`<p>On the following page we will check that you can hear the audio for this experiment clearly.</p>
         <p>Please follow the spoken instructions that you will hear to continue.</p>`
	   ],
    show_clickable_nav: true   
}

/* provide a random array of choices for volume check */
const volumeChoices = jsPsych.randomization.repeat(['T','H','X','Q','P','S','W','M'],1);
const volumeIndex = volumeChoices.findIndex(letter => letter === 'Q');

const adjust_volume = {
    type: jsPsychAudioButtonResponse,
    stimulus: "sound/adjust_volume.wav",
    choices: volumeChoices,
    margin_vertical: "12px",
    response_ends_trial: true,
    trial_ends_after_audio: true,
    response_allowed_while_playing: true,
    prompt: "please adjust your volume and follow the audio instruction"
}

const check_audio = {
    timeline: [adjust_volume],
    loop_function: function(data){
	if (data.values()[0].response==volumeIndex){
	    return false;
	} else {
	    return true;
	}
    }
}


// const context_audio = {
//     type: jsPsychAudioKeyboardResponse,
//     stimulus: function() {
// 	let context=jsPsych.timelineVariable('phrase',true);
// 	return("sound/" + context + ".wav");
//     },
//     choices: jsPsych.NO_KEYS,
//     trial_ends_after_audio: true,
// }

// These two functions are defined here so that they can be used for
// preloading audio as well as for generating stimuli

function context_stimulus(context){
    return("sound/" + context + ".wav");
}

function target_stimulus(target){
    let prefix=target.slice(0,2);
    let vot=target.slice(2,3);
    return("sound/" + prefix + "/" + prefix + "_F0_" + vot + "_VOT_" + vot + ".wav");
}

const context_audio = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: () => context_stimulus(jsPsych.timelineVariable('phrase',true)),
    choices: jsPsych.NO_KEYS,
    trial_ends_after_audio: true,
}

const stimulus_audio = {
    type: jsPsychAudioButtonResponse,
    stimulus: () => target_stimulus(jsPsych.timelineVariable('target',true)),
    choices: () => {
	let target=jsPsych.timelineVariable('target',true);
	let prefix=target.slice(0,2);
	var choices;
	if (prefix === 'GK') {
	    choices=['GIFT','KIFT'];
	} else {
	    choices=['GISS','KISS'];
	}
	return(choices);
    },
}


const one_trial = {
    timeline: [context_audio, stimulus_audio],
    timeline_variables: fullDesign
}
    
const experiment = {
    timeline: [welcome, check_audio, full_screen, one_trial, off_screen]
}

    
jsPsych.run([experiment]);
 
