# Andrea's IFTTT Webhook

Simple IFTTT webhook with some useful features.

## Create Google Fit Data Source

```json
{
  "dataStreamName": "IFTTTWebhookHydration",
  "type": "raw",
  "application": {
    "detailsUrl": "https://ifttt-webhook.vercel.app",
    "name": "IFTTT Webhook",
    "version": "1"
  },
  "dataType": {
    "name": "com.google.hydration",
    "field": [
      {
        "name": "volume",
        "format": "floatPoint",
        "optional": false
      }
    ]
  }
}
```
