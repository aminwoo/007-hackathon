// This is a script to generate keyboard typing sounds
// You can run this in a browser console to generate the sound
// and then save it as an MP3 file

function generateKeyboardTypingSound() {
  // Create audio context
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const duration = 0.1; // Duration of each key press sound in seconds
  const numberOfKeyPresses = 20; // Number of key presses in the sound
  const bufferSize = audioContext.sampleRate * (duration * numberOfKeyPresses);
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  
  // Generate random typing sounds
  for (let i = 0; i < numberOfKeyPresses; i++) {
    const startSample = Math.floor(i * audioContext.sampleRate * duration);
    const endSample = Math.floor((i + 0.05) * audioContext.sampleRate * duration);
    
    // Generate a short click sound
    for (let j = startSample; j < endSample; j++) {
      // Random amplitude between -0.2 and 0.2
      data[j] = (Math.random() * 0.4 - 0.2);
    }
    
    // Add a small delay between key presses
    const delayStart = endSample;
    const delayEnd = Math.floor((i + 1) * audioContext.sampleRate * duration);
    
    for (let j = delayStart; j < delayEnd; j++) {
      // Very quiet background noise
      data[j] = (Math.random() * 0.01 - 0.005);
    }
  }
  
  // Create a source node from the buffer
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  
  // Connect the source to the destination (speakers)
  source.connect(audioContext.destination);
  
  // Start playing the sound
  source.start();
  
  // Export the buffer as a WAV file
  console.log("Generated keyboard typing sound. You can save it as an MP3 file.");
}

// Call the function to generate the sound
generateKeyboardTypingSound();
