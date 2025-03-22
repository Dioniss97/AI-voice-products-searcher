export function speak(text: string) {
  console.log('Starting text-to-speech with text:', text);
  
  return new Promise<void>((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    
    utterance.onstart = () => {
      console.log('Speech synthesis started');
    };
    
    utterance.onend = () => {
      console.log('Speech synthesis completed');
      resolve();
    };
    
    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      reject(error);
    };
    
    window.speechSynthesis.speak(utterance);
  });
}