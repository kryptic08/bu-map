# Voice Transcription Accuracy Improvements

## Issues Fixed

### ✅ Added Campus Context to OpenAI Transcription
- **Before**: No prompt passed to OpenAI model
- **After**: Includes building names and campus context to improve accuracy
- **Impact**: AI model now understands campus-specific terminology

### ✅ Extended Audio Capture Duration
- **Before**: 5 seconds (too short for complex commands)
- **After**: 8 seconds (allows more natural voice commands)
- **Impact**: Users have more time to speak their destination

### ✅ Consistent Duration for All Methods
- OpenAI: 8 seconds
- FastAPI: 8 seconds
- Browser Speech: Uses default

## Additional Optimization Tips

### 1. **Check Environment Variables**
Ensure these are set in `.env.local`:
```
VITE_OPENAI_API_KEY=sk-your-key-here
VITE_HF_API_KEY=hf_your-key-here  (optional)
VITE_FASTAPI_TRANSCRIBE_URL=https://your-endpoint.com/transcribe  (optional)
```

### 2. **Microphone Configuration**
- Use a quality microphone or headset with built-in mic
- Speak clearly and naturally
- Minimize background noise
- Test in a quiet environment first

### 3. **Browser Settings**
- Use Chrome/Edge (best voice API support)
- Ensure microphone permission is granted
- Check browser console for detailed error messages (F12 → Console)

### 4. **Voice Activity Detection (VAD) Tuning**
If using VAD module in `src/utils/voiceActivityDetection.ts`, adjust these settings:
```typescript
speechThreshold: 20,        // Lower = more sensitive (10-30 recommended)
silenceDuration: 1500,      // Pause duration before ending (ms)
minSpeechDuration: 500,     // Minimum speech to detect (ms)
maxRecordingDuration: 10000 // Maximum per recording (ms)
```

### 5. **Testing Your Setup**
Open `voice-test.html` to test:
- Microphone access
- Audio capture
- Transcription quality
- All three transcription methods

### 6. **Common Phrases to Test**
After improvements, test with:
- "Take me to College of Engineering"
- "Navigate to Ell Hall"
- "Show me the way to BU Central"

## Fallback Chain

Your app uses a 3-tier transcription system:

1. **OpenAI Whisper** (Recommended) ✅
   - Best accuracy
   - Campus-aware with context
   - Requires API key

2. **FastAPI** (Optional fallback)
   - Good accuracy
   - Requires separate endpoint
   - Falls back if OpenAI fails

3. **Browser Speech Recognition** (Last resort)
   - Works offline
   - Less accurate for complex commands
   - Variable by browser

## Debugging Tips

### Check Console Logs
Open browser DevTools (F12) and look for:
- `[Conversation Voice]` logs showing transcription flow
- `[OpenAI Transcription]` logs for API responses
- Any errors with `[ERROR]` prefix

### Test Commands
Try these increasingly complex commands:
1. Simple: "Engineering"
2. Moderate: "Go to College of Engineering"
3. Complex: "I need directions to the Boston University College of Engineering building"

## Next Steps if Issues Persist

1. **Verify OpenAI API key** - Check https://platform.openai.com/account/usage
2. **Check rate limits** - OpenAI might rate-limit requests
3. **Test with voice-test.html** - Isolate transcription from routing logic
4. **Enable debug mode** - Add more console.log statements
5. **Try browser fallback** - Temporarily disable OpenAI to test browser API

## Files Modified

- `src/App.tsx` - Updated transcription calls with campus context and longer timeouts
