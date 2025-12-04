# To get the private and public keys - REPL command

```js
import webpush from 'web-push';
const keys = webpush.generateVAPIDKeys();
console.log(keys);
```