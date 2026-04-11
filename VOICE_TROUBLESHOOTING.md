# Voice Command Troubleshooting Guide

## Voice Transcription Methods

The system uses **three methods** in priority order for maximum reliability:

### 1. **OpenAI Transcription** (Primary - RECOMMENDED) 🤖
- **Model**: `gpt-4o-mini-transcribe`
- **API Key**: Same as ChatGPT (`VITE_OPENAI_API_KEY`)
- **Quality**: Highest accuracy, campus-aware prompting
- **Requirements**: OpenAI API key, microphone permission
- **Cost**: ~$0.0001 per second of audio (very affordable)

### 2. **HuggingFace FastAPI** (Fallback 1 - Optional) 🌐
- **Endpoint**: Custom FastAPI deployment
- **API Key**: Separate HF key (`VITE_HF_API_KEY`)
- **Quality**: Good, but may have availability issues
- **Requirements**: HF API key, microphone permission

### 3. **Browser Speech Recognition** (Fallback 2 - Last Resort) 🌍
- **Type**: Native browser API
- **API Key**: None required
- **Quality**: Variable, works offline
- **Requirements**: Modern browser (Chrome/Edge/Safari)

## Common Issues and Solutions

### 1. **Microphone Permission Denied** 🎤
**Symptoms:** Error message "Microphone access denied"

**Solutions:**
- Click the microphone icon in your browser's address bar
- Select "Allow" for microphone access
- Reload the page after granting permission
- Check browser settings: `chrome://settings/content/microphone` (Chrome) or `about:preferences#privacy` (Firefox)

### 2. **HTTPS Required** 🔒
**Symptoms:** Error message about HTTPS or secure connection

**Solutions:**
- Voice recognition requires HTTPS or localhost
- **Current dev server:** `http://localhost:5174/` ✅ Should work
- If accessing from another device on network, use: `https://your-ip:5174`
- For production, ensure site is served over HTTPS

### 3. **No Microphone Detected** 🎙️
**Symptoms:** "No microphone found" error

**Solutions:**
- Connect a microphone or headset
- Check device settings to ensure microphone is enabled
- Windows: Settings → Privacy → Microphone → Allow apps to access microphone
- Try a different browser (Chrome/Edge recommended)

### 4. **OpenAI API Issues** 🔑
**Symptoms:** "Invalid OpenAI API key", "rate limit exceeded"

**Current Configuration:**
```
VITE_OPENAI_API_KEY=sk-***  (Used for BOTH ChatGPT AND transcription)
```

**Solutions:**
- **Invalid Key**: Verify your API key at https://platform.openai.com/api-keys
- **Rate Limit**: Wait 1 minute and try again, or upgrade your OpenAI plan
- **No Billing**: Add payment method at https://platform.openai.com/account/billing
- **System automatically uses OpenAI transcription as primary method**
- FastAPI is now optional fallback only
- Check browser console for detailed error messages

### 6. **FastAPI Endpoint Issues** 🌐
**Symptoms:** Transcription fails, timeout errors

**Current Configuration:**
```
VITE_FASTAPI_TRANSCRIBE_URL=https://veccode-wish.hf.space/transcribe
VITE_HF_API_KEY=hf_***
```

**Solutions:**
- Check if the endpoint is accessible: https://veccode-wish.hf.space/transcribe
- Verify HuggingFace API key is valid
- System automatically falls back to browser speech recognition if FastAPI fails
- Check browser console for detailed error messages

### 5. **Browser Compatibility** 🌍
**Supported Browsers:**
- ✅ Chrome/Edge (Recommended - best support)
- ✅ Safari (iOS/macOS - with permissions)
- ⚠️ Firefox (limited Web Speech API support)
- ❌ Older browsers (may not support MediaRecorder/SpeechRecognition)
7
### 6. **No Audio Captured** 📢
**Symptoms:** "No audio detected" message

**Solutions:**
- Speak clearly and close to the microphone
- Check microphone volume in system settings
- Test microphone in another app to verify it's working
- Reduce background noise
- Try increasing recording duration (speak for 2-3 seconds)

## Testing Voice Commands

### Test Procedure:
1. Open the app: `http://localhost:5174/`
2. Click "AI Voice Command" on Welcome Modal
3. Click the microphone button (🎤)
4. **Grant microphone permission** when prompted
5. Speak clearly: "Take me to BUP Gym"
6. Check browser console for diagnostic messages

### Console Diagnostics:
Open browser DevTools (F12) and look for these messages:
```OpenAI configured: true/false
[Conversation Voice] HF configured: true/false
[Conversation Voice] FastAPI supported: true/false
[Conversation Voice] Browser speech supported: true/false
[Conversation Voice] Using OpenAI transcription (priority 1)...
[Conversation Voice] Requesting microphone permissions...
[Microphone] Microphone access granted
[Conversation Voice] Audio captured, transcribing with OpenAI...
[OpenAI] Transcription successful: "take me to the gym"
[Conversation Voice] Audio captured, transcribing...
```

## Current Configuration Check

Run this in your browser console on the app page:
```javascript
// Check voice support
console.log('MediaRecorder:', typeof MediaRecorder !== 'undefined');
console.log('getUserMedia:', !!(navigator.mediaDevices?.getUserMedia));
console.log('SpeechRecognition:', 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
console.log('HTTPS/Localhost:', location.protocol === 'https:' || location.hostname === 'localhost');

// Request microphone to test permissions
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(() => console.log('✅ Microphone access granted'))
  .catch(err => console.error('❌ Microphone error:', err.message));
```
Simplest Setup (RECOMMENDED):
Only configure OpenAI API key in `.env.local`:
```bash
VITE_OPENAI_API_KEY=sk-your-key-here
```
This enables both ChatGPT conversation AND voice transcription with one key!

### 
## Quick Fixes

### Reset Microphone Permissions:
**Chrome:**
1. Click the lock/info icon in address bar
2. OpenAI transcription is causing issues, temporarily disable it by commenting out the API key in `.env.local`:
```bash
# VITE_OPENAI_API_KEY=sk-***
```
This forces the system to skip OpenAI and try HuggingFace or browser-native speech recognition.

### Check OpenAI API Status:
```bash
# Test if your API key works
curl https://api.openai.com/v1/models \\
  -H "Authorization: Bearer $VITE_OPENAI_API_KEY"
```

### Verify Environment Variables:
```bash
cat .env.local
```

Expected for full functionality:
- ✅ `VITE_OPENAI_API_KEY` - For ChatGPT AI and transcription (REQUIRED)
- ⚠️ `VITE_HF_API_KEY` - For fallback transcription (OPTIONAL)
- ⚠️ `VITE_FASTAPI_TRANSCRIBE_URL` - Fallback endpoint (OPTIONAL)

### Check Environment Variables:
```bash
cat .env.local
```

Expected variables:
- ✅ `VITE_OPENAI_API_KEY` - For ChatGPT AI
- ✅ `VITE_HF_API_KEY` - For audio transcription
- ✅ `VITE_FASTAPI_TRANSCRIBE_URL` - Transcription endpoint
