# Echo Bridge Browser Extension

![Travis (.com) branch](https://img.shields.io/travis/com/echoprotocol/bridge-extension/master?label=build%20master)
![Travis (.com) branch](https://img.shields.io/travis/com/echoprotocol/bridge-extension/develop?label=build%20develop)

Bridge is a tool designed to make running Echo dApps for people as easy as possible.

As an extension for browser, Bridge can act as a dedicated Echo wallet,
allowing to access and manage account data, manage multiple accounts, 
and use it for making, signing transactions & viewing account history.

The Echo Bridge is a bridge between a website that uses the Echo network 
and directly the Echo network itself. Implementing DApps using the extension, 
developers do not need to spend time implementing connections to network nodes, 
launching nodes, and managing user private keys, since all this has been 
moved to the Echo Bridge side.

## How To Use

On a site that is open in a browser with Echo Bridge, an object is available 
`window.echojslib`, which is initialized by the extension. Using this object 
you can communicate with the Echo node, work with user accounts, and also 
sign and send transactions to the network. 

Most actions that affect work with accounts and private keys must be confirmed 
by the user through the Bridge UI.

### Get access to use Bridge data

Before connecting to Bridge you should get access:

```javascript
/**
 * Get access
 * @returns {Promise.<Boolean>} status
 */
echojslib.extension.getAccess();
```

This method returns Promise which will be resolved when a user approves the request or rejected when failure.
This request should always go first, even if access has already been granted earlier.
In this case, the extension will not request access again and just resolves the promise.

### Connect to node  

There is an example of connecting to the node and subscribe to switch network 
(recommended to use inside `window.onload`)  

```javascript  
window.onload = async () => {
  // you do not need to use the isEchoBridge flag, 
  // but you can be sure that you did not override 
  // the variable above
  if (echojslib && echojslib.isEchoBridge) {

    /**
    * Get access
    */
    await echojslib.extension.getAccess();
    
    /**
    * Subscribe to current Echo network selected in Bridge
    */
    await echojslib.extension.subscribeSwitchNetwork(async () => {

      if (echojslib.echo.isConnected) {
        await window.echojslib.echo.disconnect();
      }

      /**
      * Connect to current Echo network selected in Bridge
      */
      await echojslib.echo.connect();

    });

  }
};  
```

Callback will be called, when network will be changed in extension.

Subscribe to change active account. Callback will be triggered when active account is changed

```javascript
echojslib.extension.subscribeSwitchAccount((account) => console.log(account))
```

### Get active account synchronously
```javascript
echojslib.extension.activeAccount
```
### Sign transaction with Bridge  

#### Transfer  

Simple example of creating and broadcasting transaction  

```javascript
const sendTransaction = async () => {
  /**
  * Create a transaction
  * @type {Transaction}
  */
  const tr = window.echojslib.echo.createTransaction();  

  /**
  * Add transfer operation
  */
  tr.addOperation(echojslib.constants.OPERATIONS_IDS.TRANSFER,  {   
    from:  "1.2.1",  
    to:  "1.2.2",   
    amount:  { asset_id:  "1.3.0", amount:  10  }
  });  

  /**
  * Sign the transaction with Bridge
  */
  await tr.signWithBridge();

  /**
  * Send the transaction to blockchain
  */
  await tr.broadcast(); 
}
```

#### Transaction Examples

See the [examples](./examples/examples.md) for more different transactions.

### Payload Signing
In order for the user to confirm ownership of the account's private key, the extension suggests using the proofOfAuthority method. The method provides an opportunity to sign payload by account private key. Because the raw signing can potentially sign transactions or even leak its private key we have to add an extra layer of encryption. So the extension will sign payload instead of raw data.

```javascript  
/**
* Get signature
* @returns {Promise.<String>} signature
*/
await echojslib.extension.proofOfAuthority('This is example message!', '1.2.134');
```

To verifying the signature use echojs-lib.

```javascript  
import { ED25519 } from 'echojs-lib';
import bs58 from 'bs58';

const signature = Buffer.from('757a8b60f4c348e8de49f8dc56563db5d9903be41c7aad145cc8be5c6f66804c168693232c0f150ef017bc01697fc0aca5000a04ac6756d36430aeaefe518b08', 'hex');
const message = Buffer.from('This is example message!', 'utf8');
const publicKey = bs58.decode('ECHOJDpsaMaR9qWM2922ZYvQ3xpavsN8oeNN8zBx1VNKdQBf'.slice(4));

ED25519.verifyMessage(signature, message, publicKey);
```

## License

The MIT License (MIT)

Copyright (c) Echo Technological Solutions LLC

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
