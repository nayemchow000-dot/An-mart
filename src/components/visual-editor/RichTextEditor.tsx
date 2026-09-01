import { useEffect } from 'react';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { Mic, MicOff } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  language?: 'bn-BD' | 'en-US';
}

export default function RichTextEditor({ value, onChange, placeholder, language = 'bn-BD' }: RichTextEditorProps) {
  const { isListening, transcript, startListening, setTranscript } = useVoiceInput(language);

  useEffect(() => {
    if (transcript) {
      // Append transcript to the current value safely
      const newValue = value ? `${value} ${transcript}` : transcript;
      onChange(newValue);
      setTranscript(''); // Clear after appending
    }
  }, [transcript, value, onChange, setTranscript]);

  return (
    <div className="relative">
      <div className="absolute right-2 top-2 z-10">
        <button
          type="button"
          onClick={startListening}
          className={`p-2 rounded-full flex items-center justify-center transition-colors shadow-sm ${
            isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="Voice to Text"
        >
          {isListening ? <Mic size={16} /> : <MicOff size={16} />}
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Start typing or use voice...'}
        className="w-full min-h-[150px] p-4 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#c2a578]/50 focus:border-[#c2a578] resize-y text-gray-800"
      />
    </div>
  );
}
