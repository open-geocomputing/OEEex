# OEEex
A chrome extension to enhance Google Earth Engine code editor

## The Confirm Manager
The confirm manager allows overloading the default confirm function and return 'ok' for any message containing a given key.

The manager allows to increment and decrement a counter for a given key. When the counter for this specific key reaches 0 again the overload is stopped, and the default behavior is back.

### Technical implementation
The manager is controlled my printing a structured message in the console. This message is to analyze the chrome extension and is automatically removed. Due to the asynchronous design of JavaScript, the management can take a quick delay. Therefore, use of function with confirming the message needs to be done in an asynchronous call, like ".evaluate()" or "setTimeout"

The use of the console to communicate allows the users without the extension to still use the code (but validate the confirm messages manually)

### Increase the counter for a key
```javascript
	OEEex_AddonManager:removeConfirmRetain:theKeyText
```

### Decrease the counter for a key
```javascript
	OEEex_AddonManager:removeConfirmRelease:theKeyText
```

### Reset the confirm manager
```javascript
	OEEex_AddonManager:resetConfirm
```

### Activate verbose 
Allow to keep the message in the console, typically to debug a script. With status (true OR false)
```javascript
	OEEex_AddonManager:removeConfirmRetain:Status
```
