const jsPsych = initJsPsych({
    show_progress_bar: true,
    auto_update_progress_bar: false,
    on_finish: function() {
	window.location.assign("https://universityofedinburgh-ppls.sona-systems.com/webstudy_credit.aspx?experiment_id=643&credit_token=2cf60d81805d455c9e65772ee1fecd5d&survey_code="+sona_id);
    }
});

// pick up sona ID
const sona_id = jsPsych.data.urlVariables()['sona_id'];


// CONSENT
// =======

// consent form (uses approach on
// https://www.jspsych.org/plugins/jspsych-external-html/)
const check_consent = function(elem) {
    if (document.getElementById('consent_checkbox').checked) {
	return true;
    } else {
	alert("If you wish to participate, you must check the box next to the statement 'I agree to participate in this study.'");
	return false;
    }
    return false;
};

const consent = {
    type: jsPsychExternalHtml,
    url: 'consent.html',
    cont_btn: 'start',
    check_fn: check_consent
};



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
			    shortID: short_id,
			    SONA: sona_id
			   });


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


function make_preload_list(){
    let preload_list=[];
    for (c of factors.phrase) {
	let fn=context_stimulus(c);
	preload_list.push(fn);
    }
    for (t of factors.target) {
	let fn=target_stimulus(t);
	preload_list.push(fn);
    }
    return (preload_list);
}
    
// EXPERIMENTAL DESIGN
// ===================

const practice = [
	{ phrase: "FC1", target: "DT1" },
	{ phrase: "FC3", target: "DT8" }
];


// const factors = {
//     phrase: ["DC1","DC2","DC3","DC4","FC1","FC2","FC3","FC4"],
//     target: ["GK1","GK2","GK3","GK4","GK5","GK6","GK7","GK8",
// 	     "KG1","KG2","KG3","KG4","KG5","KG6","KG7","KG8"]
// }

const factors = {
     phrase: ["DC1","FC1",],
     target: ["GK3","GK7",
	     "KG4","KG5"]
 }

const fullDesign = jsPsych.randomization.factorial(factors,1);

const exp_length = fullDesign.length + practice.length + 3;

const preload = {
    type: jsPsychPreload,
    audio: () => make_preload_list(),
    error_message: `<h1>Error</h1>
                    <p>Can't find the resources for this experiment.</p>
                    <p>Please report this error to <a href="mailto:Martin.Corley@ed.ac.uk">Martin.Corley@ed.ac.uk</a>.</p>`
}

const get_device = {
    type: jsPsychSurveyMultiChoice,
    preamble: `<p>Thanks for pressing "Q".</p><p>One quick question which may help us analyse the data:</p>`,
    questions: [
	{
	    prompt: "How are you listening to audio?",
	    name: "audio_device",
	    options: ['Headphones', 'Earbuds', 'Speakers'],
	    required: true,
	    horizontal: true
	}
    ]
}

const full_screen =  {
    type: jsPsychFullscreen,
    message: `<p>Thank you.</p>
              <p>We will now switch to fullscreen mode, after which
              you will be able to read detailed instructions for the experiment.
</p>`,
    fullscreen_mode: true,
    on_finish: () => {
	jsPsych.setProgressBar(2/exp_length);
    }
};

const off_screen = {
    type: jsPsychFullscreen,
    fullscreen_mode: false
};


