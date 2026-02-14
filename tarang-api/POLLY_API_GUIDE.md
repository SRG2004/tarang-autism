# Amazon Polly Text-to-Speech API Guide

## Endpoint

```
POST /polly/synthesize
```

## Authentication

Requires JWT Bearer token in Authorization header.

## Request Body

```json
{
  "text": "I often notice small sounds when others do not",
  "language": "en-IN"
}
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string | Yes | - | Text to synthesize (max ~3000 characters) |
| `language` | string | No | `en-IN` | Language code for voice selection |

### Supported Languages

| Language | Code | Voice | Engine |
|----------|------|-------|--------|
| English (India) | `en-IN` | Aditi | Neural |
| Hindi | `hi-IN` | Aditi | Neural |
| Tamil | `ta-IN` | Aditi | Standard |
| Telugu | `te-IN` | Aditi | Standard |
| Bengali | `bn-IN` | Aditi | Standard |
| Kannada | `kn-IN` | Aditi | Standard |
| Marathi | `mr-IN` | Aditi | Standard |
| Gujarati | `gu-IN` | Aditi | Standard |

## Response

Returns an MP3 audio stream with the following headers:

```
Content-Type: audio/mpeg
Content-Disposition: inline; filename=speech.mp3
Cache-Control: no-cache
```

## Example Usage

### cURL

```bash
curl -X POST "http://localhost:8000/polly/synthesize" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I often notice small sounds when others do not",
    "language": "en-IN"
  }' \
  --output speech.mp3
```

### JavaScript (Frontend)

```javascript
const token = localStorage.getItem('token');
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const response = await fetch(`${apiUrl}/polly/synthesize`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    text: "I often notice small sounds when others do not",
    language: "en-IN"
  })
});

const audioBlob = await response.blob();
const audioUrl = URL.createObjectURL(audioBlob);
const audio = new Audio(audioUrl);
await audio.play();
```

### Python

```python
import requests

token = "YOUR_JWT_TOKEN"
url = "http://localhost:8000/polly/synthesize"

response = requests.post(
    url,
    headers={"Authorization": f"Bearer {token}"},
    json={
        "text": "I often notice small sounds when others do not",
        "language": "en-IN"
    }
)

with open("speech.mp3", "wb") as f:
    f.write(response.content)
```

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 503 Service Unavailable
```json
{
  "detail": "Amazon Polly service unavailable. Please check AWS credentials."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Speech synthesis failed: InvalidParameterValue"
}
```

## AWS Configuration

### Required Environment Variables

```env
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=ap-south-1
```

### Required IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "polly:SynthesizeSpeech"
      ],
      "Resource": "*"
    }
  ]
}
```

## Performance Considerations

- **Latency:** ~500ms-2s depending on text length and region
- **Audio Size:** ~1KB per second of speech
- **Rate Limits:** AWS Polly has default limits of 100 TPS (transactions per second)
- **Caching:** Consider caching common phrases to reduce API calls

## Best Practices

1. **Text Length:** Keep text under 3000 characters for optimal performance
2. **Error Handling:** Always implement fallback UI if synthesis fails
3. **Cleanup:** Release audio URLs with `URL.revokeObjectURL()` after playback
4. **User Feedback:** Show loading state while audio is being generated
5. **Accessibility:** Provide visual indication when audio is playing

## Troubleshooting

### Audio Not Playing
- Check browser console for errors
- Verify JWT token is valid
- Ensure AWS credentials are configured
- Check CORS settings allow audio streaming

### Poor Audio Quality
- Verify using Neural engine for en-IN and hi-IN
- Check text doesn't contain special characters
- Ensure proper language code is used

### Slow Response
- Check AWS region (should be ap-south-1 for India)
- Verify network connectivity
- Consider implementing audio caching

## Future Enhancements

- [ ] Support for SSML (Speech Synthesis Markup Language)
- [ ] Voice customization (speed, pitch, volume)
- [ ] Audio caching with Redis
- [ ] Batch synthesis for multiple questions
- [ ] Streaming audio for long texts
- [ ] Support for more Indian language voices
