const jsPsych = initJsPsych();

// DEMO

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
                  before continuing to the next page.</p>`
	   ],
    show_clickable_nav: true   
}

const adjust_volume = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: "sound/adjust_volume.wav",
    choices: ['q'],
    response_ends_trial: true,
    trial_ends_after_audio: true,
    response_allowed_while_playing: true,
    prompt: "please adjust your volume and follow the audio instruction"
}

const check_audio = {
    timeline: [adjust_volume],
    loop_function: function(data){
	if (jsPsych.pluginAPI.compareKeys(data.values()[0].response, 'q')){
	    return false;
	} else {
	    return true;
	}
    }
}


const context_audio = {
    type: jsPsychAudioKeyboardResponse,
    stimulus: "sound/DC2.wav",
    choices: jsPsych.NO_KEYS,
    trial_ends_after_audio: true,
    data: {
	condition: 'DISFLUENT',
    }
}

const stimulus_audio = {
    type: jsPsychAudioButtonResponse,
    stimulus: "sound/GK/GK_F0_7_VOT_7.wav",
    choices: jsPsych.randomization.repeat(['GIFT', 'KIFT'],1),
    data: {
	VOTdegree: 7,
    }
}

const OneTrial = {
    timeline: [welcome, check_audio, context_audio, stimulus_audio]
}

    
jsPsych.run([OneTrial]);
 