const welcome = {
    type: jsPsychInstructions,
    pages: [`<h1>Important</h1>
             <p>To claim your course credit for this experiment, click on the <span style="color:orange">orange button</span> on the final screen.</p>`,
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
    show_clickable_nav: true,
    on_start: () => {
	jsPsych.setProgressBar(0);
    }
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

const instructions1 = {
    type: jsPsychInstructions,
    pages: [
	    `<h1>Instructions</h1>
             <p>This is a very simple experiment:  It involves listening to some words, and telling us what you hear.</p>
             <p>You might hear something like</p>
             <div style="align: center; padding-above: 10px; padding-below: 10px; font-size: 36px; color: orange">the next word is dest</div>
             <p>and then get asked whether you heard 'DEST' or 'TEST'</p>`,
	`<p>You'll see two buttons; just click on what you think you heard.</p><p>We're not trying to trick you, so if you're not sure, give it your best guess.</p>`,
	    `<p>We'll start with a practice just so you know how everything works.</p><p>Click 'Next' when you're ready to listen to your first word.</p>`
	   ],
    show_clickable_nav: true   
}

const instructions2 = {
    type: jsPsychInstructions,
    pages: [
	    `<h2>End of Practice</h2>
             <p>Simple, eh?  Now you know how everything works, we'll rattle through the experiment.</p>
             <p>Remember:  We're not trying to trick you!</p>
             <p>There are quite a few words to listen to (we need them for the data analysis) so please stick with it.</p>`
    ],
    show_clickable_nav: true   
}

const instructions3 = {
    type: jsPsychInstructions,
    pages: [
	`<h2>Nearly Finished</h2>
         <p>That's the main part of the experiment finished.</p>
         <p>Next, we'd like you to answer a couple of questions about yourself.</p>`
    ],
    show_clickable_nav: true
}

const qp1 = {
	type: jsPsychSurveyText,
	preamble: '<h2>About You</h2>',
	questions: [
	    {prompt: 'What is your age in years?&nbsp;*',
	     columns: 3,
	     required: true,
	     name: 'subject_age',
	    },
	    {prompt: 'Which country do you normally live in?&nbsp;*',
	     required: true,
	     name: 'subject_country',
	    },
	    {prompt: 'What is/are the languages you first spoke?&nbsp;*',
	     required: true,
	     name: 'subject_native_lang',
	    },
	    {prompt: 'Please list any other languages you speak fluently',
	     name: 'subject_other_lang',
	    },
	    {prompt: 'What is your gender (e.g., male, female, nonbinary)?',
	     name: 'subject_gender',
	    }
	]
};


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
	} else if (prefix === 'KG') {
	    choices=['GISS','KISS'];
	} else {
	    choices=['TEST','DEST'];
	}
	return(choices);
    },
    on_finish: () => {
	let current_pbar = jsPsych.getProgressBarCompleted();
	jsPsych.setProgressBar(current_pbar + 1/exp_length);
    }
}

const prac_trials = {
    timeline: [context_audio, stimulus_audio],
    timeline_variables: practice
}   


const exp_trials = {
    timeline: [context_audio, stimulus_audio],
    timeline_variables: fullDesign
}

const save_data = {
    type: jsPsychCallFunction,
    func: function()
    {
	saveData("DATA_".concat(subject_id),jsPsych.data.get().csv())
    }
}

const debrief = {
    type: jsPsychHtmlButtonResponse,
    choices: ['CLICK TO CLAIM COURSE CREDIT'],
    button_html: `<button style="display: inline-block; padding: 6px 12px; margin: 0px; font-weight: 400; font-family: 'Open Sans', 'Arial', sans-serif; cursor: pointer; line-height: 1.4; text-align: center; white-space: nowrap; vertical-align: middle; background-image: none; border: 1px solid transparent; border-radius: 4px; background-color:orange; color:white; font-size:24px">%choice%</button>`,
    stimulus: '<h2>The experiment has now concluded.</h2><p>This experiment was all about attention and speaker disfluency (<em>um</em>s and <em>er</em>s). We believe that when a speaker is disfluent, listeners automatically pay more attention to what they are saying (perhaps because they know something\'s "gone wrong".  In this experiment, that means that as a listner you should have been less likely to accept some of the carefully-manipulated words (like "giss") as a real word ("kiss") when the speaker was being disfluent.</p><p>We\'ll report our findings at <a href="https://osf.io/rvp48/">osf.io/rvp48/</a>.</p><p>Thanks for your help! If you know anyone else who\'s taking part, we\'d appreciate it if you didn\'t explain the purpose to them before they\'ve done the experiment, as it might affect the results.</p><p>If you have any questions, please contact <a href="mailto:Martin.Corley@ed.ac.uk?subject=Disfluency%20Experiment '+short_id+'">Martin Corley.</a></p>',
    on_start: () => {
	jsPsych.setProgressBar(1);
    }
};

const experiment = {
    timeline: [preload,consent,welcome, check_audio, get_device, full_screen, instructions1,prac_trials,instructions2,exp_trials,instructions3,qp1,save_data,off_screen,debrief]
}

  
jsPsych.run([experiment]);
 
