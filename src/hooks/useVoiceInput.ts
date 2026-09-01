import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useVoiceInput(language = 'bn-BD') {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = useCallback(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Your browser does not support voice input. Try Google Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.success('Listening... Speak now.');
    };

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast.error('Microphone permission denied.');
      } else {
        toast.error('Error listening to voice.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [language]);

  return { isListening, transcript, startListening, setTranscript };
}
