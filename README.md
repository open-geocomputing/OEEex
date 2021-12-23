# OEEex
A chrome extension to enhance Google Earth Engine code editor

## The Confirm Manager
The confirm manager allows overloading the default confirm function and return 'ok' in for any message containing a given key.

The manger allows to increment and decrement a counter for a given key, when counter for this specific key reach again 0 the overload is stopped, and the default behavior is back.

### Technical implementation
The manager is controlled my printing structured message in the console. This message is to analyze the chrome extension and automatically removed. Due to the asynchronous design of JavaScript, the management can take a quick delay. Therefore, use of function with confirming the message needs to be done in an asynchronous call, like ".evaluate()" or "setTimeout"

The use of the console to communicate allow the users without the extension to still use the code (but validate manually the confirm messages)

### Increase the counter for a key
```javascript
	OEEex_AddonConfirmManager:removeConfirmRetain:theKeyText
```

### Decresing the counter for a key
```javascript
	OEEex_AddonConfirmManager:removeConfirmRelease:theKeyText
```

### Reset the confirm manager
```javascript
	OEEex_AddonConfirmManager:resetConfirm
```

### Actiavte verbose 
Allow to keep the message in the console, typically to debug a script. With status (true OR false)
```javascript
	OEEex_AddonConfirmManager:removeConfirmRetain:Status
```
