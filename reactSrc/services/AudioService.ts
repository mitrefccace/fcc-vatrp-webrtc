import { RefObject, createRef } from 'react';
let ringingSoundSrc = 'audio/ring.wav'
let newMessageSoundSrc = 'audio/newmsg.wav'

export default class AudioService {

	audioRef : RefObject<HTMLAudioElement>;
	
	sounds: Map<string, string>;
	constructor() {
		this.audioRef = createRef();
		this.sounds = new Map(
			[
				['ringing', ringingSoundSrc],
				['newMsg', newMessageSoundSrc]
			]
		)
	}

  play(name: string) {
		let soundSrc = this.sounds.get(name);
		if(soundSrc && this.audioRef.current) {
			let audio = this.audioRef.current;
			audio.src = soundSrc;
			audio.loop = true;
			audio.currentTime = 0.0;
			audio.volume = audio.volume || 1.0;
			audio.play();
		}
	}
	
	stop() {
		if(this.audioRef.current) {
			let audio = this.audioRef.current;
			audio.pause();
			audio.currentTime = 0.0;
		}
	}
}